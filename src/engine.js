// Sunsplitter — engine.js
// Version 0.25.3 — Causality lies (dead speech / unread state)
// Core game loop: showScene, choices, stats, save/load, endings
// Keep story content out of this file.

const TONE_ACK_KEY = "sunsplitter_tone_ack_v1";
const SAVE_KEY = "sunsplitter_save_v3";
const SAVE_KEY_LEGACY = "sunsplitter_save_v2";

// 0.25: track loaded save gameVersion for in-flight skip of new Elias/Mira lethals
let loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");

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
    state.supplies = 41;
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

function startGame() {
  // New run overwrites the slot — warn if a save exists
  if (hasSave() && !window.__ssForceNew) {
    const ok = window.confirm("Start a new run? This will replace your saved progress.");
    if (!ok) return;
  }
  window.__ssForceNew = false;
  resetRunState();
  showScreen("game");
  renderStatus();
  showScene("wake");
  // First beat written so a refresh still has a slot
  persistSave({ silent: true });
}

function showTitleScreen() {
  showScreen("title");
  refreshTitleResumeUI();
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

function showScene(id) {
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
  if (scene.onEnter) {
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
    img.src = imgSrc;
    img.alt = id;
    imgWrap.classList.add("visible");
    if (isIntimateScene(id, scene)) imgWrap.classList.add("intimate");
  } else {
    imgWrap.classList.remove("visible");
    img.removeAttribute("src");
  }

  // Reset text scroll so image starts expanded
  const mainEl = document.getElementById("main");
  if (mainEl) mainEl.scrollTop = 0;

  const raw = typeof scene.text === "function" ? scene.text() : (scene.text || "");
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

    const unpaid = c.effects && !canAffordEffects(c.effects);
    const gated = (c.requires && !meetsRequirements(c.requires)) || unpaid;
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (gated ? " disabled" : "");
    btn.type = "button";
    const tagHtml = formatTagHtml(c.tag);
    if (gated) {
      btn.disabled = true;
      let reason = formatRequiresReason(c.requires);
      if (!reason && unpaid) reason = "Cannot pay the full cost";
      btn.innerHTML = `<span class="choice-label">${escapeHtml(c.text)}${tagHtml}</span>` +
        (reason ? `<span class="choice-reason">${escapeHtml(reason)}</span>` : "");
    } else {
      const effectsHtml = formatEffectsHtml(c.effects);
      btn.innerHTML = `<span class="choice-label">${escapeHtml(c.text)}${tagHtml}</span>${effectsHtml}`;
      btn.onclick = () => makeChoice(c);
    }
    choicesEl.appendChild(btn);
  });

  renderStatus();
}

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

function formatRequiresReason(req) {
  if (!req || typeof req !== "object") return "";
  const parts = [];
  for (const [k, rule] of Object.entries(req)) {
    if (k === "trust") {
      if (!rule || typeof rule !== "object") continue;
      for (const [who, tRule] of Object.entries(rule)) {
        const need = typeof tRule === "number" ? tRule : (tRule && tRule.min);
        if (need == null) continue;
        const name = crewFirstName(who);
        const have = (state.trust && state.trust[who]) || 0;
        if (have < need) parts.push(`Needs ${name} trust ${need} (${have})`);
      }
      continue;
    }
    const labels = { supplies: "Supplies", integrity: "Hull", cohesion: "Cohesion", embryos: "Embryos", survivors: "Survivors" };
    const label = labels[k] || k;
    const have = state[k];
    if (typeof rule === "number") {
      if (typeof have === "number" && have < rule) parts.push(`Requires ${rule} ${label}; ${have} available`);
    } else if (rule && typeof rule === "object" && rule.min !== undefined) {
      if (typeof have === "number" && have < rule.min) parts.push(`Requires ${rule.min} ${label}; ${have} available`);
    }
  }
  return parts[0] || "Requirements not met";
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
  // Landfall — high bar, action-driven
  else if (
    s >= 6 &&
    c >= 50 &&
    emb >= 65 &&
    integ >= 35 &&
    crisis !== "vent" &&
    vaultSac !== "living" &&
    (final === "hold" || planet === "committed") &&
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
    text = buildLivingShipText(futureVoices, livingVoices, preg, emb);
  }
  // Quiet Ship — collapse
  else if (s <= 4 || (emb < 25 && c < 30) || (integ < 15 && s <= 5)) {
    title = "The Quiet Ship";
    art = "images/ending_ship.jpg";
    text = buildQuietShipText(deadNames, shape);
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
    text = buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices);
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

  // v0.15: endings name 2–3 concrete decisions from this run
  if (typeof concreteRunFacts === "function") {
    const facts = concreteRunFacts();
    if (facts.length) text = facts.join(" ") + "\n\n" + text;
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
  if (state.flags.planet === "committed" || state.flags.final === "hold") {
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
    text += `The commitment made earlier was enough. Arrival was never guaranteed — only possible.\n\n`;
  }
  text += `The vault is still viable. The living are still breathing. That combination was never guaranteed.\n\n`;
  if (shape === "future") text += `You kept the future intact when it cost you. The numbers people will remember that the package arrived.\n\n`;
  else if (shape === "split") text += `You tried to hold both sides of the argument. Arrival does not resolve it. It only changes the room in which it continues.\n\n`;
  text += `You do not know if the subsurface ocean is real. You know only that the people who are left still look at one another, and that the restart package survived the journey with them.\n\nArrival and salvation were never the same thing.\n\nYou land anyway.`;
  return text;
}

function buildLivingShipText(futureVoices, livingVoices, preg, emb) {
  let text = `You chose the people who were already breathing.\n\nThe embryo counts are permanently lower (${emb}%). The vault remembers the cost.\n`;
  if (futureVoices.length) text += ` ${futureVoices.join(" and ")} call it a failure of nerve.\n\n`;
  else text += `\n\n`;
  text += `But the habitation ring is warmer. The remaining crew still argues, eats, and occasionally touches one another without permission.\n\n`;
  if (preg === true) text += `A living pregnancy is possible. That fact sits in the medical bay like a second vault.\n\n`;
  if (livingVoices.length) text += `The living side of the argument — ${livingVoices.join(", ")} — still has a place to stand.\n\n`;
  text += `You did not deliver the future intact. You delivered a smaller, warmer present.\n\nWhether that is enough is no longer a command decision.`;
  return text;
}

function buildQuietShipText(deadNames, shape) {
  let text = `Only a few of you remain — or what remains of the restart package is too thin to matter.\n\n`;
  if (deadNames.length) text += `The dead: ${deadNames.join("; ")}.\n\n`;
  if (shape === "future") text += `You protected the vault when you could. It did not save the room.\n\n`;
  if (shape === "living") text += `You protected the living when you could. There were not enough left to matter.\n\n`;
  text += `The Sunsplitter drifts. Systems fail one by one. There is no longer any pretense of a future.\n\nYou sit with the last of them in the observation blister and watch the stars that do not care.\n\nWhen the final systems go dark, no one speaks.\n\nThis is how the last light goes out.`;
  return text;
}

function buildStillBurningText(crisis, shape, final, planet) {
  let text = `Against every reasonable expectation, the group holds.\n\n`;
  if (crisis === "vent") text += `The cost is permanent. Names are not spoken lightly.\n\n`;
  if (shape === "future") text += `You leaned toward the vault and the mission. The living remember the cold — but they are still here.\n\n`;
  else if (shape === "living") text += `You leaned toward the breathing. The embryo counts are wounded. The room is not.\n\n`;
  else text += `You refused to let either side of the argument own the ship completely.\n\n`;
  if (final === "hold" || planet === "committed") text += `The course remains locked on the rogue planet. Fourteen months. No guarantee.\n\n`;
  else if (final === "comfort") text += `You abandoned the destination for warmth and slightly less hunger.\n\n`;
  else if (final === "transmission") text += `A final transmission went out. The ship went quieter afterward.\n\n`;
  else text += `There is no grand destination. Only the work of the next cycle.\n\n`;
  text += `When you walk the corridors, people still meet your eyes. It is not hope. It is the refusal to die on the same day.`;
  return text;
}

function buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices) {
  let text = `The people under your command no longer move as one.\n\n`;
  if (shape === "future") text += `Protecting the vault cost you the room. The living side of the crew will not forgive the cold.\n\n`;
  if (shape === "living") text += `Protecting the living cost you the mission faction. The numbers people have gone quiet or hard.\n\n`;
  if (leadership === "watch" || reckon === "suppress") text += `Authority hardened. Compliance is high. Trust is not.\n\n`;
  if (deadNames.length) text += `The dead are not equally mourned.\n\n`;
  if (futureVoices.length && livingVoices.length) {
    text += `Future still speaks through ${futureVoices[0]}. Living still speaks through ${livingVoices[0]}. They no longer share a language.\n\n`;
  }
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
  const wrap = document.getElementById("ending-image-wrap");
  const img = document.getElementById("ending-image");
  if (!wrap || !img) return;
  if (src) {
    img.src = src;
    wrap.classList.add("visible");
  } else {
    wrap.classList.remove("visible");
  }
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

  // Living-arc conflict plate shows Tomas.
  if (id === "arc_living_3") {
    if (!isAlive("tomas")) {
      return "images/corridor.jpg";
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
  if (el.classList.contains("visible")) renderCrewPanel();
}

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
      detail = `<div class="crew-detail"><strong>${c.name}</strong> · <span class="dim">${role}</span><br>Dead — ${escapeHtml(cause)}</div>`;
    } else {
      const bits = [role];
      if (favored === selectedKey) bits.push("favored");
      if (state.romance && state.romance[selectedKey]) bits.push("private line");
      if (state.marks && state.marks[selectedKey]) bits.push(String(state.marks[selectedKey]).replace(/_/g, " "));
      detail = `<div class="crew-detail"><strong>${c.name}</strong> · ${bits.map(escapeHtml).join(" · ")}</div>`;
    }
  } else {
    detail = `<div class="crew-detail dim">Tap a name for status.</div>`;
  }

  el.innerHTML = `<div class="crew-chips">${chips}</div>${detail}`;
  el.querySelectorAll(".crew-chip[data-crew]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute("data-crew");
      renderCrewPanel(selectedKey === key ? null : key);
    };
  });
}


// ---------- Save / Resume (v0.19) ----------
// Single slot. Survives refresh, background, tab close on iOS Safari via localStorage.
// Schema versioned. Never wipe an existing save on failed write/parse.

function snapshotState() {
  // Explicit allowlist — full run state 0.17.1+ relies on
  return {
    v: 3,
    gameVersion: (typeof VERSION !== "undefined" ? VERSION : "0.19"),
    savedAt: Date.now(),
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

function applySnapshot(data) {
  if (data && typeof data.gameVersion === "string") loadedGameVersion = data.gameVersion;
  else loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");
  if (!data || typeof data !== "object") return false;
  // Resources
  state.survivors = typeof data.survivors === "number" ? data.survivors : state.survivors;
  state.integrity = typeof data.integrity === "number" ? data.integrity : state.integrity;
  state.cohesion = typeof data.cohesion === "number" ? data.cohesion : state.cohesion;
  state.supplies = typeof data.supplies === "number" ? data.supplies : state.supplies;
  state.embryos = typeof data.embryos === "number" ? data.embryos : state.embryos;
  // Causality-critical
  state.flags = Object.assign({}, data.flags || {});
  state.dead = Array.isArray(data.dead) ? data.dead.slice() : [];
  state.deathCause = Object.assign({}, data.deathCause || {});
  state.scene = typeof data.scene === "string" && data.scene ? data.scene : "wake";
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

function readRawSave() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      // Migrate legacy v2 (raw state dump)
      const legacy = localStorage.getItem(SAVE_KEY_LEGACY);
      if (legacy) {
        try {
          const old = JSON.parse(legacy);
          const migrated = Object.assign({ v: 2, savedAt: Date.now() }, old);
          localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
          raw = localStorage.getItem(SAVE_KEY);
        } catch (e) { /* leave legacy alone */ }
      }
    }
    return raw;
  } catch (e) {
    return null;
  }
}

function hasSave() {
  const raw = readRawSave();
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    return !!(data && data.scene);
  } catch (e) {
    return false;
  }
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
  const snap = snapshotState();
  let json;
  try {
    json = JSON.stringify(snap);
  } catch (e) {
    if (!silent) flashSaveStatus("Save failed", true);
    return false;
  }
  try {
    localStorage.setItem(SAVE_KEY, json);
    // Verify write (Safari private / quota)
    const check = localStorage.getItem(SAVE_KEY);
    if (!check || check.length < 10) {
      if (!silent) flashSaveStatus("Save failed", true);
      return false;
    }
  } catch (e) {
    if (!silent) flashSaveStatus("Storage blocked", true);
    return false;
  }
  if (!silent) flashSaveStatus("Saved");
  updateMetaSaveHint();
  return true;
}

function saveGame() {
  // Manual save — always visible feedback
  persistSave({ silent: false });
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
  // Do not wipe existing storage if apply fails
  const ok = applySnapshot(data);
  if (!ok) {
    flashSaveStatus("Load failed", true);
    return false;
  }
  showScreen("game");
  renderStatus();
  showScene(state.scene);
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
  } catch (e) { /* ignore */ }
  updateMetaSaveHint();
  refreshTitleResumeUI();
}

function flashSaveStatus(msg, isError) {
  let el = document.getElementById("save-status");
  if (!el) {
    // Fallback if meta not in DOM yet
    if (isError) try { window.alert(msg); } catch (e) {}
    return;
  }
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
  el.classList.add("visible");
  clearTimeout(window.__ssSaveFlash);
  window.__ssSaveFlash = setTimeout(() => {
    el.classList.remove("visible");
  }, 1800);
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
  persistSave({ silent: true });
}

// iOS Safari: pagehide is the reliable background/close signal; visibilitychange for switch-away
(function wireLifecycleSave() {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  const saveIfPlaying = () => {
    try {
      const game = document.getElementById("game-screen");
      if (game && !game.classList.contains("hidden") && state && state.scene) {
        persistSave({ silent: true });
      }
    } catch (e) { /* ignore */ }
  };
  window.addEventListener("pagehide", saveIfPlaying);
  if (typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveIfPlaying();
    });
  }
  window.addEventListener("freeze", saveIfPlaying);
})();

// 0.24.93: scroll minimizes; double-tap toggles; pin + cooldown; image forwards scroll to #main
(function wireImageCollapseOnScroll() {
  window.__ssImagePinned = false;
  function bind() {
    const main = document.getElementById("main");
    const wrap = document.getElementById("scene-image-wrap");
    if (!main || !wrap) return;
    const MINIMIZE_AT = 36;
    const DRAG_SLOP = 10; // px — below this, treat as tap not drag
    let lastToggleAt = 0;
    let lastTap = 0;
    let touchMode = false;
    let touchStartY = 0;
    let touchDragging = false;

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
      if (!e.touches || !e.touches[0]) return;
      touchMode = true;
      touchStartY = e.touches[0].clientY;
      touchDragging = false;
    }, { passive: true });

    wrap.addEventListener("touchmove", (e) => {
      if (!e.touches || !e.touches[0]) return;
      if (!wrap.classList.contains("visible")) return;
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

    // Touch path (iOS): double-tap only when not a drag; mark touchMode so dblclick is ignored
    wrap.addEventListener("touchend", (e) => {
      touchMode = true;
      if (touchDragging) {
        touchDragging = false;
        lastTap = 0; // drag is not a tap
        return;
      }
      const now = Date.now();
      if (now - lastTap < 320) {
        e.preventDefault();
        toggleImageSize();
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }, { passive: false });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

// --- end engine.js ---
