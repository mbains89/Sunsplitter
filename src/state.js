// Sunsplitter — state.js
// Version 0.28.2 — Unreachable scenes + unpaid cost gate
// Game state, crew definitions, sceneImages map, core helpers
const VERSION = "0.28.2";

// FLAGS: see validate + scene onEnter/flag writes. state.dying is sole source for slow-death clock (map form from 0.25).
// Edit this file to change starting stats, characters, or image mappings
//
// 0.22+ locked flag keys (written by later tickets; do not invent meters/quest logs):
//   recovered.tomas / recovered.jiro / recovered.vess  (mirrored in state.recovered{})
//   sela_vault_vow  ("accepted" | "refused" — written by pursuit_sela crisis-request)
//   busDowngraded
//   crisisPath  (top-level: "breath" | "custody" | null)
// Prefer state.recovered.vess over a separate vessAboard alias.
// 0.24.1 crisis-request cost flags: pursuit_*_cost, lena_regen, mira_memory_public, amara_vent_delayed
// 0.25: state.dying is a map { [name]: causeString }; legacy scalar "lena" normalized on load.

function freshState() {
  return {
    survivors: 9,
    integrity: 62,
    cohesion: 48,
    supplies: 41,
    embryos: 100,
    flags: {},
    dead: [],
    deathCause: {},
    scene: "wake",
    affinity: { lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 },
    trust: { lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 },
    romance: {},
    pursuit: {},
    favors: {},
    past_known_by: {},
    dying: {},
    past_known: false,
    marks: {},
    memories: [],
    ideology: { future: 0, living: 0 },
    // 0.22.0 groundwork — Tomas/Jiro missing until recovery; Vess slot for 0.24
    recovered: { tomas: false, jiro: false, vess: false },
    promises: {},          // key = who, value = absent | "made" | "declined" | "kept" | "broken"
    crisisPath: null       // "breath" | "custody" | null — set in 0.26
  };
}

const state = freshState();

// Character ideological lean (locked voice). "swing" characters can move.
const crewLean = {
  lena:   "living",   // treats the breathing first; vault is secondary until forced
  elias:  "future",   // mission and order over comfort; soft leadership is death
  mira:   "swing",    // systems vs people — driven by drive-fix and who she trusts
  tomas:  "living",   // presence, confession, the human cost
  amara:  "living",   // green things, warmth, the key from Lagos
  jiro:   "future",   // numbers, trajectory, the mission that justified escape
  sela:   "living",   // the yellow sun — a world worth arriving in
  vess:   "swing",    // long-range / relay; mourns a ship, not a planet; power stays hers
  rourke: "future"    // died doing the work; docking was for the mission
};

const crew = {
  lena:   { name: "Dr. Lena Voss", first: "Lena", role: "Medical", bio: "Former trauma surgeon from the orbital hospitals. Lost her entire staff during the evacuation. Attractive, sharp, exhausted. The living come first until the math forces her hand." },
  elias:  { name: "Elias Kane", first: "Elias", role: "Security", bio: "Ex-corporate security. Believes soft leadership is a luxury the dead cannot afford. Tall, scarred, magnetic. The mission outranks comfort." },
  mira:   { name: "Mira Solis", first: "Mira", role: "Engineer", bio: "Drive systems specialist. Still believes the ship can be saved if she is given enough time and parts. Intense, brilliant, hungry for connection. Torn between systems and people." },
  tomas:  { name: "Brother Tomas", first: "Tomas", role: "None", bio: "Hospital chaplain turned refugee. Carries no rank and no weapons, only presence. Quiet intensity under the calm. Keeps the human cost on the ledger." },
  amara:  { name: "Amara Vale", first: "Amara", role: "Hydroponics", bio: "Grew food for three habitats before the fall. Still carries the house key from her home in Lagos. Grounded, sensual, grieving. Living things are not a luxury." },
  jiro:   { name: "Jiro Okada", first: "Jiro", role: "Navigation", bio: "Navigator who plotted the escape trajectory. Speaks little. Watches everything. Reserved, precise, carrying quiet grief. The numbers are the only honest language left." },
  sela:   { name: "Sela", first: "Sela", role: "None", bio: "Twenty years old. Draws yellow circles that look like suns. Speaks carefully and precisely when she chooses to — refusal as much as grief. Quiet, watchful, present. Wants a world that is still warm." },
  vess:   { name: "Vess", first: "Vess", role: "Relay", bio: "Twenty-two. Sole survivor of the Dawnbreak fragment. Tall, wiry-athletic, long white-silver hair. Log-trained flat voice that cracks under surprise. Kept a beacon alive alone for six years. Long-range ears. Power stays hers." },
  rourke: { name: "Marcus Rourke", first: "Rourke", role: "Docking", bio: "Docking crew. Knew the ship better than most. Did not make it past the first hour." }
};

const ROMANCEABLE = ["lena", "mira", "amara", "sela", "vess"];
const CREW_ORDER = Object.keys(crew);
const LIVING_CREW_KEYS = CREW_ORDER.filter(k => k !== "rourke"); // starting living set (rourke dies early)

// Scene → illustration mapping (grimdark industrial / cyberpunk hybrid)
const sceneImages = {
  // Opening / medical
  wake:            "images/medical_bay.jpg",
  dying:           "images/rourke.jpg",
  rourke_end:      "images/covered_body.jpg",
  rourke_stop:     "images/covered_body.jpg",
  rourke_try:      "images/covered_body.jpg",
  silence:         "images/medical_bay.jpg",

  // Character intros (Batch A portraits — locked)
  intro_lena:      "images/lena.jpg",
  intro_elias:     "images/elias.jpg",

  // Early / status
  vault_reveal:    "images/vault_reveal.jpg",
  status:          "images/observation_bridge_alt.jpg",
  priority_repairs:"images/crisis.jpg",
  priority_ration: "images/observation_reckon.jpg",
  priority_planet: "images/rogue_planet.jpg",
  commit_planet:   "images/rogue_planet.jpg",
  hydroponics:     "images/hydroponics.jpg",
  empty_berths:     "images/empty_berths.jpg",
  bond_elias:       "images/bond_elias.jpg",
  bond_tomas:       "images/bond_tomas.jpg",
  bond_jiro:        "images/bond_jiro.jpg",
  competence_watch: "images/observation_bridge_alt.jpg",
  crew_walk:       "images/corridor_pressure_4.jpg",
  lead_prompt:     "images/lead_prompt.jpg",
  lead_together:   "images/observation_bridge_alt.jpg",
  lead_hard:       "images/corridor_pressure_1.jpg",
  lead_watch:      "images/corridor_pressure_2.jpg",
  power_crisis:    "images/power_stress_2.jpg",
  private_stores:  "images/private_stores.jpg",
  time_pass:       "images/corridor_pressure_2.jpg",

  // Crisis family
  crisis:          "images/crisis.jpg",
  cut_out:         "images/cut_out.jpg",
  vent:            "images/vent.jpg",
  self_risk:       "images/self_risk.jpg",
  aftermath:       "images/aftermath.jpg",

  // Private human moments — dedicated quiet plates now wired
  quiet_sela:      "images/quiet_sela.jpg",
  quiet_mira:      "images/quiet_mira.jpg",
  quiet_tomas:     "images/quiet_tomas.jpg",
  quiet_amara:     "images/quiet_amara.jpg",

  // Mid-path exclusive
  // v0.11 exclusive mid-arcs
  arc_fork:         "images/observation_reckon.jpg",
  arc_future_1:     "images/power_stress_2.jpg",
  arc_future_2:     "images/vault_interior_alt.jpg",
  arc_future_3:     "images/cascade_records.jpg",
  arc_future_4:     "images/abandoned_section.jpg",
  arc_living_1:     "images/hydroponics.jpg",
  arc_living_2:     "images/sela.jpg",
  arc_living_3:     "images/arc_living_conflict.jpg",
  arc_living_4:     "images/corridor_pressure_2.jpg",
  vault_voice:     "images/vault_voice.jpg",
  vault_sacrifice: "images/vault_sacrifice.jpg",
  transmission:    "images/transmission.jpg",
  tomas_break:     "images/tomas_break.jpg",
  faction_split:   "images/corridor_variant.jpg",
  pregnancy_check: "images/medbay_dim_alt.jpg",

  // 0.28 Off-Shift + pairs + warmth (all REUSE)
  offshift_open:       "images/corridor_variant.jpg",
  offshift_lena:       "images/medical_bay.jpg",
  offshift_elias:      "images/elias.jpg",
  offshift_mira:       "images/quiet_mira.jpg",
  offshift_tomas:      "images/quiet_tomas.jpg",
  offshift_tomas_r:    "images/quiet_tomas.jpg",
  offshift_amara:      "images/quiet_amara.jpg",
  offshift_jiro:       "images/jiro.jpg",
  offshift_sela:       "images/sela_ritual.jpg",
  offshift_vess:       "images/transmission.jpg",
  pair_grudge_settle:  "images/observation.jpg",
  pair_favor_confront: "images/hydroponics_amara.jpg",
  pair_shield_cold:    "images/elias.jpg",
  warmth_meal:         "images/hydroponics.jpg",
  warmth_laughter:     "images/corridor.jpg",
  warmth_music:        "images/corridor.jpg",

  // Romance

  intimacy_window:  "images/observation_bridge_alt.jpg",
  pursuit_window:   "images/corridor_pressure_3.jpg",
  pursuit_mira:     "images/lingerie_mira.jpg",
  pursuit_mira_sex: "images/afterglow_mira.jpg",
  pursuit_amara:    "images/lingerie_amara.jpg",
  pursuit_amara_sex:"images/afterglow_amara.jpg",
  pursuit_sela:     "images/lingerie_sela.jpg",
  pursuit_sela_sex: "images/afterglow_sela.jpg",
  pursuit_lena:     "images/lingerie_lena.jpg",
  pursuit_lena_sex: "images/afterglow_lena.jpg",
  coolant_trade:    "images/corridor_variant.jpg",
  seal_or_food:     "images/corridor_variant.jpg",
  history_elias:    "images/elias.jpg",
  favor_mira:       "images/mira.jpg",
  debt_notice:      "images/corridor_pressure_4.jpg",
  // 0.23 recoveries + vault face (reuse closest plates; dedicated art later)
  act2_tether_sighting: "images/debris_field.jpg",
  act2_tether_vent:     "images/power_crisis.jpg",
  act2_tether_rush:     "images/debris_field.jpg",
  act2_tether_hand_elias: "images/self_risk.jpg",
  act2_tether_hand_mira:  "images/self_risk.jpg",
  act2_tether_hand_sela:  "images/self_risk.jpg",
  act2_tether_dock:     "images/bulkhead.jpg",
  act2_tether_manifest: "images/medbay_dim.jpg",
  act2_tether_truth:    "images/observation_crew.jpg",
  act2_tether_lie:      "images/observation_bridge.jpg",
  act2_spine_next:      "images/corridor.jpg",
  act3_reckoning_pattern: "images/observation_bridge_alt.jpg",
  act3_reckoning_heading: "images/observation_bridge.jpg",
  act3_reckoning_burn_stale: "images/power_crisis.jpg",
  act3_reckoning_burn_verified: "images/power_crisis.jpg",
  act3_reckoning_delay: "images/observation_bridge.jpg",
  act3_reckoning_cut:   "images/cut_out.jpg",
  act3_reckoning_briefing: "images/cascade_records.jpg",
  act3_vault_face:      "images/vault.jpg",
  act3_vault_face_read: "images/vault.jpg",
  act3_spine_next:      "images/corridor.jpg",
  // 0.24 Vess arrival + short asymmetric romance (closest existing plates)
  vess_signal:          "images/vess_signal.jpg",
  vess_cost:            "images/vess_signal.jpg",
  vess_boarding:        "images/vess_boarding.jpg",
  vess_offer:           "images/vess_offer.jpg",
  vess_transmission:    "images/vess_signal.jpg",
  vess_intimate:        "images/vess_intimate.jpg",
  ship_interrupt:   "images/power_crisis.jpg",
  ship_interrupt_resolve: "images/ship_interrupt_resolve.jpg",
  ship_memory_payoff: "images/bulkhead.jpg",
  sun_payoff:       "images/sela_ritual.jpg",
  boarding_stories: "images/corridor.jpg",
  patch_fails:      "images/vent.jpg",
  bond_mira:        "images/mira.jpg",
  bond_amara:       "images/amara.jpg",
  bond_sela:        "images/sela.jpg",
  bond_lena:        "images/lena.jpg",
  romance_lena_sex: "images/romance_lena_1.jpg",
  romance_amara_1:  "images/shower_amara.jpg",
  romance_sela_1:   "images/shower_sela.jpg",
  romance_amara_tomas_sex: "images/romance_amara_tomas.jpg",
  romance_mira_1:      "images/shower_mira.jpg",
  romance_amara_tomas: "images/romance_amara_tomas.jpg",
  romance_lena_1:      "images/romance_lena_1.jpg",

  // 0.22.1 explicit art utilization (one-shot aftermath variants)
  lena_shower:     "images/shower_lena.jpg",
  mira_shower:     "images/shower_mira.jpg",
  lena_rear:       "images/rear_lena.jpg",
  mira_rear:       "images/rear_mira.jpg",
  amara_rear:      "images/rear_amara.jpg",
  sela_rear:       "images/rear_sela.jpg",

  // Character beats
  lena_dying:      "images/lena.jpg",
  past_leak:       "images/elias.jpg",

  // Reckoning / late
  reckon_public:   "images/reckon_public.jpg",
  reckon_memory:   "images/aftermath.jpg",
  reckon_truth:    "images/observation_reckon.jpg",
  reckon_summary:  "images/observation_reckon.jpg",
  reckon_suppress: "images/observation_reckon.jpg",
  final_choice:    "images/final_choice.jpg"
};

const STAT_CAPS = {
  survivors: { min: 0, max: 20 },
  integrity: { min: 0, max: 100 },
  cohesion:  { min: 0, max: 100 },
  supplies:  { min: 0, max: 100 },
  embryos:   { min: 0, max: 100 },
  affinity:  { min: 0, max: 100 },
  trust:     { min: 0, max: 100 }
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function updateStats(changes = {}) {
  for (const k of ["survivors", "integrity", "cohesion", "supplies", "embryos"]) {
    if (changes[k] !== undefined) {
      const cap = STAT_CAPS[k];
      state[k] = clamp(state[k] + changes[k], cap.min, cap.max);
    }
  }
  renderStatus();
}

function kill(key, cause) {
  if (!state.dead.includes(key)) {
    state.dead.push(key);
    state.survivors = Math.max(0, state.survivors - 1);
    if (cause) state.deathCause[key] = cause;
  }
}

function addAffinity(who, amount) {
  if (state.affinity[who] !== undefined) {
    const cap = STAT_CAPS.affinity;
    state.affinity[who] = clamp(state.affinity[who] + amount, cap.min, cap.max);
  }
}

function addTrust(who, amount) {
  if (state.trust[who] !== undefined) {
    const cap = STAT_CAPS.trust;
    state.trust[who] = clamp(state.trust[who] + amount, cap.min, cap.max);
  }
}

function mark(who, tag) {
  if (!who || !tag) return;
  // Accumulate tags so spoken/declined/bonded etc. do not erase each other (P1.5)
  const cur = state.marks[who];
  if (!cur) {
    state.marks[who] = tag;
  } else if (typeof cur === "string") {
    const set = new Set(cur.split("|").filter(Boolean));
    set.add(tag);
    state.marks[who] = [...set].join("|");
  } else if (typeof cur === "object") {
    cur[tag] = true;
  }
}

function hasMark(who, tag) {
  const cur = state.marks[who];
  if (!cur || !tag) return false;
  if (typeof cur === "string") {
    if (cur === tag) return true;
    return cur.split("|").includes(tag);
  }
  return !!cur[tag];
}

function remember(text) {
  if (!text) return;
  if (state.memories.includes(text)) return;
  if (state.memories.length < 12) state.memories.push(text);
}

function lean(side, amount) {
  if (side === "future" || side === "living") {
    state.ideology[side] = (state.ideology[side] || 0) + amount;
  }
}

// Moral shape of the run: which ideology won in practice
function ideologyShape() {
  const f = state.ideology.future || 0;
  const l = state.ideology.living || 0;
  const sac = state.flags.vault_sacrifice;
  // Hard vault choice outweighs soft leans
  if (sac === "future") return "future";
  if (sac === "living") return "living";
  if (sac === "split") return "split";
  if (f - l >= 8) return "future";
  if (l - f >= 8) return "living";
  return "split";
}

// Living crew who embody a side (for ending/faction text)
function voicesFor(side) {
  return Object.keys(crewLean)
    .filter(k => crewLean[k] === side && isAlive(k) && k !== "rourke")
    .map(k => crew[k].name);
}

function highestAffinity() {
  let best = null, score = -1;
  for (const k of Object.keys(state.affinity)) {
    if (!isAlive(k)) continue;
    if (state.affinity[k] > score) { score = state.affinity[k]; best = k; }
  }
  return { who: best, score };
}

function favoritism() {
  // Returns { favored, othersNotice } if one living affinity is clearly ahead
  const living = Object.keys(state.affinity).filter(k => isAlive(k));
  if (living.length < 2) return null;
  living.sort((a, b) => state.affinity[b] - state.affinity[a]);
  const top = living[0], second = living[1];
  if (state.affinity[top] >= 35 && state.affinity[top] - state.affinity[second] >= 20) {
    return { favored: top, gap: state.affinity[top] - state.affinity[second] };
  }
  return null;
}

function namedDead() {
  // Dedup by crew key so the same death is never listed twice
  const seen = new Set();
  const out = [];
  for (const k of state.dead || []) {
    if (seen.has(k)) continue;
    seen.add(k);
    const name = crew[k] ? crew[k].name : k;
    const cause = state.deathCause && state.deathCause[k];
    out.push(cause ? `${name} (${cause})` : name);
  }
  return out;
}

function isRecovered(who) {
  return !!(state.recovered && state.recovered[who]);
}

function isAlive(key) {
  // Tomas / Jiro start missing (not dead). Alive only after recovered.X and not later killed.
  // Vess is permanent 10th: absent until recovered.vess; then normal death tracking.
  // Rourke uses normal death tracking.
  if (key === "tomas" || key === "jiro" || key === "vess") {
    return isRecovered(key) && !state.dead.includes(key);
  }
  return !state.dead.includes(key);
}


function relationshipDebtors() {
  // Living crew who notice heavy favoritism / exclusive romance and cool off.
  // Not jealousy minigame — people measuring who gets private time.
  const keys = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"].filter(isAlive);
  const fav = favoritism();
  const romanced = ["lena", "mira", "amara", "sela", "vess"].filter(k => state.romance[k]);
  const favored = fav ? fav.favored : (romanced.length === 1 ? romanced[0] : null);
  const debtors = [];
  if (!favored && romanced.length === 0) return debtors;
  for (const k of keys) {
    if (k === favored) continue;
    if (romanced.includes(k)) continue;
    const aff = state.affinity[k] || 0;
    const topAff = favored ? (state.affinity[favored] || 0) : 0;
    if (favored && topAff - aff >= 18) debtors.push(k);
    else if (romanced.length >= 1 && aff < 22 && topAff >= 35) debtors.push(k);
  }
  // Cap so debt stays readable
  return debtors.slice(0, 4);
}

function concreteRunFacts() {
  const facts = [];
  const dead = namedDead();
  if (dead.length) facts.push("Lost: " + dead.join(", ") + ".");
  if (state.flags.mid_arc === "future") facts.push("Mid-voyage you leaned Future.");
  else if (state.flags.mid_arc === "living") facts.push("Mid-voyage you leaned Living.");
  if (state.flags.vault_sacrifice === "future") facts.push("At the vault fault you chose the package.");
  else if (state.flags.vault_sacrifice === "living") facts.push("At the vault fault you chose the living.");
  const fav = favoritism();
  if (fav && crew[fav.favored] && isAlive(fav.favored)) {
    facts.push("The crew saw who you kept close: " + crew[fav.favored].name + ".");
  }
  const roms = ["lena", "mira", "amara", "sela", "vess"].filter(k => state.romance[k]).map(k => crew[k] ? crew[k].name : k);
  if (roms.length) facts.push("Private lines crossed with " + roms.join(", ") + ".");
  if (state.recovered && state.recovered.vess) facts.push("Vess came aboard from the Dawnbreak fragment.");
  if (state.flags.busDowngraded) facts.push("The environmental bus runs degraded for her relay.");
  if (state.flags.past === "owned") facts.push("You owned a piece of your past in front of Elias.");
  else if (state.flags.past === "deal") facts.push("You made a quiet deal over your past.");
  if (state.flags.ship_memory === "jury_rig") facts.push("The Deck 4 seal was only ever a jury-rig.");
  else if (state.flags.ship_memory === "open_wound") facts.push("You left Deck 4's seal to the odds for food.");
  else if (state.flags.ship_memory === "proper_seal") facts.push("You spent feedstock on a proper Deck 4 seal.");
  if (state.flags.sun_doctrine === "doctrine") facts.push("Sela's yellow marks became unofficial doctrine.");
  else if (state.flags.sun_doctrine === "scrubbed") facts.push("You ordered the yellow marks removed.");
  if (state.flags.sela_vault_vow === "accepted") facts.push("You and Sela logged a vow: no command privilege for vault places.");
  else if (state.flags.sela_vault_vow === "refused") facts.push("Sela asked for a vault vow and you refused it.");
  if (state.flags.lena_regen) facts.push("The last regenerative treatment was spent on Lena.");
  if (state.flags.mira_memory_public) facts.push("Mira forced full disclosure of the retained intimate and vault record.");
  if (state.flags.amara_vent_delayed) facts.push("You publicly delayed a contaminated grow vent for Amara's cultures.");
  return facts.slice(0, 4);
}

function romanceOpen(who) {
  // Default-offer gate for one woman: alive && !romanced && marks !== declined && promise not broken
  if (!who || !ROMANCEABLE.includes(who)) return false;
  return isAlive(who) && !state.romance[who] && !hasMark(who, "declined") && state.promises[who] !== "broken";
}

function hasOpenRomanceGates() {
  // Default offer: any romanceable still open
  return ROMANCEABLE.some(romanceOpen);
}


function renderStatus() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.className = "stat-value " + (val < 30 ? "low" : val < 60 ? "mid" : "high");
  };
  set("stat-survivors", state.survivors);
  set("stat-integrity", state.integrity + "%");
  set("stat-cohesion", state.cohesion + "%");
  set("stat-supplies", state.supplies + "%");
  set("stat-embryos", state.embryos + "%");
  if (typeof renderCrewPanel === "function") renderCrewPanel();
}

function showScreen(id) {
  ["tone-screen", "title-screen", "game-screen", "ending-screen", "status", "meta", "crew-panel"].forEach(x => {
    const el = document.getElementById(x);
    if (el) el.classList.add("hidden");
  });
  const crew = document.getElementById("crew-panel");
  if (crew) crew.classList.remove("visible");
  // 0.21.3: scene art lives outside #main; force hide when leaving game
  const imgWrap = document.getElementById("scene-image-wrap");
  if (imgWrap && id !== "game") {
    imgWrap.classList.remove("visible");
    imgWrap.classList.remove("intimate");
  }
  if (id === "tone") {
    const el = document.getElementById("tone-screen");
    if (el) el.classList.remove("hidden");
  }
  if (id === "title") {
    const el = document.getElementById("title-screen");
    if (el) el.classList.remove("hidden");
    const sub = document.getElementById("game-subtitle");
    if (sub && typeof VERSION !== "undefined") sub.textContent = "v" + VERSION;
  }
  if (id === "game") {
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("status").classList.remove("hidden");
    document.getElementById("meta").classList.remove("hidden");
  }
  if (id === "ending") document.getElementById("ending-screen").classList.remove("hidden");
}

// ─── 0.28 helpers: Last Off-Shift eligibility + pairs + attributable death ───

function leansLiving() {
  return ideologyShape() === "living";
}

function stillFavoring(who) {
  const fav = favoritism();
  return !!(fav && fav.favored === who);
}

function neglected(who) {
  if (!isAlive(who)) return false;
  if (hasMark(who, "bonded") || hasMark(who, "bond_skipped")) return false;
  const living = Object.keys(state.affinity).filter(isAlive);
  if (living.length < 2) return false;
  let lowest = living[0], score = state.affinity[lowest];
  for (const k of living) {
    if (state.affinity[k] < score) { score = state.affinity[k]; lowest = k; }
  }
  return lowest === who;
}

// Attributable causes name command agency / spent order / resource choice.
const ATTRIBUTABLE_CAUSES = [
  "resources diverted to the vault",
  "vented with the lower ring",
  "vented at twenty",
  "ordered to stop treatment",
  "finished the repair",
  "would not leave the board"
];
function attributableDeath(who) {
  const cause = state.deathCause && state.deathCause[who];
  if (!cause) return false;
  if (ATTRIBUTABLE_CAUSES.includes(cause)) return true;
  const c = String(cause).toLowerCase();
  return c.includes("ordered") || c.includes("refused the order") ||
         c.includes("enforced") || c.includes("paid for it") ||
         c.includes("vented");
}
function anyAttributableDeath() {
  return (state.dead || []).some(attributableDeath);
}
function firstAttributableDeath() {
  for (const k of (state.dead || [])) {
    if (attributableDeath(k)) return { who: k, name: (crew[k] && crew[k].name) || k, cause: state.deathCause[k] };
  }
  return null;
}

function eligLena()  { return isAlive("lena"); }
function eligElias() { return isAlive("elias") && !isAlive("mira"); } // LOCK 4: alive-Mira branch cut
function eligMira()  { return isAlive("mira") && state.crisisPath === "custody" && state.flags.custody_answer === "severed"; }
function eligTomas() { return isAlive("tomas") && (leansLiving() || state.crisisPath === "breath"); }
function eligAmara() { return isAlive("amara") && anyAttributableDeath(); }
function eligJiro()  { return isAlive("jiro"); }
function eligSela()  { return isAlive("sela"); }
function eligVess()  { return isAlive("vess"); }

function partnerUnchosen() {
  const jc = state.flags.junctionChoice;
  if (!jc || jc === "none") return null;
  const partners = ["lena", "mira", "amara", "sela", "vess"].filter(w => state.romance[w] && isAlive(w));
  for (const p of partners) {
    if (p !== jc) {
      // only report if they were eligible
      if (p === "lena" && eligLena()) return p;
      if (p === "mira" && eligMira()) return p;
      if (p === "amara" && eligAmara()) return p;
      if (p === "sela" && eligSela()) return p;
      if (p === "vess" && eligVess()) return p;
    }
  }
  return null;
}

function closingPartnerLine() {
  const p = partnerUnchosen();
  if (p === "mira") return "Somewhere below, a torque wrench keeps time past shift-end.";
  if (p === "amara") return "The hydroponics light outlasts you. Barely.";
  if (p === "sela") return "At cycle-turn, a yellow lamp somewhere reaches amber on schedule.";
  if (p === "vess") return "The relay bay light is on when you pass. Shut by morning.";
  if (p === "lena") return "Down-corridor, the medbay channel light burns past cycle-turn. Then it doesn't.";
  return "";
}

// Register scene maps; throw on duplicate IDs so act splits cannot silently collide
function registerScenes(map) {
  if (!map || typeof map !== "object") return;
  if (typeof scenes === "undefined" || !scenes) {
    scenes = {};
  }
  for (const id of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(scenes, id)) {
      throw new Error('[Sunsplitter] duplicate scene id: "' + id + '"');
    }
    scenes[id] = map[id];
  }
}

// --- end state.js ---
