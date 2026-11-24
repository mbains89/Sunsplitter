// SUN-NUDITY-FILTER-01 (L-040) — reader setting "Cover nudity in pictures".
//
// Off by default, so the game is unchanged unless the player turns it on. On, every picture on
// the audited list is covered wherever a picture can appear, and stays covered while the next
// picture is still loading. It is presentation only: the same seeds walk the same path to the
// same state with it on or off, the text is identical, and it never enters the save.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_cover_nudity_v1";
const PICTURE_IDS = ["scene-image", "crew-sheet-image", "cinematic-image", "ending-image", "what-remains-image"];
const SEEDS = [6101, 6202, 6303, 6404, 6505, 6606];
const RUNS_PER_SEED = 10;
const MAX_STEPS = 400;

// Muse looked at every file in images/ at this tree on 2026-11-23. A different tree means a
// picture was added, replaced or removed. Look at the changed picture, list it in
// NUDITY_PICTURES (src/engine.js) or leave it off, then move this pin and AUDITED below.
const AUDITED_IMAGES_TREE = "04466461501e812051a9ec88e688bcc35932864e";
const AUDITED_IMAGE_COUNT = 238;
// The audited list: a bare breast, genitals or bare buttocks, or plainly nude with those hidden.
const AUDITED = [
  "afterglow_amara.jpg", "afterglow_lena.jpg", "afterglow_mira.jpg", "afterglow_sela.jpg", "afterglow_vess.jpg",
  "amara_rear.jpg", "amara_tomas_afterglow.jpg",
  "lingerie_amara.jpg", "lingerie_lena.jpg", "lingerie_mira.jpg", "lingerie_sela.jpg", "lingerie_vess.jpg",
  "mira_rear.jpg", "mira_shower.jpg",
  "pursuit_lena.jpg", "pursuit_mira.jpg", "pursuit_sela.jpg",
  "rear_amara.jpg", "rear_lena.jpg", "rear_mira.jpg", "rear_sela.jpg", "rear_vess.jpg",
  "romance_amara_1.jpg", "romance_amara_tomas.jpg", "romance_lena_1.jpg", "romance_mira_1.jpg",
  "romance_sela_1.jpg", "romance_vess_1.jpg",
  "sela_rear.jpg",
  "shower_amara.jpg", "shower_lena.jpg", "shower_mira.jpg", "shower_sela.jpg", "shower_vess.jpg",
  "vess_intimate.jpg"
];
// Clothed pictures the audit marked borderline (a tank top with briefs, or lingerie under a coat).
// They are left uncovered: the setting covers nudity. Listing them is the owner's call.
const AUDITED_CLOTHED_BORDERLINE = ["corridor.jpg", "warmth_laughter.jpg", "warmth_music.jpg", "offshift_lena.jpg"];
// Pictures that plainly show no nudity, to prove the cover is not put on everything.
const CLOTHED_SAMPLE = ["medical_bay.jpg", "lena.jpg", "vess.jpg", "bodysuit_lena.jpg", "ship_exterior_2.jpg", "corridor_variant_3.jpg"];

function listChecks(errors, summary) {
  const runtime = loadGame(ROOT);
  const listed = JSON.parse(runtime.evaluate(`JSON.stringify([...NUDITY_PICTURES].sort())`));
  const audited = [...AUDITED].sort();
  if (new Set(AUDITED).size !== AUDITED.length) errors.push("A: the audited list names a picture twice");
  if (JSON.stringify(listed) !== JSON.stringify(audited)) {
    const missing = audited.filter(name => !listed.includes(name));
    const extra = listed.filter(name => !audited.includes(name));
    errors.push(`A: NUDITY_PICTURES differs from the audited list (missing: ${missing.join(", ") || "none"}; not audited: ${extra.join(", ") || "none"})`);
  }
  const files = readdirSync(resolve(ROOT, "images"));
  for (const name of [...AUDITED, ...AUDITED_CLOTHED_BORDERLINE, ...CLOTHED_SAMPLE]) {
    if (!existsSync(resolve(ROOT, "images", name))) errors.push(`A: images/${name} is named here but does not exist`);
  }
  for (const name of AUDITED_CLOTHED_BORDERLINE) {
    if (listed.includes(name)) errors.push(`A: ${name} is listed in the engine but recorded here as left uncovered; update both together`);
  }
  if (files.length !== AUDITED_IMAGE_COUNT) errors.push(`A: images/ holds ${files.length} files, the audit covered ${AUDITED_IMAGE_COUNT}; look at the new or missing picture and classify it`);
  try {
    const tree = execFileSync("git", ["rev-parse", "HEAD:images"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } }).trim();
    if (tree !== AUDITED_IMAGES_TREE) errors.push(`A: images tree is ${tree}, the audit covered ${AUDITED_IMAGES_TREE}; a picture changed, so look at it, list it or leave it off, then move the pin`);
  } catch (error) {
    errors.push(`A: images tree unavailable: ${String(error && error.message).slice(0, 120)}`);
  }
  summary.push(`A: ${listed.length} listed pictures match the audit of ${AUDITED_IMAGE_COUNT} files`);
}

function settingChecks(errors) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const key = ${JSON.stringify(KEY)};
    const pressed = () => ["btn-cover-nudity", "meta-cover-nudity"].map(id => document.getElementById(id).getAttribute("aria-pressed")).join(",");
    const chip = () => document.getElementById("cover-nudity-chip").textContent;
    const o = {};
    localStorage.clear();
    o.defaultOn = coverNudityInPictures();
    syncCoverNudityControls();
    o.defaultPressed = pressed(); o.defaultChip = chip();
    o.setOn = setCoverNudity(true); o.onStored = localStorage.getItem(key); o.onPressed = pressed(); o.onChip = chip();
    o.toggled = toggleCoverNudity(); o.offStored = localStorage.getItem(key); o.offPressed = pressed();
    // storage blocked: the toggle still works for the session
    const realSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => { throw new Error("blocked"); };
    let threw = false;
    try { o.blockedOn = toggleCoverNudity(); } catch (e) { threw = true; }
    o.blockedThrew = threw; o.blockedReads = coverNudityInPictures(); o.blockedPressed = pressed();
    localStorage.setItem = realSet;
    return o;
  })())`));
  if (out.defaultOn !== false || out.defaultPressed !== "false,false") errors.push("B: the setting is not off by default");
  if (!/^Off\b/.test(out.defaultChip)) errors.push(`B: default chip reads "${out.defaultChip}"`);
  if (out.setOn !== true || out.onStored !== "1" || out.onPressed !== "true,true") errors.push("B: turning the setting on did not store it or press both controls");
  if (!/^On\b/.test(out.onChip) || !/text is unchanged/.test(out.onChip)) errors.push(`B: the on chip must say the text is unchanged; it reads "${out.onChip}"`);
  if (out.toggled !== false || out.offStored !== "0" || out.offPressed !== "false,false") errors.push("B: toggling off did not store it or release both controls");
  if (out.blockedThrew || out.blockedOn !== true || out.blockedReads !== true || out.blockedPressed !== "true,true") errors.push("B: with storage blocked the toggle must still hold for the session");

  // A stored "1" is read on a fresh load; anything else is off.
  for (const [stored, want] of [["1", true], ["0", false], ["true", false], [null, false]]) {
    const got = loadGame(ROOT).evaluate(`(() => { localStorage.clear(); ${stored === null ? "" : `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(stored)});`} return coverNudityInPictures(); })()`);
    if (got !== want) errors.push(`B: stored ${JSON.stringify(stored)} read as ${got}`);
  }
}

function coverChecks(errors, summary) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const ids = ${JSON.stringify(PICTURE_IDS)}, listed = ${JSON.stringify(AUDITED)}, clothed = ${JSON.stringify([...CLOTHED_SAMPLE, ...AUDITED_CLOTHED_BORDERLINE])};
    const bad = [];
    const covered = id => document.getElementById(id).classList.contains("nudity-covered");
    const show = (id, src) => { const img = document.getElementById(id); setManagedImageSource(img, ""); setManagedImageSource(img, src); };
    localStorage.clear();
    // off: nothing is ever covered
    for (const id of ids) for (const name of listed) { show(id, "images/" + name); if (covered(id)) bad.push("off: " + id + " covered " + name); }
    setCoverNudity(true);
    for (const id of ids) {
      for (const name of listed) { show(id, "images/" + name); if (!covered(id)) bad.push("on: " + id + " left " + name + " bare"); }
      for (const name of clothed) { show(id, "images/" + name); if (covered(id)) bad.push("on: " + id + " covered clothed " + name); }
      show(id, "images/" + listed[0]); setManagedImageSource(document.getElementById(id), "");
      if (covered(id)) bad.push("on: " + id + " stayed covered after it was emptied");
    }
    // turning the setting on or off updates what is already on screen
    setCoverNudity(false); show("scene-image", "images/" + listed[1]);
    const before = covered("scene-image"); setCoverNudity(true); const after = covered("scene-image"); setCoverNudity(false); const offAgain = covered("scene-image");
    const names = {
      plain: pictureShowsNudity("images/" + listed[2]), absolute: pictureShowsNudity("http://127.0.0.1:8080/images/" + listed[2] + "?v=3#x"),
      bare: pictureShowsNudity(listed[2]), clothed: pictureShowsNudity("images/medical_bay.jpg"), prefix: pictureShowsNudity("images/x_" + listed[2]),
      empty: pictureShowsNudity(""), notString: pictureShowsNudity(null) || pictureShowsNudity(undefined) || pictureShowsNudity(7)
    };
    return { bad, toggleLive: [before, after, offAgain], names };
  })())`));
  for (const line of out.bad.slice(0, 20)) errors.push("C: " + line);
  if (JSON.stringify(out.toggleLive) !== "[false,true,false]") errors.push(`C: toggling must update the picture already on screen (got ${JSON.stringify(out.toggleLive)})`);
  const n = out.names;
  if (!n.plain || !n.absolute || !n.bare) errors.push("C: a listed picture must match by file name whatever the path, query or hash");
  if (n.clothed || n.prefix || n.empty || n.notString) errors.push("C: an unlisted, empty or non-string source matched the list");
  summary.push(`C: ${AUDITED.length} listed pictures covered on ${PICTURE_IDS.length} picture elements when on, none when off`);
}

// A browser keeps the old picture on screen until the new one has loaded. The headless stub
// fires no load events, so this drives the engine with an element that does.
function heldCoverChecks(errors) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const listed = "images/${AUDITED[8]}", clothedA = "images/medical_bay.jpg", clothedB = "images/corridor_variant_3.jpg";
    const make = () => {
      const img = document.createElement("img"), wrap = document.createElement("div"), handlers = {};
      img.parentElement = wrap;
      img.addEventListener = (type, fn) => { (handlers[type] = handlers[type] || []).push(fn); };
      img.fire = type => (handlers[type] || []).forEach(fn => fn());
      return img;
    };
    const covered = img => img.classList.contains("nudity-covered");
    const o = {};
    localStorage.clear(); setCoverNudity(true);
    // a covered picture, then a slow clothed one
    let img = make();
    setManagedImageSource(img, listed); o.s1 = covered(img); img.fire("load"); o.s2 = covered(img);
    setManagedImageSource(img, clothedA); o.heldWhileLoading = covered(img); o.wrapHeld = img.parentElement.classList.contains("picture-covered");
    img.fire("load"); o.liftedAfterLoad = !covered(img); o.wrapLifted = !img.parentElement.classList.contains("picture-covered");
    // two quick changes: the first replacement never loads
    img = make();
    setManagedImageSource(img, listed); img.fire("load");
    setManagedImageSource(img, clothedA); setManagedImageSource(img, clothedB); o.heldAcrossTwoChanges = covered(img);
    img.fire("load"); o.liftedAfterSecondLoad = !covered(img);
    // the replacement fails to load: nothing is on screen, so the cover lifts
    img = make();
    setManagedImageSource(img, listed); img.fire("load"); setManagedImageSource(img, clothedA); img.fire("error"); o.liftedAfterError = !covered(img);
    // emptied: nothing is on screen
    img = make();
    setManagedImageSource(img, listed); img.fire("load"); setManagedImageSource(img, ""); o.liftedWhenEmptied = !covered(img);
    setManagedImageSource(img, clothedA); o.notHeldAfterEmpty = !covered(img);
    // clothed to listed: covered at once, before it loads
    img = make();
    setManagedImageSource(img, clothedA); img.fire("load"); setManagedImageSource(img, listed); o.coveredBeforeLoad = covered(img);
    // the reader turns the setting off while a cover is held, then on again
    img = make();
    setManagedImageSource(img, listed); img.fire("load"); setManagedImageSource(img, clothedA);
    coverNuditySessionValue = false; syncPictureCover(img); o.offLiftsHeld = !covered(img);
    coverNuditySessionValue = true; syncPictureCover(img); o.onRestoresHeld = covered(img);
    return o;
  })())`));
  const want = { s1: true, s2: true, heldWhileLoading: true, wrapHeld: true, liftedAfterLoad: true, wrapLifted: true, heldAcrossTwoChanges: true,
    liftedAfterSecondLoad: true, liftedAfterError: true, liftedWhenEmptied: true, notHeldAfterEmpty: true, coveredBeforeLoad: true, offLiftsHeld: true, onRestoresHeld: true };
  for (const [name, value] of Object.entries(want)) if (out[name] !== value) errors.push(`D: ${name} is ${out[name]}, expected ${value}`);
}

// Seeded real play, once with the setting off and once on. The cover must track the picture on
// every screen, and the two walks must be the same walk.
function playChunk(seed, on) {
  return JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    persistSave = () => true;
    const choicesEl = document.getElementById("choices");
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    localStorage.clear();
    if (${on}) localStorage.setItem(${JSON.stringify(KEY)}, "1");
    let seed = ${seed};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const img = document.getElementById("scene-image");
    const bad = [], seen = {}, paths = [];
    let screens = 0, coveredScreens = 0, ended = 0, text = 0;
    for (let r = 0; r < ${RUNS_PER_SEED}; r++) {
      resetRunState();
      showScene("wake");
      const path = [];
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        path.push(id);
        if (id === "ending_check" || !scenes[id]) { ended++; break; }
        screens++;
        const src = typeof img.__ssManagedSource === "string" ? img.__ssManagedSource : "";
        const listed = pictureShowsNudity(src), covered = img.classList.contains("nudity-covered");
        if (listed) seen[src.split("/").pop()] = (seen[src.split("/").pop()] || 0) + 1;
        if (covered) coveredScreens++;
        if (covered !== (${on} && listed)) bad.push(id + ": " + (src || "no picture") + " covered=" + covered);
        // a cheap fingerprint of the story text, to compare the two walks
        const story = document.getElementById("story").innerHTML; for (let i = 0; i < story.length; i += 97) text = (text * 31 + story.charCodeAt(i)) | 0;
        const scene = scenes[id];
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) break;
        makeChoice(choices[Math.floor(rnd() * choices.length)]);
      }
      paths.push(path.join(">"));
    }
    let digest = 0; for (const p of paths) for (let i = 0; i < p.length; i++) digest = (digest * 33 + p.charCodeAt(i)) | 0;
    const end = [state.integrity, state.cohesion, state.supplies, state.embryos, state.survivors, Object.keys(state.flags).length].join("/");
    return { bad, seen, screens, coveredScreens, ended, digest, text, end };
  })())`, 600_000));
}

function realPlayChecks(errors, summary) {
  const seen = {};
  let screens = 0, covered = 0, ended = 0;
  for (const seed of SEEDS) {
    const off = playChunk(seed, false), on = playChunk(seed, true);
    for (const line of [...off.bad, ...on.bad].slice(0, 10)) errors.push(`E: seed ${seed}: ${line}`);
    if (off.coveredScreens) errors.push(`E: seed ${seed}: ${off.coveredScreens} screens were covered with the setting off`);
    if (off.digest !== on.digest || off.end !== on.end) errors.push(`E: seed ${seed}: the setting changed the walk (path ${off.digest} vs ${on.digest}; end ${off.end} vs ${on.end})`);
    if (off.text !== on.text) errors.push(`E: seed ${seed}: the setting changed the story text`);
    for (const [name, count] of Object.entries(on.seen)) seen[name] = (seen[name] || 0) + count;
    screens += on.screens; covered += on.coveredScreens; ended += on.ended;
  }
  if (!covered) errors.push("E: no seeded run reached a listed picture, so real play proved nothing; add seeds");
  summary.push(`E: ${SEEDS.length * RUNS_PER_SEED} seeded runs each way (${ended} reached the ending): ${covered} of ${screens} screens covered when on, across ${Object.keys(seen).length} listed pictures; same path, state and text with it off`);
}

function saveChecks(errors) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    localStorage.clear();
    resetRunState();
    showScene("wake");
    setCoverNudity(true);
    persistSave({ silent: true });
    return { save: localStorage.getItem(SAVE_KEY) || "", snapshot: JSON.stringify(snapshotState()), stateKeys: Object.keys(state).join(","), flagKeys: Object.keys(state.flags).join(",") };
  })())`));
  if (!out.save) errors.push("F: no save was written");
  for (const [name, text] of Object.entries(out)) if (/nudity|cover_?nud/i.test(text)) errors.push(`F: the setting leaked into the ${name}`);
}

function sourceChecks(errors) {
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const css = readFileSync(resolve(ROOT, "css/paced-reveal.css"), "utf8");
  for (const id of ["btn-cover-nudity", "meta-cover-nudity"]) {
    const tag = index.match(new RegExp(`<button id="${id}"[^>]*>`))?.[0] || "";
    if (!tag.includes('type="button"') || !tag.includes('aria-pressed="false"') || !tag.includes('onclick="toggleCoverNudity()"')) errors.push(`G: ${id} is not a native toggle button with aria-pressed`);
  }
  if (!/<div class="title-actions">[\s\S]*id="btn-cover-nudity"[\s\S]*<\/div>/.test(index)) errors.push("G: the setting is missing from the title utilities");
  if (!/id="cover-nudity-chip"[^>]*role="status"/.test(index)) errors.push("G: the title chip is missing or silent");
  const meta = index.match(/<div id="meta"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || "";
  if (!/<div class="meta-actions">\s*<button id="meta-text-pace"[\s\S]*id="meta-cover-nudity"/.test(meta)) errors.push("G: the in-run toggle is not in the footer actions after the text setting");
  if (!/aria-label="Cover nudity in pictures"[^>]*>Cover nudity</.test(index)) errors.push("G: the footer toggle's accessible name must contain its visible label");
  const cover = css.match(/#scene-image\.nudity-covered,[\s\S]*?\{([\s\S]*?)\}/)?.[1] || "";
  if (!/filter:\s*blur\(\d+px\)[^;]*!important/.test(cover)) errors.push("G: the cover rule must blur and be !important");
  if (!/transition:\s*none\s*!important/.test(cover)) errors.push("G: the cover must not fade in or out");
  for (const id of PICTURE_IDS) if (!css.includes(`#${id}.nudity-covered`)) errors.push(`G: no cover rule names #${id}`);
  if (!/@media \(max-width: 599px\) \{\s*#meta-cover-nudity \{\s*display: none;/.test(css)) errors.push("G: the footer toggle must stay out of the bar below 600px, where it pushes Load off screen");
}

export function sunPlayerflowNudityFilterChecks() {
  const errors = [];
  const summary = [];
  listChecks(errors, summary);
  settingChecks(errors);
  coverChecks(errors, summary);
  heldCoverChecks(errors);
  realPlayChecks(errors, summary);
  saveChecks(errors);
  sourceChecks(errors);
  return { errors, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary } = sunPlayerflowNudityFilterChecks();
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-nudity-filter");
    for (const line of errors.slice(0, 60)) console.error("FAIL " + line);
    if (errors.length > 60) console.error(`FAIL ... ${errors.length - 60} more`);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-nudity-filter (off by default; on, every listed picture is covered on every picture element and stays covered while its replacement loads; the walk, the text and the save are the same either way)");
}
