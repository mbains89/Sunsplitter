// Sunsplitter — engine.js
// Version 0.25.3 — Causality lies (dead speech / unread state)
// Core game loop: showScene, choices, stats, save/load, endings
// Keep story content out of this file.

const TONE_ACK_KEY = "sunsplitter_tone_ack_v1";
const SAVE_KEY = "sunsplitter_save_v3";
const SAVE_KEY_LEGACY = "sunsplitter_save_v2";
const SAVE_STAGING_KEY = "sunsplitter_save_v3_staging";
const SAVE_BACKUP_KEY = "sunsplitter_save_v3_backup";
const SAVE_SCHEMA_VERSION = 3;
const MIN_IMPORT_SCHEMA_VERSION = 2;
const MAX_IMPORT_BYTES = 1_048_576;

// 0.25: track loaded save gameVersion for in-flight skip of new Elias/Mira lethals
let loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");
let renderingSavedScene = false;
let pendingLegacyResume = null;
let preserveCompletedSlotUntilChoice = false;
let currentEndingArt = "";
let suspendedImagePresentation = null;

function parseSemanticVersion(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(?:v)?(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/);
  if (!match) return null;
  const prerelease = match[4] ? match[4].split(".") : [];
  if (prerelease.some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith("0"))) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3] || 0)],
    prerelease
  };
}

function compareSemanticVersions(left, right) {
  const a = parseSemanticVersion(left);
  const b = parseSemanticVersion(right);
  if (!a || !b) return null;
  for (let i = 0; i < a.core.length; i += 1) {
    if (a.core[i] !== b.core[i]) return a.core[i] < b.core[i] ? -1 : 1;
  }
  if (!a.prerelease.length && !b.prerelease.length) return 0;
  if (!a.prerelease.length) return 1;
  if (!b.prerelease.length) return -1;
  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < length; i += 1) {
    if (a.prerelease[i] == null) return -1;
    if (b.prerelease[i] == null) return 1;
    if (a.prerelease[i] === b.prerelease[i]) continue;
    const aNumeric = /^\d+$/.test(a.prerelease[i]);
    const bNumeric = /^\d+$/.test(b.prerelease[i]);
    if (aNumeric && bNumeric) return Number(a.prerelease[i]) < Number(b.prerelease[i]) ? -1 : 1;
    if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
    return a.prerelease[i] < b.prerelease[i] ? -1 : 1;
  }
  return 0;
}

function isGameVersionBefore(version, minimum) {
  const comparison = compareSemanticVersions(version, minimum);
  // Unknown version syntax fails closed into the older-save compatibility path.
  return comparison == null || comparison < 0;
}

function hasAcknowledgedTone() {
  try {
    return localStorage.getItem(TONE_ACK_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function acknowledgeTone() {
  try {
    localStorage.setItem(TONE_ACK_KEY, "1");
  } catch (e) { /* private mode — still proceed */ }
  showTitleScreen();
}

function resetRunState() {
  loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");
  const fresh = typeof freshState === "function" ? freshState() : null;
  if (fresh) {
    Object.keys(state).forEach(k => { delete state[k]; });
    Object.assign(state, fresh);
  } else {
    // Fallback if freshState missing
    state.survivors = 9;
    state.integrity = 62;
    state.cohesion = 48;
    state.supplies = 61;
    state.embryos = 100;
    state.flags = {};
    state.dead = [];
    state.deathCause = {};
    state.scene = "wake";
    state.affinity = { lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 };
    state.trust = { lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 };
    state.romance = {};
    state.pursuit = {};
    state.favors = {};
    state.past_known_by = {};
    state.dying = {};
    state.past_known = false;
    state.marks = {};
    state.memories = [];
    state.ideology = { future: 0, living: 0 };
    state.recovered = { tomas: false, jiro: false, vess: false };
    state.promises = {};
    state.crisisPath = null;
  }
}

function replaceRunState(next) {
  Object.keys(state).forEach(k => { delete state[k]; });
  Object.assign(state, next);
}

function beginFreshCampaign(opts) {
  opts = opts || {};
  let previousState = null;
  const previousGameVersion = loadedGameVersion;
  const previousSlotGuard = preserveCompletedSlotUntilChoice;
  if (opts.persist) {
    try {
      previousState = JSON.parse(JSON.stringify(state));
    } catch (e) {
      flashSaveStatus("New run failed · current run kept", true, true);
      return false;
    }
  }
  resetRunState();
  if (opts.persist && !persistSave({ silent: true, retireLegacy: true })) {
    replaceRunState(previousState);
    loadedGameVersion = previousGameVersion;
    preserveCompletedSlotUntilChoice = previousSlotGuard;
    return false;
  }
  preserveCompletedSlotUntilChoice = !!opts.preserveCompletedSlotUntilChoice;
  showScreen("game");
  renderStatus();
  showScene("wake");
  return true;
}

function startGame() {
  // New run overwrites the slot — warn if a save exists
  if (hasSave()) {
    const ok = window.confirm("Start a new run? This will replace your saved progress.");
    if (!ok) return false;
  }
  return beginFreshCampaign({ persist: true });
}

function playAgain() {
  // Ending / What Remains: start a fresh campaign in memory.
  // Leave the completed slot on disk so Continue can still load it.
  beginFreshCampaign({ persist: false, preserveCompletedSlotUntilChoice: true });
}

function showTitleScreen() {
  showScreen("title");
  refreshTitleResumeUI();
}

function imageAlternative(src) {
  if (!src || typeof src !== "string") return "";
  const filename = src.split("/").pop().replace(/\.[^.]+$/, "");
  const crewNames = {
    lena: "Lena", elias: "Elias", mira: "Mira", tomas: "Tomas",
    amara: "Amara", jiro: "Jiro", sela: "Sela", vess: "Vess", rourke: "Rourke"
  };
  if (crewNames[filename]) return `Portrait of ${crewNames[filename]}.`;
  const words = filename
    .replace(/_(?:alt|\d+)$/, "")
    .split("_")
    .filter(Boolean)
    .map(word => crewNames[word] || word)
    .join(" ");
  const label = words ? words.charAt(0).toUpperCase() + words.slice(1) : "the ship";
  return `Scene illustration: ${label}.`;
}

// Keep one decoded resource per visible surface. Reassigning the same URL can
// restart image work on constrained browsers, while hidden image references
// can keep large decoded plates resident after their surface is gone.
function setManagedImageSource(img, src) {
  if (!img) return false;
  const next = typeof src === "string" ? src : "";
  const current = typeof img.__ssManagedSource === "string"
    ? img.__ssManagedSource
    : ((typeof img.getAttribute === "function" && img.getAttribute("src")) || "");
  if (current === next) return false;
  if (next) img.src = next;
  else if (typeof img.removeAttribute === "function") img.removeAttribute("src");
  img.__ssManagedSource = next;
  return true;
}

function endingArtAlternative() {
  const endingTitle = document.getElementById("ending-title");
  const title = endingTitle && endingTitle.textContent ? endingTitle.textContent.trim() : "Ending";
  return `${title} ending illustration.`;
}

function syncEndingArtForScreen(id) {
  for (const [screenId, wrapId, imageId] of [
    ["ending", "ending-image-wrap", "ending-image"],
    ["what-remains", "what-remains-image-wrap", "what-remains-image"]
  ]) {
    const wrap = document.getElementById(wrapId);
    const img = document.getElementById(imageId);
    const activeSource = id === screenId ? currentEndingArt : "";
    setManagedImageSource(img, activeSource);
    if (img) img.alt = activeSource ? endingArtAlternative() : "";
    if (wrap) wrap.classList.toggle("visible", !!activeSource);
  }
}

function releaseInactiveArtForScreen(id) {
  if (id !== "game") {
    const sceneImage = document.getElementById("scene-image");
    setManagedImageSource(sceneImage, "");
    if (sceneImage) sceneImage.alt = "";
  }
  syncEndingArtForScreen(id);
}

function suspendPresentationImages() {
  if (suspendedImagePresentation) return;
  suspendedImagePresentation = ["scene-image", "ending-image", "what-remains-image"].map(id => {
    const img = document.getElementById(id);
    return {
      id,
      src: img && typeof img.__ssManagedSource === "string" ? img.__ssManagedSource : "",
      alt: img ? img.alt : ""
    };
  });
  for (const item of suspendedImagePresentation) {
    setManagedImageSource(document.getElementById(item.id), "");
  }
}

function restorePresentationImages() {
  const presentation = suspendedImagePresentation;
  suspendedImagePresentation = null;
  if (!presentation) return;
  for (const item of presentation) {
    const img = document.getElementById(item.id);
    setManagedImageSource(img, item.src);
    if (img) img.alt = item.alt;
  }
}

// Boot: tone once → title (with Continue if save exists)
(function bootScreens() {
  function go() {
    if (hasAcknowledgedTone()) showTitleScreen();
    else showScreen("tone");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();

function showScene(id, opts) {
  opts = opts || {};
  state.scene = id;
  document.getElementById("scene-id").textContent = id;

  if (id === "ending_check") {
    resolveEnding();
    return;
  }

  const scene = scenes[id];
  if (!scene) {
    document.getElementById("story").innerHTML = `<div class="scene-text"><p>Scene missing: ${id}</p></div>`;
    return;
  }

  // onEnter may return a redirect scene id (avoids recursive showScene overwrite bug)
  if (scene.onEnter && !opts.skipOnEnter) {
    const redirect = scene.onEnter();
    if (typeof redirect === "string" && redirect && redirect !== id) {
      showScene(redirect);
      return;
    }
  }

  // Scene illustration
  const imgWrap = document.getElementById("scene-image-wrap");
  const img = document.getElementById("scene-image");
  // Prefer per-scene image override, else death-aware sceneImages resolution
  const imgSrc = resolveSceneImage(id, scene);
  imgWrap.classList.remove("intimate");
  imgWrap.classList.remove("minimized"); // full size on every new scene
  window.__ssImagePinned = false; // 0.24.92: clear manual pin
  if (imgSrc) {
    setManagedImageSource(img, imgSrc);
    img.alt = imageAlternative(imgSrc);
    imgWrap.classList.add("visible");
    if (isIntimateScene(id, scene)) imgWrap.classList.add("intimate");
  } else {
    imgWrap.classList.remove("visible");
    setManagedImageSource(img, "");
    img.alt = "";
  }

  // Reset text scroll so image starts expanded
  const mainEl = document.getElementById("main");
  if (mainEl) mainEl.scrollTop = 0;

  let raw;
  renderingSavedScene = !!opts.resume;
  try {
    raw = typeof scene.text === "function" ? scene.text() : (scene.text || "");
  } finally {
    renderingSavedScene = false;
  }
  const html = String(raw)
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  document.getElementById("story").innerHTML = `<div class="scene-text">${html}</div>`;

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  const choiceList = typeof scene.choices === "function" ? scene.choices() : (scene.choices || []);
  choiceList.forEach(c => {
    // Death-gated options stay hidden (person is gone). Resource gates show disabled + reason.
    if (c.alive && !isAlive(c.alive)) return;
    if (c.aliveAll && !c.aliveAll.every(k => isAlive(k))) return;
    if (c.aliveAny && !c.aliveAny.some(k => isAlive(k))) return;

    const requirementsMet = !c.requires || meetsRequirements(c.requires);
    const unpaid = c.effects && !canAffordEffects(c.effects);
    const gated = !requirementsMet || unpaid;
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (gated ? " disabled" : "");
    btn.type = "button";
    const renderedChoiceNumber = choicesEl.children.length + 1;
    if (renderedChoiceNumber <= 9) btn.setAttribute("aria-keyshortcuts", String(renderedChoiceNumber));
    const tagHtml = formatTagHtml(c.tag);
    if (gated) {
      btn.disabled = true;
      let reason = requirementsMet ? "" : formatRequiresReason(c.requires);
      if (!reason && unpaid) reason = formatUnpaidEffectsReason(c.effects);
      if (!reason) reason = "Requirements not met";
      btn.innerHTML = `<span class="choice-label">${escapeHtml(c.text)}${tagHtml}</span>` +
        (reason ? `<span class="choice-reason">${escapeHtml(reason)}</span>` : "");
    } else {
      const effectsHtml = formatEffectsHtml(c.effects);
      btn.innerHTML = `<span class="choice-label">${escapeHtml(c.text)}${tagHtml}</span>${effectsHtml}`;
      btn.onclick = () => makeChoice(c);
    }
    choicesEl.appendChild(btn);
  });

  const enabledChoices = gameplayChoiceButtons().filter(btn => !btn.disabled);
  if (enabledChoices.length === 1) {
    const shortcuts = enabledChoices[0].getAttribute("aria-keyshortcuts");
    enabledChoices[0].setAttribute("aria-keyshortcuts", `${shortcuts ? `${shortcuts} ` : ""}Enter Space`);
  }

  renderStatus();

  // A choice replaces the focused button. Move the reading cursor to the new
  // passage without disturbing the explicit scroll reset above.
  const storyEl = document.getElementById("story");
  if (storyEl && typeof storyEl.focus === "function") {
    try { storyEl.focus({ preventScroll: true }); }
    catch (e) { storyEl.focus(); }
  }
}

function gameplayChoiceButtons() {
  const choices = document.getElementById("choices");
  if (!choices || !choices.children) return [];
  return Array.from(choices.children).filter(btn => {
    const classes = String(btn.className || "").split(/\s+/);
    return classes.includes("choice-btn");
  });
}

function keyboardTargetIsInteractive(target) {
  if (!target) return false;
  const tag = String(target.tagName || target.nodeName || "").toUpperCase();
  if (["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(tag)) return true;
  if (target.isContentEditable) return true;
  if (typeof target.closest === "function") {
    return !!target.closest("button, a, input, select, textarea, [contenteditable='true']");
  }
  return false;
}

function activateGameplayChoice(btn, event) {
  if (!btn || btn.disabled) return false;
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (typeof btn.click === "function") btn.click();
  else if (typeof btn.onclick === "function") btn.onclick();
  return true;
}

function handleGameplayKeydown(event) {
  if (!event || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return false;
  if (keyboardTargetIsInteractive(event.target)) return false;

  const game = document.getElementById("game-screen");
  if (!game || game.classList.contains("hidden")) return false;

  const buttons = gameplayChoiceButtons();
  if (/^[1-9]$/.test(event.key || "")) {
    return activateGameplayChoice(buttons[Number(event.key) - 1], event);
  }

  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
    const enabled = buttons.filter(btn => !btn.disabled);
    if (enabled.length === 1) return activateGameplayChoice(enabled[0], event);
  }
  return false;
}

(function wireGameplayKeyboard() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  document.addEventListener("keydown", handleGameplayKeydown);
})();

function canAffordEffects(effects) {
  if (!effects || typeof effects !== "object") return true;
  for (const [k, v] of Object.entries(effects)) {
    if (typeof v !== "number" || v >= 0) continue;
    // Negative resource effect — must be fully payable
    const cur = typeof state[k] === "number" ? state[k] : 0;
    if (cur + v < 0) return false;
  }
  return true;
}

function formatUnpaidEffectsReason(effects) {
  if (!effects || typeof effects !== "object") return "";
  const labels = { integrity: "Hull", cohesion: "Cohesion", supplies: "Supplies", embryos: "Embryos", survivors: "Survivors" };
  for (const key of ["integrity", "cohesion", "supplies", "embryos", "survivors"]) {
    const delta = effects[key];
    if (typeof delta !== "number" || delta >= 0) continue;
    const have = typeof state[key] === "number" ? state[key] : 0;
    const need = -delta;
    if (have < need) return `Needs ${need} ${labels[key]}; ${have} available`;
  }
  return "";
}

function formatRequiresReason(req) {
  if (!req || typeof req !== "object") return "";
  const labels = { integrity: "Hull", cohesion: "Cohesion", supplies: "Supplies", embryos: "Embryos", survivors: "Survivors" };
  for (const key of ["integrity", "cohesion", "supplies", "embryos", "survivors"]) {
    const rule = req[key];
    const need = typeof rule === "number" ? rule : (rule && rule.min);
    const have = state[key];
    if (need !== undefined && typeof have === "number" && have < need) {
      return `Needs ${need} ${labels[key]}; ${have} available`;
    }
  }
  const trust = req.trust;
  if (trust && typeof trust === "object") {
    for (const [who, rule] of Object.entries(trust)) {
      const need = typeof rule === "number" ? rule : (rule && rule.min);
      const have = (state.trust && state.trust[who]) || 0;
      if (need !== undefined && have < need) return `Needs more trust from ${crewFirstName(who)}`;
    }
  }
  return "";
}

function crewFirstName(key) {
  if (crew[key] && crew[key].first) return crew[key].first;
  if (crew[key] && crew[key].name) {
    // Prefer first token unless title-like (Dr., Brother)
    const parts = crew[key].name.split(" ");
    if (parts[0] === "Dr." || parts[0] === "Brother") return parts[1] || parts[0];
    return parts[0];
  }
  return key;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function meetsRequirements(req) {
  if (!req || typeof req !== "object") return true;
  for (const [k, rule] of Object.entries(req)) {
    // trust: { mira: 40 } or { mira: { min: 40, max: 90 } }
    if (k === "trust") {
      if (!rule || typeof rule !== "object") continue;
      for (const [who, tRule] of Object.entries(rule)) {
        const val = (state.trust && state.trust[who]) || 0;
        if (typeof tRule === "number") {
          if (val < tRule) return false;
        } else if (typeof tRule === "object") {
          if (tRule.min !== undefined && val < tRule.min) return false;
          if (tRule.max !== undefined && val > tRule.max) return false;
        }
      }
      continue;
    }
    const val = state[k];
    if (val === undefined) continue;
    if (typeof rule === "number") {
      if (val < rule) return false;
    } else if (typeof rule === "object") {
      if (rule.min !== undefined && val < rule.min) return false;
      if (rule.max !== undefined && val > rule.max) return false;
    }
  }
  return true;
}

function formatEffectsHtml(effects) {
  if (!effects || typeof effects !== "object") return "";
  const labels = {
    integrity: "Hull",
    cohesion: "Cohesion",
    supplies: "Supplies",
    embryos: "Embryos",
    survivors: "Survivors"
  };
  const caps = {
    integrity: [0, 100],
    cohesion: [0, 100],
    supplies: [0, 100],
    embryos: [0, 100],
    survivors: [0, 20]
  };
  const parts = [];
  for (const [k, v] of Object.entries(effects)) {
    if (!labels[k] || !v) continue;
    const cur = typeof state[k] === "number" ? state[k] : 0;
    const [lo, hi] = caps[k] || [0, 100];
    const applied = Math.max(lo, Math.min(hi, cur + v)) - cur;
    if (applied === 0) {
      // Attempted change is fully blocked by floor/ceiling — do not look free or applied
      if (v < 0) parts.push(`<span class="effect-con">${labels[k]} already at floor</span>`);
      else parts.push(`<span class="effect-pro">${labels[k]} already at ceiling</span>`);
      continue;
    }
    const cls = applied > 0 ? "effect-pro" : "effect-con";
    const sign = applied > 0 ? "+" : "";
    // Show the real applied delta (honest); if clamp truncated, note it
    let note = "";
    if (applied !== v) note = " (clamped)";
    parts.push(`<span class="${cls}">${sign}${applied} ${labels[k]}${note}</span>`);
  }
  return parts.length ? ` <span class="choice-effects">[${parts.join(" ")}]</span>` : "";
}

/** Quiet discoverability cue for romance / non-sexual bond offers. */
function formatTagHtml(tag) {
  if (!tag || typeof tag !== "string") return "";
  const allowed = { private: "private", bond: "bond" };
  const label = allowed[tag];
  if (!label) return "";
  return ` <span class="choice-tag">[${label}]</span>`;
}


// L-024 Option B: ending resolution never invents a result for an untested promise.
// Only an authored promise-test scene may change "made" to "kept" or "broken".
function forceResolvePromises() {
  if (!state.promises) return;
}

function lastEndingMemory() {
  const memories = Array.isArray(state.memories) ? state.memories : [];
  const untestedHolders = Object.keys(state.promises || {}).filter(who => state.promises[who] === "made");
  for (let i = memories.length - 1; i >= 0; i--) {
    const memory = String(memories[i]);
    const lower = memory.toLowerCase();
    const isUntestedPromise = untestedHolders.some(who => {
      const holder = crewFirstName(who).toLowerCase();
      return lower.includes("promis") && lower.includes(holder);
    });
    if (!isUntestedPromise) return memory;
  }
  return null;
}

function resolveEnding() {
  forceResolvePromises();
  const s = state.survivors;
  const c = state.cohesion;
  const emb = state.embryos;
  const integ = state.integrity;
  const sup = state.supplies;
  const deadNames = namedDead();
  const crisis = state.flags.crisis;
  const final = state.flags.final;
  const planet = state.flags.planet;
  const leadership = state.flags.leadership;
  const reckon = state.flags.reckon;
  const vaultSac = state.flags.vault_sacrifice;
  const preg = state.flags.pregnancy_risk;
  const fav = favoritism();
  const shape = ideologyShape();
  const futureVoices = voicesFor("future");
  const livingVoices = voicesFor("living");

  let title = "";
  let text = "";
  let art = null;

  // --- Rare: The Yellow Circle ---
  // Reachable: no vent, Sela spoken + not ignored, living shape, cohesion/survivors,
  // Tomas not broken by player choice, final is endure/hold/comfort
  if (canYellowCircle()) {
    title = "The Yellow Circle";
    art = "images/sela.jpg";
    text = buildYellowCircleText(vaultSac);
  }
  // Landfall — high bar, action-driven. Early planet commitment is not a substitute for the final hold order.
  else if (
    s >= 6 &&
    c >= 50 &&
    emb >= 65 &&
    integ >= 35 &&
    crisis !== "vent" &&
    vaultSac !== "living" &&
    final === "hold" &&
    (leadership === "together" || reckon === "public" || reckon === "memory" || shape === "future")
  ) {
    title = "Landfall";
    art = "images/ending_landfall.jpg";
    text = buildLandfallText(shape, planet, final);
  }
  // Living Ship — chose living at the hard vault moment (action-driven; embryos truth in text)
  else if (vaultSac === "living" && s >= 5 && c >= 30) {
    title = "The Living Ship";
    art = "images/ending_ship.jpg";
    text = buildLivingShipText(futureVoices, livingVoices, preg, emb, final);
  }
  // Quiet Ship — collapse
  else if (s <= 4 || (emb < 25 && c < 30) || (integ < 15 && s <= 5)) {
    title = "The Quiet Ship";
    art = "images/ending_ship.jpg";
    text = buildQuietShipText(deadNames, shape, final);
  }
  // Still Burning — held together
  else if (c >= 48 && s >= 5 && integ >= 22 && (leadership === "together" || reckon === "public" || reckon === "memory" || state.flags.mid_arc === "living")) {
    title = "Still Burning";
    art = "images/observation_bridge.jpg";
    text = buildStillBurningText(crisis, shape, final, planet);
  }
  // Fracture — hard authority or cold vault with low cohesion
  else if (c < 30 || leadership === "watch" || reckon === "suppress" || (vaultSac === "future" && c < 40)) {
    title = "Fracture";
    art = "images/ending_fracture.jpg";
    text = buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices, final);
  }
  // Default long dark
  else {
    title = "The Long Dark";
    art = "images/ending_ship.jpg";
    text = buildLongDarkText(final, planet, emb, preg, shape, integ, sup);
  }

  // Attachment footer
  if (title !== "The Yellow Circle") {
    text += buildEndingFooter(deadNames, title, fav, shape);
  }

  const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
  if (debt.length) {
    const names = debt.map(k => crew[k] ? crew[k].name : k);
    text += "\n\nSome of the living never stopped measuring who got your private hours: " + names.join(", ") + ".";
  }

  document.getElementById("ending-title").textContent = title;
  document.getElementById("ending-text").textContent = text;
  setEndingArt(art);
  showScreen("ending");
}

function showWhatRemains() {
  const el = document.getElementById("what-remains-text");
  if (!el) return;
  const facts = typeof whatRemainsFacts === "function" ? whatRemainsFacts() : [];
  el.textContent = facts.join("\n\n");
  showScreen("what-remains");
}

function canYellowCircle() {
  return (
    state.flags.crisis !== "vent" &&
    hasMark("sela", "spoken") &&
    isAlive("sela") &&
    ideologyShape() === "living" &&
    state.cohesion >= 50 &&
    state.survivors >= 6 &&
    !hasMark("tomas", "broke") &&
    state.flags.sela_attention !== "ignored" &&
    state.flags.sun_doctrine !== "scrubbed" &&
    (state.flags.sun_doctrine === "doctrine" || state.flags.sela_attention === "present" || state.romance.sela) &&
    (state.flags.final === "endure" || state.flags.final === "hold" || state.flags.final === "comfort")
  );
}

function buildYellowCircleText(vaultSac) {
  let text = `You did not deliver the future intact. You did not land on a world with a sun.\n\nWhat you delivered was smaller and stranger: a crew that still draws yellow circles on bulkheads, that still argues about plants and paste, that still looks for each other in the corridors.\n\nSela's suns multiplied. No one ordered them taken down.`;
  // Only cite acts that can actually have occurred this run
  if (isAlive("jiro") && (hasMark("jiro", "bonded") || hasMark("sela", "spoken"))) {
    text += ` Jiro stopped correcting the orbital math long enough to acknowledge the circles.`;
  }
  if (isAlive("tomas") && !hasMark("tomas", "broke") && (hasMark("tomas", "held") || hasMark("tomas", "bonded"))) {
    text += ` Tomas kept the silence from turning into something worse.`;
  }
  text += `\n\n`;
  if (vaultSac === "living") text += `When the grids failed, you chose the living. The embryo counts remember. So do the people who are still warm.\n\n`;
  if (state.flags.final === "hold") {
    text += `The rogue planet may still be ahead. The course is a fact on the board. The yellow circles are a fact on the bulkheads.\n\n`;
  } else if (state.flags.final === "comfort") {
    text += `You spent what was left on warmth. The drawings stayed up anyway.\n\n`;
  } else {
    text += `There is no grand destination. There is the next cycle, and the circles, and the people who still make them.\n\n`;
  }
  const memory = lastEndingMemory();
  if (memory) text += `Something private still sits with you: ${memory}\n\n`;
  text += `You did not win the argument between Future and Living. You made a ship where Living still had a voice.\n\nThat is rarer than landfall.`;
  return text;
}

function buildLandfallText(shape, planet, final) {
  let text = `Against every probability, the ship holds together long enough.\n\nThe rogue planet grows from a data point into a disc of ice and dark rock. There is no sun to rise over it. There is only the cold light of distant stars and the faint heat of the Sunsplitter's remaining systems.\n\n`;
  if (planet === "committed" && final === "hold") {
    text += `You locked the course early and held it when the ship tried to argue. The board still shows the same destination.\n\n`;
  } else if (final === "hold") {
    text += `You ordered the course held when it mattered. The planet stopped being a file and became a direction.\n\n`;
  } else {
    text += `Arrival was never guaranteed — only possible.\n\n`;
  }
  text += `The vault is still viable. The living are still breathing. That combination was never guaranteed.\n\n`;
  if (shape === "future") text += `You kept the future intact when it cost you. The numbers people will remember that the package arrived.\n\n`;
  else if (shape === "split") text += `You tried to hold both sides of the argument. Arrival does not resolve it. It only changes the room in which it continues.\n\n`;
  text += `You do not know if the subsurface ocean is real. You know only that the people who are left still look at one another, and that the restart package survived the journey with them.\n\nArrival and salvation were never the same thing.\n\nYou land anyway.`;
  return text;
}

function buildFinalOrderText(final) {
  if (final === "hold") {
    return `The rogue-planet course remains on the board. You ordered it held when the final choice was yours.\n\n`;
  }
  if (final === "comfort") {
    return `You traded the destination for speed and comfort. The remaining margin went to the people already aboard.\n\n`;
  }
  if (final === "transmission") {
    return `You sent a final transmission into the dark. The ship went quiet afterward.\n\n`;
  }
  if (final === "endure") {
    return `You refused a grand purpose. The order was the next day, then the next.\n\n`;
  }
  return "";
}

function buildLivingShipText(futureVoices, livingVoices, preg, emb, final) {
  let text = `You chose the people who were already breathing.\n\nThe embryo counts are permanently lower (${emb}%). The vault remembers the cost.\n`;
  if (futureVoices.length) text += ` ${futureVoices.join(" and ")} call it a failure of nerve.\n\n`;
  else text += `\n\n`;
  text += `But the habitation ring is warmer. The remaining crew still argues, eats, and occasionally touches one another without permission.\n\n`;
  if (preg === true) text += `A living pregnancy is possible. That fact sits in the medical bay like a second vault.\n\n`;
  if (livingVoices.length) text += `The living side of the argument — ${livingVoices.join(", ")} — still has a place to stand.\n\n`;
  text += buildFinalOrderText(final);
  text += `You did not deliver the future intact. You delivered a smaller, warmer present.\n\nWhether that is enough is no longer a command decision.`;
  return text;
}

function buildQuietShipText(deadNames, shape, final) {
  let text = `Only a few of you remain — or what remains of the restart package is too thin to matter.\n\n`;
  if (deadNames.length) text += `The dead: ${deadNames.join("; ")}.\n\n`;
  if (shape === "future") text += `You protected the vault when you could. It did not save the room.\n\n`;
  if (shape === "living") text += `You protected the living when you could. There were not enough left to matter.\n\n`;
  text += buildFinalOrderText(final);
  text += `The Sunsplitter drifts. Systems fail one by one. There is no longer any pretense of a future.\n\nYou sit with the last of them in the observation blister and watch the stars that do not care.\n\nWhen the final systems go dark, no one speaks.\n\nThis is how the last light goes out.`;
  return text;
}

function buildStillBurningText(crisis, shape, final, planet) {
  let text = `Against every reasonable expectation, the group holds.\n\n`;
  if (crisis === "vent") text += `The cost is permanent. Names are not spoken lightly.\n\n`;
  if (shape === "future") text += `You leaned toward the vault and the mission. The living remember the cold — but they are still here.\n\n`;
  else if (shape === "living") text += `You leaned toward the breathing. The embryo counts are wounded. The room is not.\n\n`;
  else text += `You refused to let either side of the argument own the ship completely.\n\n`;
  if (final === "hold") text += `The course remains locked on the rogue planet. Fourteen months. No guarantee.\n\n`;
  else if (final === "comfort") text += `You abandoned the destination for warmth and slightly less hunger.\n\n`;
  else if (final === "transmission") text += `A final transmission went out. The ship went quieter afterward.\n\n`;
  else text += `There is no grand destination. Only the work of the next cycle.\n\n`;
  text += `When you walk the corridors, people still meet your eyes. It is not hope. It is the refusal to die on the same day.`;
  return text;
}

function buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices, final) {
  let text = `The people under your command no longer move as one.\n\n`;
  if (shape === "future") text += `Protecting the vault cost you the room. The living side of the crew will not forgive the cold.\n\n`;
  if (shape === "living") text += `Protecting the living cost you the mission faction. The numbers people have gone quiet or hard.\n\n`;
  if (leadership === "watch" || reckon === "suppress") text += `Authority hardened. Compliance is high. Trust is not.\n\n`;
  if (deadNames.length) text += `The dead are not equally mourned.\n\n`;
  if (futureVoices.length && livingVoices.length) {
    text += `Future still speaks through ${futureVoices[0]}. Living still speaks through ${livingVoices[0]}. They no longer share a language.\n\n`;
  }
  text += buildFinalOrderText(final);
  text += `You remain Commander in name. In practice the Sunsplitter is a collection of isolated survivors sharing a dying hull.\n\nThe void does not need to kill you. You are doing it yourselves.`;
  return text;
}

function buildLongDarkText(final, planet, emb, preg, shape, integ, sup) {
  let text = `You keep them alive. Not all of them. Not with dignity every day. But alive.\n\n`;
  if (final === "hold" && planet === "committed") text += `The course remains locked on the rogue planet. The course is held.\n\n`;
  else if (final === "hold") text += `You ordered the course held. Whether the planet is real enough is no longer the only question.\n\n`;
  else if (final === "transmission") text += `A final transmission was sent into the dark. No reply is expected.\n\n`;
  else if (final === "comfort") text += `You spent fuel on comfort. The horizon is closer and emptier.\n\n`;
  else text += `There is no destination that feels real.\n\n`;
  if (emb < 60) text += `The restart package is wounded (${emb}%). The numbers will not recover.\n\n`;
  if (integ < 40) text += `Hull is a daily argument (${integ}%).\n\n`;
  if (sup < 30) text += `Supplies are a shorter argument (${sup}%).\n\n`;
  if (preg === true) text += `A living child may still be possible. That fact competes with every frozen future in the vault.\n\n`;
  if (shape === "future") text += `Your run leaned toward Future. The vault still has a claim on the ship.\n\n`;
  else if (shape === "living") text += `Your run leaned toward Living. The warmth has a cost the numbers will not forget.\n\n`;
  text += `The Sunsplitter pushes on through the black.\n\nYou do the work anyway.\n\nOne more day, then the next, then the next.`;
  return text;
}

function buildEndingFooter(deadNames, title, fav, shape) {
  let text = "";
  if (deadNames.length && title !== "The Quiet Ship") {
    text += `\n\nThe dead still have names: ${deadNames.join("; ")}.`;
  }
  const memory = lastEndingMemory();
  if (memory) {
    text += `\n\nSomething private still sits with you: ${memory}`;
  }
  if (fav && crew[fav.favored] && isAlive(fav.favored)) {
    text += `\n\nThe others noticed who you chose to keep close. ${crew[fav.favored].name} still looks for you in the corridors. Not everyone is glad of it.`;
  } else {
    const top = highestAffinity();
    if (top.who && top.score >= 30 && crew[top.who] && isAlive(top.who)) {
      text += `\n\nSomeone still looks for you in the corridors: ${crew[top.who].name}.`;
    }
  }
  if (hasMark("lena", "dying_held") && isAlive("lena")) text += `\n\nLena's remaining time was spent with someone who stayed.`;
  else if (hasMark("lena", "dying_held")) text += `\n\nLena's remaining time was spent with someone who stayed. That fact outlived her.`;
  if (hasMark("tomas", "broke")) text += `\n\nTomas broke in front of you. That fact does not leave the ship.`;
  else if (hasMark("tomas", "held") && isAlive("tomas")) text += `\n\nTomas is still holding. He told you he might not.`;
  if (hasMark("mira", "drive_first") && isAlive("mira")) text += `\n\nMira still believes the drive can be saved because you once let her try.`;
  // No raw ideology debug dump in player-facing text (0.20.2)
  return text;
}

function setEndingArt(src) {
  currentEndingArt = typeof src === "string" ? src : "";
  syncEndingArtForScreen("ending");
}




// --- v0.13 art continuity ---
function isIntimateScene(id, scene) {
  if (scene && scene.image && /shower_|rear_|romance_|lingerie_|afterglow_/.test(scene.image)) return true;
  // bond_* are non-sexual (Elias/Tomas/Jiro hangouts + consent gates); only romance_ is intimate by id
  return /^romance_/.test(id);
}

function resolveSceneImage(id, scene) {
  const map = (typeof sceneImages !== "undefined" && sceneImages) ? sceneImages : {};
  // Death-aware + unrecovered-aware group plates FIRST.
  // isAlive already treats !recovered.tomas/jiro as not alive (0.22+).
  // Fallbacks use literal paths — map keys are scene ids, not generic location names.
  // Scene-level image: is honored only after guards fall through (0.24.2).

  // Crisis / priority_repairs: Amara + Jiro + Sela faces. Fallback when any missing.
  if (id === "crisis" || id === "priority_repairs" || id === "aftermath") {
    if (state.flags.crisis === "vent" && map.vent) return map.vent;
    if (state.flags.crisis === "cut" && map.cut_out) return map.cut_out;
    if (!isAlive("amara") || !isAlive("jiro") || !isAlive("sela")) {
      return "images/corridor.jpg";
    }
  }

  // Competence / pattern plates historically show Jiro (and sometimes Tomas).
  if (id === "competence_watch" || id === "act3_reckoning_pattern") {
    if (!isAlive("jiro")) {
      return map.observation_bridge || "images/observation_bridge.jpg";
    }
  }

  // Cascade / briefing plates that carried unrecovered faces.
  if (id === "arc_future_3" || id === "act3_reckoning_briefing") {
    if (!isAlive("jiro") || !isAlive("tomas")) {
      return (id === "arc_future_3")
        ? (map.power_crisis || "images/power_crisis.jpg")
        : (map.observation_bridge || "images/observation_bridge.jpg");
    }
  }

  // Living-arc conflict plate shows Tomas, Mira, and Amara.
  if (id === "arc_living_3") {
    if (!isAlive("tomas") || !isAlive("mira") || !isAlive("amara")) {
      return "images/corridor.jpg";
    }
  }

  // Elias's private Mira-loss plate requires the same living/death predicate
  // as the scene. Saved invalid state must never render a dead speaker's face.
  if (id === "pair_shield_cold") {
    if (!isAlive("elias") || isAlive("mira") || !attributableDeath("mira")) {
      return "images/corridor_variant.jpg";
    }
  }

  // Group / observation_crew family — never show while Tomas or Jiro unrecovered
  // (map already parked most of these on observation.jpg; keep runtime guard).
  if (id === "status" || id === "lead_together" || id === "arc_fork" ||
      id === "act2_tether_truth" || id === "reckon_truth" || id === "observation_crew") {
    if (!isAlive("tomas") || !isAlive("jiro")) {
      return "images/observation.jpg";
    }
  }

  // Faction / debt / group plates: substitute whenever ANY of the eight named crew is not alive (0.25 Edit H).
  // Enumerated against live sceneImages map at implementation. faction_split permanently on corridor_variant.
  if (id === "faction_split" || id === "faction_split_alt" || id === "debt_notice" ||
      id === "reckon_public" || id === "reckon_summary") {
    const eight = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
    const anyMissing = eight.some(k => !isAlive(k));
    if (anyMissing) {
      if (id === "debt_notice" || id === "faction_split" || id === "faction_split_alt") {
        return "images/corridor_variant.jpg";
      }
      return "images/observation.jpg";
    }
  }

  if (id === "crew_walk" || id === "status") {
    // absence felt — prefer corridor / empty capacity plates when depleted
    if (state.survivors <= 5) return "images/corridor.jpg";
  }

  // After all id-keyed guards: honor explicit scene.image, then map.
  if (scene && scene.image) return scene.image;
  return map[id] || null;
}

function toggleCrewPanel() {
  const el = document.getElementById("crew-panel");
  if (!el) return;
  el.classList.toggle("hidden");
  el.classList.toggle("visible");
  const opening = el.classList.contains("visible");
  const toggle = document.getElementById("btn-crew");
  if (toggle) toggle.setAttribute("aria-expanded", opening ? "true" : "false");
  if (opening) {
    renderCrewPanel();
    // Opening Crew must not squeeze the story out of a short phone viewport.
    const wrap = document.getElementById("scene-image-wrap");
    if (wrap && wrap.classList.contains("visible")) {
      wrap.classList.add("minimized");
      window.__ssImagePinned = false;
    }
    if (typeof el.querySelector === "function") {
      const firstChip = el.querySelector(".crew-chip");
      if (firstChip && typeof firstChip.focus === "function") firstChip.focus();
    }
  } else if (toggle && typeof toggle.focus === "function") {
    toggle.focus();
  }
}

(function wireCrewDisclosureKeyboard() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  document.addEventListener("keydown", event => {
    if (!event || event.key !== "Escape") return;
    const panel = document.getElementById("crew-panel");
    if (!panel || !panel.classList.contains("visible")) return;
    panel.classList.add("hidden");
    panel.classList.remove("visible");
    const toggle = document.getElementById("btn-crew");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      if (typeof toggle.focus === "function") toggle.focus();
    }
  });
})();

function renderCrewPanel(selectedKey) {
  const el = document.getElementById("crew-panel");
  if (!el || el.classList.contains("hidden")) return;
  // 0.22.0+: Tomas/Jiro/Vess only appear once recovered. 0.25.1: use isRecovered so recovered-then-killed still show as dead chips.
  const order = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess", "rourke"].filter(k => {
    if (k === "tomas" || k === "jiro" || k === "vess") return isRecovered(k);
    return true;
  });
  const fav = typeof favoritism === "function" ? favoritism() : null;
  const favored = fav ? fav.favored : null;
  const chips = order.map(k => {
    if (!crew[k]) return "";
    const dead = !isAlive(k);
    const name = crewFirstName(k);
    const cls = "crew-chip" +
      (dead ? " dead" : "") +
      (!dead && favored === k ? " favored" : "") +
      (selectedKey === k ? " selected" : "");
    return `<button type="button" class="${cls}" data-crew="${k}" aria-pressed="${selectedKey === k ? "true" : "false"}">${name}</button>`;
  }).join("");

  let detail = "";
  if (selectedKey && crew[selectedKey]) {
    const c = crew[selectedKey];
    const dead = !isAlive(selectedKey);
    const role = c.role && c.role !== "None" ? c.role : "No rank";
    if (dead) {
      const cause = state.deathCause && state.deathCause[selectedKey]
        ? state.deathCause[selectedKey]
        : "gone";
      detail = `<div class="crew-detail" role="status"><strong>${c.name}</strong> · <span class="dim">${role}</span><br>Dead — ${escapeHtml(cause)}</div>`;
    } else {
      const bits = [role];
      if (favored === selectedKey) bits.push("favored");
      if (state.romance && state.romance[selectedKey]) bits.push("private line");
      if (state.marks && state.marks[selectedKey]) bits.push(String(state.marks[selectedKey]).replace(/_/g, " "));
      detail = `<div class="crew-detail" role="status"><strong>${c.name}</strong> · ${bits.map(escapeHtml).join(" · ")}</div>`;
    }
  } else {
    detail = `<div class="crew-detail dim" role="status">Tap a name for status.</div>`;
  }

  el.innerHTML = `<div class="crew-chips">${chips}</div>${detail}`;
  el.querySelectorAll(".crew-chip[data-crew]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute("data-crew");
      renderCrewPanel(selectedKey === key ? null : key);
      if (typeof el.querySelector === "function") {
        const replacement = el.querySelector(`[data-crew="${key}"]`);
        if (replacement && typeof replacement.focus === "function") replacement.focus();
      }
    };
  });
}


// ---------- Save / Resume (v0.19) ----------
// Single slot. Survives refresh, background, tab close on iOS Safari via localStorage.
// Schema versioned. Never wipe an existing save on failed write/parse.

function snapshotState() {
  // Explicit allowlist — full run state 0.17.1+ relies on
  return {
    v: SAVE_SCHEMA_VERSION,
    gameVersion: (typeof VERSION !== "undefined" ? VERSION : "0.19"),
    savedAt: Date.now(),
    sceneEntered: true,
    survivors: state.survivors,
    integrity: state.integrity,
    cohesion: state.cohesion,
    supplies: state.supplies,
    embryos: state.embryos,
    flags: Object.assign({}, state.flags),
    dead: (state.dead || []).slice(),
    deathCause: Object.assign({}, state.deathCause || {}),
    scene: state.scene,
    affinity: Object.assign({}, state.affinity),
    trust: Object.assign({}, state.trust),
    romance: Object.assign({}, state.romance || {}),
    pursuit: Object.assign({}, state.pursuit || {}),
    favors: Object.assign({}, state.favors || {}),
    past_known_by: Object.assign({}, state.past_known_by || {}),
    dying: (state.dying && typeof state.dying === "object") ? Object.assign({}, state.dying) : {},
    past_known: !!state.past_known,
    marks: Object.assign({}, state.marks || {}),
    memories: (state.memories || []).slice(),
    ideology: Object.assign({ future: 0, living: 0 }, state.ideology || {}),
    // 0.22.0 groundwork
    recovered: Object.assign({ tomas: false, jiro: false, vess: false }, state.recovered || {}),
    promises: Object.assign({}, state.promises || {}),
    crisisPath: state.crisisPath != null ? state.crisisPath : null
  };
}

function validSnapshotShape(data) {
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isRecord(data)) return false;

  const sceneId = typeof data.scene === "string" && data.scene ? data.scene : "";
  if (!sceneId || !Object.prototype.hasOwnProperty.call(scenes, sceneId)) return false;

  for (const key of ["survivors", "integrity", "cohesion", "supplies", "embryos"]) {
    const value = data[key];
    const cap = STAT_CAPS[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < cap.min || value > cap.max) return false;
  }

  for (const key of ["flags", "deathCause", "affinity", "trust", "romance", "pursuit", "favors", "past_known_by", "marks", "ideology", "recovered", "promises"]) {
    if (data[key] != null && !isRecord(data[key])) return false;
  }
  for (const key of ["dead", "memories"]) {
    if (data[key] != null && !Array.isArray(data[key])) return false;
  }
  if (data.dying != null && typeof data.dying !== "string" && !isRecord(data.dying)) return false;
  if (data.past_known != null && typeof data.past_known !== "boolean") return false;
  if (data.crisisPath != null && typeof data.crisisPath !== "string") return false;
  if (data.gameVersion != null && typeof data.gameVersion !== "string") return false;
  if (data.savedAt != null && (typeof data.savedAt !== "number" || !Number.isFinite(data.savedAt))) return false;
  if (data.sceneEntered != null && typeof data.sceneEntered !== "boolean") return false;
  return true;
}

function applySnapshot(data) {
  if (!validSnapshotShape(data)) return false;
  const sceneId = data.scene;
  if (typeof data.gameVersion === "string") loadedGameVersion = data.gameVersion;
  else loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");
  // Resources
  state.survivors = typeof data.survivors === "number" ? data.survivors : state.survivors;
  state.integrity = typeof data.integrity === "number" ? data.integrity : state.integrity;
  state.cohesion = typeof data.cohesion === "number" ? data.cohesion : state.cohesion;
  state.supplies = typeof data.supplies === "number" ? data.supplies : state.supplies;
  state.embryos = typeof data.embryos === "number" ? data.embryos : state.embryos;
  // Causality-critical
  state.flags = Object.assign({}, data.flags || {});
  // L-027: retire the unused Vess course consequence from legacy saves.
  delete state.flags.vess_course_lost;
  state.dead = Array.isArray(data.dead) ? data.dead.slice() : [];
  state.deathCause = Object.assign({}, data.deathCause || {});
  state.scene = sceneId;
  state.affinity = Object.assign({ lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 }, data.affinity || {});
  state.trust = Object.assign({ lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 }, data.trust || {});
  state.romance = Object.assign({}, data.romance || {});
  state.pursuit = Object.assign({}, data.pursuit || {});
  state.favors = Object.assign({}, data.favors || {});
  state.past_known_by = Object.assign({}, data.past_known_by || {});
  // 0.25: dying is a map { name: cause }. Normalize legacy scalar "lena".
  if (data.dying != null && typeof data.dying === "object" && !Array.isArray(data.dying)) {
    state.dying = Object.assign({}, data.dying);
  } else if (typeof data.dying === "string" && data.dying) {
    state.dying = { [data.dying]: data.dying === "lena" ? "kept working until the clock ran out" : data.dying };
  } else {
    state.dying = {};
  }
  state.past_known = !!data.past_known;
  state.marks = Object.assign({}, data.marks || {});
  state.memories = Array.isArray(data.memories) ? data.memories.slice() : [];
  state.ideology = Object.assign({ future: 0, living: 0 }, data.ideology || {});
  // 0.22.0 groundwork (default missing for older saves)
  state.recovered = Object.assign({ tomas: false, jiro: false, vess: false }, data.recovered || {});
  state.promises = Object.assign({}, data.promises || {});
  state.crisisPath = data.crisisPath != null ? data.crisisPath : null;
  return true;
}

function validRawSnapshot(raw) {
  if (!raw) return false;
  try {
    return validSnapshotShape(JSON.parse(raw));
  } catch (e) {
    return false;
  }
}

function safeImportTree(value, depth, budget) {
  if (depth > 8 || budget.count > 2_000) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 4_096;
  if (Array.isArray(value)) {
    if (value.length > 512) return false;
    budget.count += value.length;
    return value.every(item => safeImportTree(item, depth + 1, budget));
  }
  if (typeof value !== "object") return false;
  const keys = Object.keys(value);
  if (keys.length > 512) return false;
  budget.count += keys.length;
  for (const key of keys) {
    if (key === "__proto__" || key === "prototype" || key === "constructor" || key.length > 128) return false;
    if (!safeImportTree(value[key], depth + 1, budget)) return false;
  }
  return true;
}

function validImportedSnapshot(data) {
  if (!safeImportTree(data, 0, { count: 0 }) || !validSnapshotShape(data)) return false;
  const schema = data.v == null ? MIN_IMPORT_SCHEMA_VERSION : data.v;
  if (!Number.isInteger(schema) || schema < MIN_IMPORT_SCHEMA_VERSION || schema > SAVE_SCHEMA_VERSION) return false;
  const allowedTopLevel = new Set([
    "v", "gameVersion", "savedAt", "sceneEntered", "survivors", "integrity", "cohesion", "supplies", "embryos",
    "flags", "dead", "deathCause", "scene", "affinity", "trust", "romance", "pursuit", "favors",
    "past_known_by", "dying", "past_known", "marks", "memories", "ideology", "recovered", "promises", "crisisPath"
  ]);
  if (Object.keys(data).some(key => !allowedTopLevel.has(key))) return false;
  if (data.gameVersion != null && (!data.gameVersion.trim() || data.gameVersion.length > 32)) return false;
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const isCrewKey = key => Object.prototype.hasOwnProperty.call(crew, key);
  const validMap = (map, validKey, validValue) => map == null ||
    Object.entries(map).every(([key, value]) => validKey(key) && validValue(value, key));
  const isBoolean = value => typeof value === "boolean";
  const isCause = value => typeof value === "string" && value.length > 0;
  const isBoundedScore = value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
  const booleanFlags = new Set([
    "amara_rear_done", "amara_vent_delayed", "burn_unverified", "busDowngraded", "clock_known", "course_briefed",
    "course_option_lost", "custody_roll", "last_tx_spent", "lena_authority", "lena_notes", "lena_rear_done",
    "lena_regen", "lena_shower_done", "manifest_exposed", "manifest_lie", "margin_committed", "margin_spent_extra",
    "mira_fault_known", "mira_favor", "mira_memory_public", "mira_rear_done", "mira_shower_done", "pair_favor",
    "pair_grudge", "pair_shield", "position_certain", "prom_amara", "prom_amara_alluded", "prom_deck4_buried",
    "prom_deck4_edited", "prom_elias", "prom_elias_alluded", "prom_lena", "prom_lena_alluded", "prom_line_held",
    "prom_mira", "prom_mira_alluded", "prom_sela", "prom_sela_alluded", "prom_tomas", "prom_tomas_alluded",
    "quiet_tomas_done", "reaction_mass_spent", "sela_rear_done", "ship_interrupt_fired", "tether_hand_elias",
    "tether_hand_mira", "tether_hand_sela", "tether_rushed", "tomas_scapegoated", "trays_dead", "vault_face",
    "vault_face_read", "vess_intimate", "warmth_laughter", "warmth_meal", "warmth_music", "water_vented"
  ]);
  const flagDomains = Object.fromEntries(Object.entries({
    abandoned: ["opened", "sealed", "scanned"], breath_answer: ["racks", "trunks", "garden", "blacksleep"],
    breath_word: ["given", "refused"], cascade_truth: ["open", "sealed", "senior"], changeorders: ["logged", "buried"],
    coolant: ["loop", "medical", "split"], crisis: ["vent", "cut", "self"],
    custody_answer: ["severed", "possession", "thawed", "shared"],
    departure_truth: ["plural", "records", "living_only"], elias_power: ["high", "limited", "low"],
    embryo_ceiling: ["lowered"], feedstock: ["seal", "food", "thin"],
    final: ["endure", "hold", "comfort", "transmission"], hydro: ["full", "minimal", "rebuild"],
    interrupt_return: ["bond_mira", "bond_amara", "bond_sela", "bond_lena", null],
    junctionChoice: ["none", "lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"],
    leadership: ["together", "hard", "watch"], leadership_style: ["hard", "balanced", "soft"],
    manifest: ["read", "declined"], mid_arc: ["living", "future"],
    past: ["owned", "denied", "deal", "lena_only", "threatened", "deflected"], patch: ["failed", "aborted"],
    planet: ["committed", "deferred"], power: ["cut", "burn", "risk"], priority: ["repairs", "ration", "planet"],
    prom_line_other: ["mira", "jiro", "vess"], pursuit_amara_cost: ["vent_delay", "half"],
    pursuit_lena_cost: ["regen", "honest_regen"], pursuit_mira_cost: ["disclosed", "partial"],
    pursuit_sela_cost: ["vow", "private_vow"], reckon: ["public", "suppress", "memory", "truth"],
    rourke: ["stopped", "stayed", "tried", "ignored"], sela_attention: ["ignored", "present"],
    sela_vault_vow: ["accepted", "refused"], ship_interrupt: ["answered", "deferred", "remote"],
    ship_memory: ["open_wound", "jury_rig", "proper_seal"], signal: ["chase", "ignore", "study"],
    stores: ["seize", "ignore", "vote"], sun_doctrine: ["scrubbed", "doctrine", "silent"],
    tomas: ["future", "living", "hold"], vault_priority: ["future", "living", "both"],
    vault_sacrifice: ["future", "living", "split"], vault_voice: ["off", "on", "restricted"]
  }).map(([key, values]) => [key, new Set(values)]));
  const isFlagValue = (value, key) => {
    if (booleanFlags.has(key)) return typeof value === "boolean";
    if (key === "pregnancy_risk") return typeof value === "boolean" || value === "unknown";
    if (flagDomains[key]) return flagDomains[key].has(value);
    return value === null || typeof value === "boolean" || typeof value === "string" ||
      (typeof value === "number" && Number.isFinite(value));
  };
  const isMarkValue = value => typeof value === "string" ||
    (isRecord(value) && Object.values(value).every(isBoolean));
  const promiseStates = new Set(["made", "declined", "kept", "broken"]);

  const dead = data.dead || [];
  if (dead.some(key => typeof key !== "string" || !isCrewKey(key)) || new Set(dead).size !== dead.length) return false;
  if ((data.memories || []).length > 12 || (data.memories || []).some(memory => typeof memory !== "string")) return false;
  if (!validMap(data.flags, () => true, isFlagValue)) return false;
  if (!validMap(data.deathCause, isCrewKey, isCause)) return false;
  if (!validMap(data.affinity, isCrewKey, isBoundedScore) || !validMap(data.trust, isCrewKey, isBoundedScore)) return false;
  if (!validMap(data.romance, key => isCrewKey(key) || key === "amara_tomas", isBoolean)) return false;
  for (const map of [data.pursuit, data.favors, data.past_known_by, data.recovered]) {
    if (!validMap(map, isCrewKey, isBoolean)) return false;
  }
  if (typeof data.dying === "string") {
    if (!isCrewKey(data.dying)) return false;
  } else if (!validMap(data.dying, isCrewKey, isCause)) return false;
  if (!validMap(data.marks, () => true, isMarkValue)) return false;
  if (!validMap(data.promises, isCrewKey, value => promiseStates.has(value))) return false;
  if (!validMap(data.ideology, key => key === "future" || key === "living",
    value => typeof value === "number" && Number.isFinite(value))) return false;
  return true;
}

function inspectSaveImportText(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "empty file" };
  const normalizedText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const byteLength = typeof TextEncoder === "function"
    ? new TextEncoder().encode(normalizedText).length
    : normalizedText.length;
  if (byteLength > MAX_IMPORT_BYTES) return { ok: false, error: "file is too large" };
  let parsed;
  try {
    parsed = JSON.parse(normalizedText);
  } catch (e) {
    return { ok: false, error: "file is not valid JSON" };
  }
  const schema = parsed && parsed.v == null ? MIN_IMPORT_SCHEMA_VERSION : parsed && parsed.v;
  if (!Number.isInteger(schema) || schema < MIN_IMPORT_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported save format" };
  }
  if (schema > SAVE_SCHEMA_VERSION) return { ok: false, error: "save format is newer than this game" };
  if (!validImportedSnapshot(parsed)) return { ok: false, error: "save data is unsupported or unsafe" };
  const legacyFile = parsed.v == null || parsed.v === 2;
  // Some later v2 saves already carry the one-time scene-entry marker.
  if (legacyFile && parsed.sceneEntered !== true) delete parsed.sceneEntered;
  return { ok: true, raw: JSON.stringify(parsed), snapshot: parsed, legacyFile };
}

function buildSaveExport() {
  const raw = readRawSave();
  if (!validRawSnapshot(raw)) return null;
  const save = JSON.parse(raw);
  const exportedAt = Date.now();
  const version = String(save.gameVersion || "legacy").replace(/[^0-9A-Za-z.-]+/g, "-").slice(0, 32) || "legacy";
  const stamp = new Date(exportedAt).toISOString().slice(0, 10);
  return {
    filename: `sunsplitter-save-v${version}-${stamp}.json`,
    text: raw
  };
}

function exportSaveFile() {
  const prepared = buildSaveExport();
  if (!prepared) {
    flashSaveStatus("No valid save to export", true, true);
    return false;
  }
  let url = null;
  let link = null;
  try {
    const blob = new Blob([prepared.text], { type: "application/json" });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = prepared.filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    flashSaveStatus("Export prepared");
    return true;
  } catch (e) {
    flashSaveStatus("Export failed", true, true);
    return false;
  } finally {
    if (link && link.parentNode) link.parentNode.removeChild(link);
    // Give mobile Safari time to consume the blob after the synthetic click.
    if (url) setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function restoreStorageValue(key, value) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  return localStorage.getItem(key) === value;
}

function commitImportedSave(raw) {
  const keys = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY];
  let originals;
  try {
    originals = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
  } catch (e) {
    flashSaveStatus("Import failed · storage unavailable", true, true);
    return false;
  }
  const hadOriginal = keys.some(key => originals[key] !== null);
  let priorRaw = null;
  try {
    priorRaw = readRawSave();
    localStorage.setItem(SAVE_STAGING_KEY, raw);
    if (localStorage.getItem(SAVE_STAGING_KEY) !== raw || !validRawSnapshot(raw)) throw new Error("staging verification failed");
    if (validRawSnapshot(priorRaw)) {
      localStorage.setItem(SAVE_BACKUP_KEY, priorRaw);
      if (localStorage.getItem(SAVE_BACKUP_KEY) !== priorRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(SAVE_BACKUP_KEY);
    }
    localStorage.setItem(SAVE_KEY, raw);
    if (localStorage.getItem(SAVE_KEY) !== raw || !validRawSnapshot(localStorage.getItem(SAVE_KEY))) {
      throw new Error("import verification failed");
    }
    localStorage.removeItem(SAVE_KEY_LEGACY);
    if (localStorage.getItem(SAVE_KEY_LEGACY) !== null) throw new Error("legacy retirement failed");
    localStorage.removeItem(SAVE_BACKUP_KEY);
    localStorage.removeItem(SAVE_STAGING_KEY);
    if (localStorage.getItem(SAVE_BACKUP_KEY) !== null || localStorage.getItem(SAVE_STAGING_KEY) !== null) {
      throw new Error("transaction cleanup failed");
    }
  } catch (e) {
    let liveRestored = false;
    try { liveRestored = restoreStorageValue(SAVE_KEY, originals[SAVE_KEY]); } catch (restoreError) { /* recover below */ }
    try { restoreStorageValue(SAVE_KEY_LEGACY, originals[SAVE_KEY_LEGACY]); } catch (restoreError) { /* recover below */ }
    if (liveRestored) {
      try { restoreStorageValue(SAVE_STAGING_KEY, originals[SAVE_STAGING_KEY]); } catch (restoreError) { /* checked below */ }
      try { restoreStorageValue(SAVE_BACKUP_KEY, originals[SAVE_BACKUP_KEY]); } catch (restoreError) { /* checked below */ }
    } else {
      // Keep a durable interrupted-transaction marker. readRawSave() treats
      // the matching live candidate as uncommitted and selects this backup.
      try { restoreStorageValue(SAVE_STAGING_KEY, raw); } catch (restoreError) { /* checked below */ }
      if (validRawSnapshot(priorRaw)) {
        try { restoreStorageValue(SAVE_BACKUP_KEY, priorRaw); } catch (restoreError) { /* checked below */ }
      } else {
        try { restoreStorageValue(SAVE_BACKUP_KEY, originals[SAVE_BACKUP_KEY]); } catch (restoreError) { /* checked below */ }
      }
    }
    let priorRecoverable = false;
    try {
      const effective = readRawSave();
      priorRecoverable = priorRaw === null ? effective === null : effective === priorRaw;
    } catch (readError) { /* fail closed below */ }
    const message = priorRecoverable
      ? "Import failed · original slot kept"
      : (hadOriginal ? "Import failed · storage recovery required" : "Import failed · no replacement written");
    flashSaveStatus(message, true, true);
    updateMetaSaveHint();
    refreshTitleResumeUI();
    return false;
  }
  pendingLegacyResume = null;
  preserveCompletedSlotUntilChoice = false;
  updateMetaSaveHint();
  refreshTitleResumeUI();
  flashSaveStatus("Imported · Continue to load");
  return true;
}

function importSaveText(text) {
  const inspected = inspectSaveImportText(text);
  if (!inspected.ok) {
    flashSaveStatus(`Import rejected · ${inspected.error}`, true, true);
    return false;
  }
  let hasStoredBytes = false;
  try {
    hasStoredBytes = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY]
      .some(key => localStorage.getItem(key) !== null);
  } catch (e) {
    flashSaveStatus("Import failed · storage unavailable", true, true);
    return false;
  }
  const prompt = hasStoredBytes
    ? "Import this save? This will replace the saved run on this device."
    : "Import this save onto this device?";
  if (!window.confirm(prompt)) {
    flashSaveStatus("Import cancelled");
    return false;
  }
  return commitImportedSave(inspected.raw);
}

function requestSaveImport() {
  const input = document.getElementById("save-import-file");
  if (!input) return false;
  input.value = "";
  input.click();
  return true;
}

function readSaveImportFile(file) {
  if (file && typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsText(file);
  });
}

async function handleSaveImportSelection(input) {
  const file = input && input.files ? input.files[0] : null;
  if (!file) return false;
  try {
    if (typeof file.size === "number" && file.size > MAX_IMPORT_BYTES) {
      flashSaveStatus("Import rejected · file is too large", true, true);
      return false;
    }
    return importSaveText(await readSaveImportFile(file));
  } catch (e) {
    flashSaveStatus("Import failed · file could not be read", true, true);
    return false;
  } finally {
    input.value = "";
  }
}

function readRawSave() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    const staging = localStorage.getItem(SAVE_STAGING_KEY);
    const backup = localStorage.getItem(SAVE_BACKUP_KEY);
    if (validRawSnapshot(staging) && raw === staging) {
      // A live value that still matches staging never completed its
      // transaction. Prefer the preserved prior slot, or fail closed.
      raw = validRawSnapshot(backup) ? backup : null;
    } else if (!validRawSnapshot(raw)) {
      raw = validRawSnapshot(backup) ? backup : null;
    }
    if (!validRawSnapshot(raw)) {
      // Read legacy v2 without mutating storage. A successful explicit load
      // adopts it through the ordinary verified v3 save transaction.
      const legacy = localStorage.getItem(SAVE_KEY_LEGACY);
      raw = validRawSnapshot(legacy) ? legacy : null;
    }
    return raw;
  } catch (e) {
    return null;
  }
}

function hasSave() {
  return validRawSnapshot(readRawSave());
}

function getSaveMeta() {
  const raw = readRawSave();
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || !data.scene) return null;
    return {
      scene: data.scene,
      savedAt: data.savedAt || 0,
      survivors: data.survivors,
      deadCount: Array.isArray(data.dead) ? data.dead.length : 0
    };
  } catch (e) {
    return null;
  }
}

function persistSave(opts) {
  opts = opts || {};
  const silent = !!opts.silent;
  const retireLegacy = !!opts.retireLegacy;
  const snap = snapshotState();
  let previousRaw = null;
  let previousValid = false;
  let previousLegacyRaw = null;
  let previousLegacyValid = false;
  let json;
  if (retireLegacy) {
    try {
      previousLegacyRaw = localStorage.getItem(SAVE_KEY_LEGACY);
      previousLegacyValid = validRawSnapshot(previousLegacyRaw);
    } catch (e) {
      reportSaveWriteFailure(silent, false);
      return false;
    }
  }
  try {
    const liveRaw = localStorage.getItem(SAVE_KEY);
    const recoveryRaw = localStorage.getItem(SAVE_BACKUP_KEY);
    previousRaw = validRawSnapshot(liveRaw)
      ? liveRaw
      : (validRawSnapshot(recoveryRaw) ? recoveryRaw : liveRaw);
    previousValid = validRawSnapshot(previousRaw);
  } catch (e) { /* storage access or malformed prior slot */ }
  try {
    json = JSON.stringify(snap);
  } catch (e) {
    reportSaveWriteFailure(silent, previousValid);
    return false;
  }
  try {
    // Stage and verify before touching the live slot. If a prior slot exists,
    // preserve its exact bytes until the replacement has also verified.
    localStorage.setItem(SAVE_STAGING_KEY, json);
    if (localStorage.getItem(SAVE_STAGING_KEY) !== json) throw new Error("staging verification failed");
    if (previousRaw !== null) {
      localStorage.setItem(SAVE_BACKUP_KEY, previousRaw);
      if (localStorage.getItem(SAVE_BACKUP_KEY) !== previousRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(SAVE_BACKUP_KEY);
    }
    localStorage.setItem(SAVE_KEY, json);
    if (localStorage.getItem(SAVE_KEY) !== json) throw new Error("save verification failed");
    if (retireLegacy && previousLegacyRaw !== null) {
      localStorage.removeItem(SAVE_KEY_LEGACY);
      if (localStorage.getItem(SAVE_KEY_LEGACY) !== null) throw new Error("legacy retirement failed");
    }
  } catch (e) {
    let priorRecoverable = false;
    try {
      if (previousRaw !== null && localStorage.getItem(SAVE_KEY) !== previousRaw) {
        localStorage.setItem(SAVE_KEY, previousRaw);
      } else if (previousRaw === null) {
        localStorage.removeItem(SAVE_KEY);
      }
      if (retireLegacy && previousLegacyRaw !== null && localStorage.getItem(SAVE_KEY_LEGACY) !== previousLegacyRaw) {
        localStorage.setItem(SAVE_KEY_LEGACY, previousLegacyRaw);
      }
    } catch (restoreError) { /* verified backup remains recovery authority */ }
    try {
      priorRecoverable = (previousValid && (
          localStorage.getItem(SAVE_KEY) === previousRaw ||
          localStorage.getItem(SAVE_BACKUP_KEY) === previousRaw
        )) || (previousLegacyValid && localStorage.getItem(SAVE_KEY_LEGACY) === previousLegacyRaw);
    } catch (readError) { /* status fails closed when custody cannot be read */ }
    try {
      localStorage.removeItem(SAVE_STAGING_KEY);
      if (localStorage.getItem(SAVE_KEY) === previousRaw) localStorage.removeItem(SAVE_BACKUP_KEY);
    } catch (cleanupError) { /* keep any verified backup for readRawSave recovery */ }
    reportSaveWriteFailure(silent, priorRecoverable);
    updateMetaSaveHint();
    return false;
  }
  try {
    localStorage.removeItem(SAVE_STAGING_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
  } catch (e) { /* committed live slot already verified */ }
  if (!silent) flashSaveStatus("Saved");
  else clearSaveWriteFailure();
  updateMetaSaveHint();
  return true;
}

function reportSaveWriteFailure(silent, priorRecoverable) {
  const action = silent ? "Autosave failed" : "Save failed";
  const custody = priorRecoverable ? "prior slot kept" : "progress not saved";
  flashSaveStatus(`${action} · ${custody}`, true, true);
}

function saveGame() {
  // Manual save — always visible feedback
  const saved = persistSave({ silent: false });
  if (saved) preserveCompletedSlotUntilChoice = false;
  return saved;
}

function loadGame() {
  if (!hasSave()) {
    flashSaveStatus("No save", true);
    return false;
  }
  const raw = readRawSave();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    flashSaveStatus("Save corrupt", true);
    return false;
  }
  if (pendingLegacyResume && pendingLegacyResume.raw === raw) {
    if (!applySnapshot(pendingLegacyResume.snapshot)) {
      pendingLegacyResume = null;
      flashSaveStatus("Load failed", true, true);
      return false;
    }
    loadedGameVersion = pendingLegacyResume.loadedGameVersion;
    if (!persistSave({ silent: true })) {
      showTitleScreen();
      return false;
    }
    pendingLegacyResume = null;
    preserveCompletedSlotUntilChoice = false;
    showScreen("game");
    renderStatus();
    showScene(state.scene, { skipOnEnter: true, resume: true });
    updateMetaSaveHint();
    flashSaveStatus("Resumed");
    return true;
  }
  pendingLegacyResume = null;
  // Do not wipe existing storage if apply fails
  const ok = applySnapshot(data);
  if (!ok) {
    flashSaveStatus("Load failed", true);
    return false;
  }
  showScreen("game");
  renderStatus();
  const sceneEntered = data.sceneEntered === true;
  showScene(state.scene, { skipOnEnter: sceneEntered, resume: true });
  // Older snapshots predate the scene-entry marker. Preserve their one-time
  // compatibility entry, then adopt the marker so later resumes stay pure.
  if (!sceneEntered && !persistSave({ silent: true })) {
    pendingLegacyResume = {
      raw,
      snapshot: snapshotState(),
      loadedGameVersion
    };
    showTitleScreen();
    return false;
  }
  preserveCompletedSlotUntilChoice = false;
  updateMetaSaveHint();
  flashSaveStatus("Resumed");
  return true;
}

function resumeGame() {
  return loadGame();
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY_LEGACY);
    localStorage.removeItem(SAVE_STAGING_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
  } catch (e) { /* ignore */ }
  updateMetaSaveHint();
  refreshTitleResumeUI();
}

function flashSaveStatus(msg, isError, sticky) {
  const targets = [document.getElementById("save-status"), document.getElementById("title-save-status")].filter(Boolean);
  if (!targets.length) {
    // Fallback if meta not in DOM yet
    if (isError) try { window.alert(msg); } catch (e) {}
    return;
  }
  targets.forEach(el => {
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.classList.add("visible");
  });
  clearTimeout(window.__ssSaveFlash);
  if (sticky) return;
  window.__ssSaveFlash = setTimeout(() => {
    targets.forEach(el => {
      el.classList.remove("visible");
      if (el.id === "title-save-status") el.textContent = "";
    });
  }, 1800);
}

function clearSaveWriteFailure() {
  const targets = [document.getElementById("save-status"), document.getElementById("title-save-status")]
    .filter(el => el && el.classList.contains("error"));
  if (!targets.length) return;
  clearTimeout(window.__ssSaveFlash);
  targets.forEach(el => {
    el.textContent = "";
    el.classList.remove("error");
    el.classList.remove("visible");
  });
}

function updateMetaSaveHint() {
  const el = document.getElementById("save-hint");
  if (!el) return;
  const meta = getSaveMeta();
  if (!meta || !meta.savedAt) {
    el.textContent = "";
    return;
  }
  const d = new Date(meta.savedAt);
  const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  el.textContent = "Slot · " + t;
}

function refreshTitleResumeUI() {
  const resumeBtn = document.getElementById("btn-resume");
  const resumeMeta = document.getElementById("resume-meta");
  const beginBtn = document.getElementById("btn-begin");
  const exportBtn = document.getElementById("btn-export-save");
  const has = hasSave();
  if (resumeBtn) {
    if (has) resumeBtn.classList.remove("hidden");
    else resumeBtn.classList.add("hidden");
  }
  if (resumeMeta) {
    if (has) {
      const m = getSaveMeta();
      const scene = m && m.scene ? m.scene : "run";
      const dead = m && m.deadCount ? m.deadCount + " lost" : "intact";
      const when = m && m.savedAt ? new Date(m.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
      resumeMeta.textContent = (m && m.survivors != null ? m.survivors + " alive · " : "") + dead + (when ? " · " + when : "");
      resumeMeta.classList.remove("hidden");
    } else {
      resumeMeta.classList.add("hidden");
      resumeMeta.textContent = "";
    }
  }
  if (beginBtn) {
    beginBtn.textContent = has ? "New run" : "Begin";
  }
  if (exportBtn) {
    let exportable = false;
    try { exportable = validRawSnapshot(readRawSave()); } catch (e) { /* keep hidden */ }
    exportBtn.classList.toggle("hidden", !exportable);
  }
}

// Autosave after every committed choice (state already mutated)
function makeChoice(choice) {
  if (choice.effects) updateStats(choice.effects);
  if (choice.flag && typeof choice.flag === "object") {
    Object.assign(state.flags, choice.flag);
  }
  if (choice.affinity && typeof choice.affinity === "object") {
    Object.keys(choice.affinity).forEach(k => addAffinity(k, choice.affinity[k]));
  }
  if (choice.trust && typeof choice.trust === "object") {
    Object.keys(choice.trust).forEach(k => addTrust(k, choice.trust[k]));
  }
  if (choice.mark && typeof choice.mark === "object") {
    Object.keys(choice.mark).forEach(k => mark(k, choice.mark[k]));
  }
  if (choice.remember) {
    remember(choice.remember);
  }
  if (choice.lean && typeof choice.lean === "object") {
    Object.keys(choice.lean).forEach(side => lean(side, choice.lean[side]));
  }
  showScene(choice.next);
  // Persist after scene is current so resume lands on the post-choice beat
  preserveCompletedSlotUntilChoice = false;
  persistSave({ silent: true });
}

// iOS Safari: pagehide is the reliable background/close signal; visibilitychange for switch-away
(function wireLifecycleSave() {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  let savedWhileBackgrounded = false;
  const resetBackgroundSave = () => { savedWhileBackgrounded = false; };
  const saveIfPlaying = () => {
    if (!savedWhileBackgrounded && !preserveCompletedSlotUntilChoice) {
      try {
        const game = document.getElementById("game-screen");
        if (game && !game.classList.contains("hidden") && state && state.scene) {
          savedWhileBackgrounded = persistSave({ silent: true }) === true;
        }
      } catch (e) { /* ignore */ }
    }
    suspendPresentationImages();
  };
  const resumePresentation = () => {
    resetBackgroundSave();
    restorePresentationImages();
  };
  window.addEventListener("pagehide", saveIfPlaying);
  window.addEventListener("pageshow", resumePresentation);
  if (typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveIfPlaying();
      else resumePresentation();
    });
    document.addEventListener("freeze", saveIfPlaying);
    document.addEventListener("resume", resumePresentation);
  }
})();

// 0.34: scroll minimizes; desktop double-click toggles; one-finger image drags
// forward to #main without consuming phone pinch/zoom gestures.
(function wireImageCollapseOnScroll() {
  window.__ssImagePinned = false;
  function bind() {
    const main = document.getElementById("main");
    const wrap = document.getElementById("scene-image-wrap");
    if (!main || !wrap) return;
    const MINIMIZE_AT = 36;
    const DRAG_SLOP = 10; // px — below this, treat as tap not drag
    let lastToggleAt = 0;
    let touchMode = false;
    let touchStartY = 0;
    let touchDragging = false;
    let touchHasMultiplePointers = false;

    function toggleImageSize() {
      if (!wrap.classList.contains("visible")) return;
      const now = Date.now();
      // Cooldown: blocks touchend + dblclick double-fire (common on iOS)
      if (now - lastToggleAt < 400) return;
      lastToggleAt = now;
      const willExpand = wrap.classList.contains("minimized");
      wrap.classList.toggle("minimized");
      window.__ssImagePinned = willExpand;
    }

    main.addEventListener("scroll", () => {
      if (!wrap.classList.contains("visible")) return;
      if (window.__ssImagePinned) return;
      if (main.scrollTop > MINIMIZE_AT) wrap.classList.add("minimized");
    }, { passive: true });

    // Desktop: wheel on image scrolls #main
    wrap.addEventListener("wheel", (e) => {
      if (!wrap.classList.contains("visible")) return;
      main.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });

    // Touch: drag on image scrolls #main
    wrap.addEventListener("touchstart", (e) => {
      touchMode = true;
      if (!e.touches || e.touches.length !== 1) {
        touchHasMultiplePointers = true;
        touchDragging = false;
        return;
      }
      touchHasMultiplePointers = false;
      touchStartY = e.touches[0].clientY;
      touchDragging = false;
    }, { passive: true });

    wrap.addEventListener("touchmove", (e) => {
      if (!wrap.classList.contains("visible")) return;
      if (!e.touches || e.touches.length !== 1) {
        touchHasMultiplePointers = true;
        touchDragging = false;
        return;
      }
      if (touchHasMultiplePointers) return;
      const y = e.touches[0].clientY;
      const dy = touchStartY - y;
      if (!touchDragging && Math.abs(dy) < DRAG_SLOP) return;
      touchDragging = true;
      main.scrollTop += dy;
      touchStartY = y;
      e.preventDefault();
    }, { passive: false });

    // Desktop path
    wrap.addEventListener("dblclick", (e) => {
      if (touchMode) return;
      e.preventDefault();
      toggleImageSize();
    });

    // Never consume touchend: browser double-tap/pinch zoom remains available.
    wrap.addEventListener("touchend", (e) => {
      touchMode = true;
      touchDragging = false;
      if (!e.touches || e.touches.length === 0) touchHasMultiplePointers = false;
    }, { passive: true });

    wrap.addEventListener("touchcancel", () => {
      touchDragging = false;
      touchHasMultiplePointers = false;
    }, { passive: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

// --- end engine.js ---
