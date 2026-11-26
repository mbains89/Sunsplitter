// Sunsplitter — ship-memory.js
// SUN-MEMORY-STORE-01 (L-054, owner rulings 2026-11-25): the cross-run ship memory store.
// One localStorage key per browser, separate from the run save and from save slots. It records what
// finished runs reached (endings, crew lost, the five great forks), which plates were on screen, and,
// for the run in progress only, the trail of hard-call scenes faced (D10).
//
// It never changes an outcome. Nothing in run state, scene files, saves or the export reads it; the
// engine only calls the guarded recorders below. It draws no random numbers. Every storage access is
// in try/catch; when storage is blocked or full the session copy keeps the record for this session,
// and a failed write never retries in a loop or touches another key.
//
// shipMemoryRead() is the one reader. The ship-remembers lines at the end of this file read it
// (SUN-SHIP-REMEMBERS-01); the gallery and the memory board are their own tickets.

const SHIP_MEMORY_KEY = "sunsplitter_ship_memory_v1";
const SHIP_MEMORY_VERSION = 1;
// resolveEnding titles -> ending ids (design §0).
const SHIP_MEMORY_ENDINGS = {
  "The Yellow Circle": "yellow_circle",
  "Landfall": "landfall",
  "The Living Ship": "living_ship",
  "The Quiet Ship": "quiet_ship",
  "Still Burning": "still_burning",
  "Fracture": "fracture",
  "The Long Dark": "long_dark"
};
const SHIP_MEMORY_ENDING_IDS = Object.values(SHIP_MEMORY_ENDINGS);
const SHIP_MEMORY_CREW = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess", "rourke"];
// The great forks (D1(a) Act 3 crisis path, D2(a) tether catch). Branch values as run state writes them.
const SHIP_MEMORY_FORKS = {
  crisis: ["breath", "custody"],
  vault: ["future", "living", "split"],
  tether: ["slow", "hard"],
  final: ["hold", "comfort", "transmission", "endure"]
};
// The hard calls (D10): each person's opener and the scene that ends them. A redirected opener is
// never rendered, so it never reaches the trail.
const SHIP_MEMORY_LETHALS = {
  lena: ["act3_lethal_lena_clock", "act3_lethal_lena_end"],
  tomas: ["act3_lethal_tomas_cost", "act3_lethal_tomas_end"],
  elias: ["act3_lethal_elias_order", "act3_lethal_elias_end"],
  mira: ["act3_lethal_mira_board", "act3_lethal_mira_end"]
};
const SHIP_MEMORY_TRAIL_IDS = Object.values(SHIP_MEMORY_LETHALS).flat();
const SHIP_MEMORY_LETHAL_OUTCOMES = ["lived", "lost"];
// Plates are the scene plate and the ending art (design §1). Intro slides, the cinematic bookend,
// crew-sheet portraits and the title ship are not plates for this purpose.
const SHIP_MEMORY_PLATE_ELEMENTS = ["scene-image", "ending-image", "what-remains-image"];
const SHIP_MEMORY_STEM_RE = /^[a-z0-9_]+$/;
const SHIP_MEMORY_PRINT_RE = /^[0-9a-f]{8}$/;
const SHIP_MEMORY_MAX_PLATES = 256;
const SHIP_MEMORY_MAX_PRINTS = 8;
const SHIP_MEMORY_MAX_TRAIL = 16;
const SHIP_MEMORY_MAX_COUNT = 1_000_000;

// Session copy: the last good value this session read or wrote. Used whenever storage throws, and
// in preference to storage once a write has failed, so a blocked or full store still remembers this
// session. shipMemoryRawSeen is the stored string the copy was parsed from (skips re-parsing).
let shipMemorySession = null;
let shipMemoryRawSeen = undefined;
let shipMemoryWriteFailed = false;
// A stored value from a newer version (v > 1): read nothing, write nothing, no downgrade clobber.
let shipMemoryForeign = false;

function shipMemoryEmpty() {
  return {
    v: SHIP_MEMORY_VERSION,
    runs: 0,
    endings: {},
    lost: {},
    plates: [],
    forks: { crisis: {}, vault: {}, tether: {}, lethal: {}, final: {} },
    last: null,
    prints: [],
    trail: []
  };
}

function shipMemoryIsObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function shipMemoryCount(value) {
  return Number.isInteger(value) && value > 0 ? Math.min(value, SHIP_MEMORY_MAX_COUNT) : 0;
}

// Keep only allowed keys whose values are positive integer counts.
function shipMemoryCounts(source, allowed) {
  const out = {};
  if (!shipMemoryIsObject(source)) return out;
  // Source order is kept: it is first-reached order (the memory board orders tiles by it).
  for (const key of Object.keys(source)) {
    if (!allowed.includes(key)) continue;
    const count = shipMemoryCount(source[key]);
    if (count) out[key] = count;
  }
  return out;
}

function shipMemoryUniqueList(source, keep, cap) {
  const out = [];
  if (!Array.isArray(source)) return out;
  for (const item of source) {
    if (typeof item !== "string" || !keep(item) || out.includes(item)) continue;
    out.push(item);
  }
  return cap ? out.slice(-cap) : out;
}

function shipMemoryPlateStemAllowed(stem) {
  // D6(a): ART-R2 people-free fallback plates are not recorded.
  return SHIP_MEMORY_STEM_RE.test(stem) && !stem.startsWith("art_r2_");
}

function shipMemoryLastForks(source) {
  const out = {};
  if (!shipMemoryIsObject(source)) return out;
  for (const [fork, branches] of Object.entries(SHIP_MEMORY_FORKS)) {
    if (branches.includes(source[fork])) out[fork] = source[fork];
  }
  if (shipMemoryIsObject(source.lethal)) {
    const lethal = {};
    for (const who of Object.keys(SHIP_MEMORY_LETHALS)) {
      if (SHIP_MEMORY_LETHAL_OUTCOMES.includes(source.lethal[who])) lethal[who] = source.lethal[who];
    }
    if (Object.keys(lethal).length) out.lethal = lethal;
  }
  return out;
}

// Salvage a parsed value field by field. Unknown ending ids, non-crew keys, bad stems, non-integer
// counts and unknown fork branches are dropped. Returns null for a newer version.
function shipMemorySanitize(parsed) {
  const clean = shipMemoryEmpty();
  if (!shipMemoryIsObject(parsed)) return clean;
  if (typeof parsed.v === "number" && parsed.v > SHIP_MEMORY_VERSION) return null;
  clean.runs = shipMemoryCount(parsed.runs);
  clean.endings = shipMemoryCounts(parsed.endings, SHIP_MEMORY_ENDING_IDS);
  clean.lost = shipMemoryCounts(parsed.lost, SHIP_MEMORY_CREW);
  clean.plates = shipMemoryUniqueList(parsed.plates, shipMemoryPlateStemAllowed).slice(0, SHIP_MEMORY_MAX_PLATES);
  const forks = shipMemoryIsObject(parsed.forks) ? parsed.forks : {};
  for (const [fork, branches] of Object.entries(SHIP_MEMORY_FORKS)) {
    clean.forks[fork] = shipMemoryCounts(forks[fork], branches);
  }
  if (shipMemoryIsObject(forks.lethal)) {
    for (const who of Object.keys(SHIP_MEMORY_LETHALS)) {
      const counts = shipMemoryCounts(forks.lethal[who], SHIP_MEMORY_LETHAL_OUTCOMES);
      if (Object.keys(counts).length) clean.forks.lethal[who] = counts;
    }
  }
  if (shipMemoryIsObject(parsed.last) && SHIP_MEMORY_ENDING_IDS.includes(parsed.last.ending)) {
    clean.last = {
      ending: parsed.last.ending,
      lost: shipMemoryUniqueList(parsed.last.lost, key => SHIP_MEMORY_CREW.includes(key)),
      forks: shipMemoryLastForks(parsed.last.forks)
    };
  }
  clean.prints = shipMemoryUniqueList(parsed.prints, print => SHIP_MEMORY_PRINT_RE.test(print), SHIP_MEMORY_MAX_PRINTS);
  clean.trail = shipMemoryUniqueList(parsed.trail, id => SHIP_MEMORY_TRAIL_IDS.includes(id)).slice(0, SHIP_MEMORY_MAX_TRAIL);
  return clean;
}

function shipMemoryClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// The one reader. Returns a sanitized copy; a missing, unparsable or newer-version value reads as
// empty. Never throws.
function shipMemoryRead() {
  return shipMemoryClone(shipMemoryCurrent());
}

function shipMemoryCurrent() {
  if (shipMemoryWriteFailed && shipMemorySession) return shipMemorySession;
  let raw;
  try {
    raw = localStorage.getItem(SHIP_MEMORY_KEY);
  } catch (e) {
    // Blocked storage: this session's copy, or empty.
    return shipMemorySession || (shipMemorySession = shipMemoryEmpty());
  }
  if (raw === shipMemoryRawSeen && shipMemorySession) return shipMemorySession;
  let parsed = null;
  if (typeof raw === "string") {
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
  }
  const clean = shipMemorySanitize(parsed);
  shipMemoryForeign = clean === null;
  shipMemorySession = clean || shipMemoryEmpty();
  shipMemoryRawSeen = raw;
  return shipMemorySession;
}

// Writes only this key. On failure the session copy keeps the change for this session; the next
// record tries storage once more (one attempt per record, never a loop).
function shipMemoryWrite(next) {
  if (shipMemoryForeign) return false;
  shipMemorySession = next;
  let raw;
  try {
    raw = JSON.stringify(next);
    localStorage.setItem(SHIP_MEMORY_KEY, raw);
  } catch (e) {
    shipMemoryWriteFailed = true;
    return false;
  }
  shipMemoryWriteFailed = false;
  shipMemoryRawSeen = raw;
  return true;
}

// Apply a change to a working copy and write it if anything changed. Never throws into play.
function shipMemoryUpdate(change) {
  try {
    const memory = shipMemoryCurrent();
    if (shipMemoryForeign) return false;
    const next = shipMemoryClone(memory);
    if (!change(next)) return false;
    return shipMemoryWrite(next);
  } catch (e) {
    return false;
  }
}

function shipMemoryPlateStem(src) {
  if (typeof src !== "string" || !src) return "";
  const path = src.split(/[?#]/)[0];
  const match = /(?:^|\/)images\/([^/]+)\.(?:jpe?g|png|webp)$/i.exec(path);
  return match ? match[1] : "";
}

// Plate seen. Called from setManagedImageSource, the one place every managed picture is set, with
// the file the element was just given: for the scene plate that is resolveSceneImage's answer, so
// the face gate has already run and a blocked plate's fallback is what is recorded. Prefetch uses
// detached Image objects and never reaches this. Other managed elements (intro and cinematic art,
// crew-sheet portraits, the title ship) are not plates and are ignored.
function shipMemoryNotePlate(img, src) {
  if (!img || !SHIP_MEMORY_PLATE_ELEMENTS.includes(img.id)) return false;
  const stem = shipMemoryPlateStem(src);
  if (!stem || !shipMemoryPlateStemAllowed(stem)) return false;
  return shipMemoryUpdate(memory => {
    if (memory.plates.includes(stem) || memory.plates.length >= SHIP_MEMORY_MAX_PLATES) return false;
    memory.plates.push(stem);
    return true;
  });
}

// Hard-call trail (D10). Called from showScene once a scene has passed its onEnter redirect check.
function shipMemoryNoteScene(id) {
  if (!SHIP_MEMORY_TRAIL_IDS.includes(id)) return false;
  return shipMemoryUpdate(memory => {
    if (memory.trail.includes(id) || memory.trail.length >= SHIP_MEMORY_MAX_TRAIL) return false;
    memory.trail.push(id);
    return true;
  });
}

// A fresh run (beginFreshCampaign) or an import starts with no hard calls faced.
function shipMemoryClearTrail() {
  return shipMemoryUpdate(memory => {
    if (!memory.trail.length) return false;
    memory.trail = [];
    return true;
  });
}

// Stable JSON with sorted object keys, so a snapshot that round-trips through a save prints the same.
function shipMemoryStableJson(value) {
  if (Array.isArray(value)) return `[${value.map(shipMemoryStableJson).join(",")}]`;
  if (shipMemoryIsObject(value)) {
    return `{${Object.keys(value).sort().filter(key => value[key] !== undefined)
      .map(key => `${JSON.stringify(key)}:${shipMemoryStableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

// djb2 of the run snapshot without savedAt, as 8 hex digits.
function shipMemoryRunPrint() {
  const snap = typeof snapshotState === "function" ? snapshotState() : Object.assign({}, state);
  delete snap.savedAt;
  const text = shipMemoryStableJson(snap);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = (Math.imul(hash, 33) + text.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// The five forks this run took, from run state plus the trail. A fork the run never reached is absent.
function shipMemoryRunForks(trail) {
  const flags = state.flags || {};
  const forks = {};
  if (SHIP_MEMORY_FORKS.crisis.includes(state.crisisPath)) forks.crisis = state.crisisPath;
  if (SHIP_MEMORY_FORKS.vault.includes(flags.vault_sacrifice)) forks.vault = flags.vault_sacrifice;
  const tether = flags.tether_rushed ? "hard" : flags.water_vented ? "slow" : null;
  if (tether) forks.tether = tether;
  const lethal = {};
  for (const [who, [opener, end]] of Object.entries(SHIP_MEMORY_LETHALS)) {
    if (!trail.includes(opener) && !trail.includes(end)) continue;
    // Lost when the call's own death scene rendered, or when the person faced it and is not alive
    // at the end: a dead person is never recorded as having come back.
    const alive = typeof isAlive === "function" ? isAlive(who) : !(state.dead || []).includes(who);
    lethal[who] = trail.includes(end) || !alive ? "lost" : "lived";
  }
  if (Object.keys(lethal).length) forks.lethal = lethal;
  if (SHIP_MEMORY_FORKS.final.includes(flags.final)) forks.final = flags.final;
  return forks;
}

// Run end. Called at the end of resolveEnding with the ending title. A Continue of a completed slot
// re-runs resolveEnding on the same snapshot; its print is already in prints, so nothing is counted twice.
function shipMemoryRecordRun(title) {
  const ending = SHIP_MEMORY_ENDINGS[title];
  if (!ending) return false;
  let print;
  try { print = shipMemoryRunPrint(); } catch (e) { return false; }
  return shipMemoryUpdate(memory => {
    if (memory.prints.includes(print)) return false;
    const trail = memory.trail.slice();
    const forks = shipMemoryRunForks(trail);
    const lost = (state.dead || []).filter((key, index, list) => SHIP_MEMORY_CREW.includes(key) && list.indexOf(key) === index);
    memory.runs = Math.min(memory.runs + 1, SHIP_MEMORY_MAX_COUNT);
    memory.endings[ending] = Math.min((memory.endings[ending] || 0) + 1, SHIP_MEMORY_MAX_COUNT);
    for (const key of lost) memory.lost[key] = Math.min((memory.lost[key] || 0) + 1, SHIP_MEMORY_MAX_COUNT);
    for (const fork of Object.keys(SHIP_MEMORY_FORKS)) {
      const branch = forks[fork];
      if (branch) memory.forks[fork][branch] = Math.min((memory.forks[fork][branch] || 0) + 1, SHIP_MEMORY_MAX_COUNT);
    }
    for (const [who, outcome] of Object.entries(forks.lethal || {})) {
      const counts = memory.forks.lethal[who] || (memory.forks.lethal[who] = {});
      counts[outcome] = Math.min((counts[outcome] || 0) + 1, SHIP_MEMORY_MAX_COUNT);
    }
    memory.last = { ending, lost, forks };
    memory.prints = memory.prints.concat(print).slice(-SHIP_MEMORY_MAX_PRINTS);
    memory.trail = [];
    return true;
  });
}

// ─── SUN-SHIP-REMEMBERS-01 (L-054, ROADMAP §14A Wave 2 workstream 5): the ship remembers ───
// On a later run a few lines acknowledge earlier endings, at three points only: the title, the tone
// screen (seen after the first run only through "Revisit content notice"; D11 kept it), and one
// paragraph in the wake of a fresh run. Never on an ending, What Remains or the cinematic. Each line
// is fixed per ending (no randomness), names no crew member, prints no count and points at no choice.
// The engine places them; these three functions are the only readers.

// Title: every ending reached overrides the last ending's line.
const SHIP_REMEMBERS_TITLE_ALL = "The ship has ended every way it knows. It wakes you anyway.";
const SHIP_REMEMBERS_TITLE = {
  yellow_circle: "Under the primer on one bulkhead: something round, something yellow. No one claims it.",
  landfall: "The navigation cache holds a course to a cold world. No one remembers laying it in.",
  living_ship: "The habitation decks have run warm before. The vault remembers what that cost.",
  quiet_ship: "The observation blister has watched the last light go out before.",
  still_burning: "The ship has carried a crew that held together. It keeps no record of how.",
  fracture: "The hull remembers a crew that stopped moving as one.",
  long_dark: "The Sunsplitter has pushed through the black before. One more day, then the next."
};
// Tone screen: one line for any later run.
const SHIP_REMEMBERS_TONE = "You have commanded this ship before. It will not go easier for that.";
// Wake: one paragraph after the scene's own, keyed to the last ending. Each is true of every fresh
// wake (the medical bay's ozone and blood, its status board, nobody yet spoken, nothing yellow on the
// bulkheads) and is only the Commander's own sense of it: no one else is said to be present or to
// remember. None repeats the wake's closing "this room".
const SHIP_REMEMBERS_WAKE = {
  yellow_circle: "There is nothing yellow on these bulkheads. You look for it anyway.",
  landfall: "You carry a heading, exact and cold. Nothing on the status board explains it.",
  living_ship: "For a moment the bay is warm and full of people arguing over food. Then it is ozone and blood again.",
  quiet_ship: "You find yourself listening for the systems to fail one by one. For now, they run.",
  still_burning: "Something in you expects these people to hold. You have no grounds for it yet.",
  fracture: "Before anyone has spoken, you are listening for where this crew will split.",
  long_dark: "Before you have even sat up, you are thinking about the next day, and the one after it."
};

// The last ending's line from a table, or "" when no run has finished. Never throws into play.
function shipRemembersLastLine(memory, table) {
  if (!memory || !memory.runs || !memory.last) return "";
  return table[memory.last.ending] || "";
}

function shipRemembersTitleLine() {
  try {
    const memory = shipMemoryRead();
    if (!memory.runs) return "";
    if (SHIP_MEMORY_ENDING_IDS.every(id => memory.endings[id])) return SHIP_REMEMBERS_TITLE_ALL;
    return shipRemembersLastLine(memory, SHIP_REMEMBERS_TITLE);
  } catch (e) {
    return "";
  }
}

function shipRemembersToneLine() {
  try {
    return shipMemoryRead().runs ? SHIP_REMEMBERS_TONE : "";
  } catch (e) {
    return "";
  }
}

function shipRemembersWakeLine() {
  try {
    return shipRemembersLastLine(shipMemoryRead(), SHIP_REMEMBERS_WAKE);
  } catch (e) {
    return "";
  }
}
