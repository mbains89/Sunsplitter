// SUN-PRICE-TAGS-01 — enabled choice buttons carry no cost tags by default; the reader setting
// "Show costs on choices" brings back exactly today's honest labels; disabled reasons are the
// same either way; trust locks read in one plain template that never voices the dead; the
// setting persists and still works when storage is blocked; changed status values pulse once.
//
// Seeded runs are played through the real rendered buttons (btn.onclick, as a keyboard press),
// once with the setting OFF and once ON. The two runs must follow the same path to the same
// state: the setting is presentation only.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_show_costs_v1";
const SEEDS = [5101, 5202, 5303];
const MAX_STEPS = 400;
const EFFECTS_MARKUP = /choice-effects|effect-pro|effect-con|already at (?:ceiling|floor)|\(clamped\)/;
const TRUST_TEMPLATE = /^[A-Z][a-z]+ won't take this from you yet\.$/;
const STAT_IDS = { survivors: "stat-survivors", integrity: "stat-integrity", cohesion: "stat-cohesion", supplies: "stat-supplies", embryos: "stat-embryos" };

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

// One seeded run through the rendered buttons. `storedSetting` is written to storage before the
// first render (null = leave storage empty), so ON runs exercise the persisted-preference path.
function seededWalk(seed, storedSetting) {
  const runtime = loadGame(ROOT);
  return runtime.evaluate(`((seed, storedSetting, maxSteps, statIds, key, effectsSource) => {
    const effectsMarkup = new RegExp(effectsSource);
    const mulberry32 = ${mulberry32.toString()};
    Math.random = mulberry32((seed ^ 0x53554e) >>> 0);
    const pick = mulberry32(seed);
    localStorage.clear();
    if (storedSetting !== null) localStorage.setItem(key, storedSetting);
    let calls = [];
    const realFormat = formatEffectsHtml;
    formatEffectsHtml = function recordedFormatEffectsHtml(effects) {
      const html = realFormat(effects);
      calls.push(html);
      return html;
    };
    const snapshot = () => ({
      survivors: visibleLivingCrewCount(), integrity: state.integrity, cohesion: state.cohesion,
      supplies: state.supplies, embryos: state.embryos
    });
    const problems = [];
    const steps = [];
    let enabledSeen = 0, enabledCosted = 0, disabledSeen = 0, decisions = 0, taggedDecisions = 0, pulses = 0;
    const choicesEl = document.getElementById("choices");
    resetRunState();
    choicesEl.children = [];
    calls = [];
    showScene("wake");
    for (let step = 0; step < maxSteps; step++) {
      if (document.getElementById("ending-title").textContent) break;
      const scene = state.scene;
      const buttons = choicesEl.children.slice();
      const enabled = buttons.filter(button => !button.disabled);
      const disabled = buttons.filter(button => button.disabled);
      if (calls.length !== enabled.length) problems.push(scene + ": " + calls.length + " cost labels built for " + enabled.length + " enabled buttons");
      const enabledHtml = enabled.map(button => button.innerHTML);
      const disabledHtml = disabled.map(button => button.innerHTML);
      enabledSeen += enabled.length;
      disabledSeen += disabled.length;
      enabledCosted += calls.filter(Boolean).length;
      if (enabled.length >= 2) {
        decisions += 1;
        if (enabledHtml.some(html => effectsMarkup.test(html))) taggedDecisions += 1;
      }
      for (const html of disabledHtml) {
        if (!/<span class="choice-reason">[^<]+<\\/span>/.test(html)) problems.push(scene + ": disabled button has no reason: " + html);
        if (effectsMarkup.test(html)) problems.push(scene + ": disabled button shows cost markup: " + html);
      }
      steps.push({ scene, enabledHtml, disabledHtml, calls: calls.slice() });
      if (!enabled.length) { problems.push(scene + ": no enabled exit"); break; }
      const chosen = enabled[Math.floor(pick() * enabled.length)];
      for (const id of Object.values(statIds)) document.getElementById(id).classList.remove("stat-pulse");
      const before = snapshot();
      choicesEl.children = [];
      calls = [];
      chosen.onclick({ detail: 0 });
      const after = snapshot();
      for (const [stat, id] of Object.entries(statIds)) {
        const changed = before[stat] !== after[stat];
        const pulsing = document.getElementById(id).classList.contains("stat-pulse");
        if (changed !== pulsing) problems.push(scene + ": " + stat + " " + before[stat] + "->" + after[stat] + " pulse=" + pulsing);
        if (pulsing) pulses += 1;
      }
      const announcer = document.getElementById("stat-announcer").textContent;
      const expected = "Ship status: " + after.survivors + " survivors, hull integrity " + state.integrity + "%, cohesion " + state.cohesion + "%, supplies " + state.supplies + "%, embryos " + state.embryos + "%.";
      if (!document.getElementById("ending-title").textContent && announcer !== expected) problems.push(scene + ": stat announcer drifted: " + announcer);
    }
    return {
      problems, steps, enabledSeen, enabledCosted, disabledSeen, decisions, taggedDecisions, pulses,
      ending: document.getElementById("ending-title").textContent,
      finalState: JSON.stringify({ scene: state.scene, survivors: state.survivors, integrity: state.integrity, cohesion: state.cohesion,
        supplies: state.supplies, embryos: state.embryos, dead: state.dead, flags: state.flags, trust: state.trust, affinity: state.affinity })
    };
  })(${seed}, ${JSON.stringify(storedSetting)}, ${MAX_STEPS}, ${JSON.stringify(STAT_IDS)}, ${JSON.stringify(KEY)}, ${JSON.stringify(EFFECTS_MARKUP.source)})`, 60_000);
}

function seededRunChecks(errors, summary) {
  for (const seed of SEEDS) {
    const off = seededWalk(seed, null);
    const on = seededWalk(seed, "1");
    for (const line of off.problems) errors.push(`seed ${seed} OFF: ${line}`);
    for (const line of on.problems) errors.push(`seed ${seed} ON: ${line}`);
    if (!off.ending || !on.ending) errors.push(`seed ${seed}: run did not reach an ending (off="${off.ending}" on="${on.ending}")`);
    if (off.finalState !== on.finalState) errors.push(`seed ${seed}: the setting changed the run (paths or state differ)`);
    if (off.steps.length !== on.steps.length) {
      errors.push(`seed ${seed}: step counts differ ${off.steps.length} vs ${on.steps.length}`);
      continue;
    }
    if (off.enabledCosted < 20) errors.push(`seed ${seed}: only ${off.enabledCosted} enabled costed buttons seen; walk too thin to judge`);
    if (off.taggedDecisions !== 0) errors.push(`seed ${seed}: ${off.taggedDecisions} decisions show cost tags with the setting OFF`);
    if (on.taggedDecisions === 0) errors.push(`seed ${seed}: setting ON showed no cost tags at all`);
    off.steps.forEach((offStep, index) => {
      const onStep = on.steps[index];
      const where = `seed ${seed} step ${index} ${offStep.scene}`;
      if (offStep.scene !== onStep.scene) { errors.push(`${where}: ON run is at ${onStep.scene}`); return; }
      if (JSON.stringify(offStep.disabledHtml) !== JSON.stringify(onStep.disabledHtml)) {
        errors.push(`${where}: disabled buttons differ between settings`);
      }
      if (JSON.stringify(offStep.calls) !== JSON.stringify(onStep.calls)) errors.push(`${where}: cost labels computed differently between settings`);
      offStep.enabledHtml.forEach((html, i) => {
        if (EFFECTS_MARKUP.test(html)) errors.push(`${where}: OFF enabled button shows cost markup: ${html}`);
        const label = offStep.calls[i] || "";
        if (onStep.enabledHtml[i] !== html + label) errors.push(`${where}: ON button is not the OFF label plus its honest cost label: ${onStep.enabledHtml[i]}`);
        if (label && !onStep.enabledHtml[i].includes('<span class="choice-effects">')) errors.push(`${where}: ON costed button lost choice-effects markup`);
      });
    });
    summary.push(`seed ${seed}: ${off.steps.length} screens, ${off.decisions} decisions, ${off.enabledCosted} costed buttons; tagged decisions OFF ${off.taggedDecisions} / ON ${on.taggedDecisions}; ${off.disabledSeen} disabled; ${off.pulses} pulses; ending "${off.ending}"`);
  }
}

function disabledReasonChecks(errors) {
  const runtime = loadGame(ROOT);
  const result = runtime.evaluate(`(() => {
    const reasonsFor = (sceneId, setup) => {
      resetRunState();
      setup();
      document.getElementById("choices").children = [];
      showScene(sceneId, { skipOnEnter: true });
      return document.getElementById("choices").children.filter(button => button.disabled).map(button => {
        const match = button.innerHTML.match(/<span class="choice-reason">([^<]*)<\\/span>/);
        return { html: button.innerHTML, reason: match ? match[1] : "" };
      });
    };
    const cases = {
      vaultUnpaid: () => { state.trust.mira = 40; state.cohesion = 0; },
      vaultTrust: () => { state.trust.mira = 39; state.cohesion = 10; },
      conservation: () => { state.embryos = 55; state.integrity = 3; state.cohesion = 8; state.supplies = 2; },
      coolantTrust: () => { state.trust.mira = 29; state.trust.lena = 29; },
      powerSupplies: () => { state.trust.mira = 50; state.supplies = 5; },
      powerTrust: () => { state.trust.mira = 44; state.supplies = 40; }
    };
    const scenesFor = { vaultUnpaid: "vault_voice", vaultTrust: "vault_voice", conservation: "arc_future_2", coolantTrust: "coolant_trade", powerSupplies: "power_crisis", powerTrust: "power_crisis" };
    const out = {};
    for (const mode of ["off", "on"]) {
      localStorage.clear();
      setShowCostsOnChoices(mode === "on");
      out[mode] = {};
      for (const [name, setup] of Object.entries(cases)) out[mode][name] = reasonsFor(scenesFor[name], setup);
    }
    resetRunState();
    const direct = {
      trustMira: formatRequiresReason({ trust: { mira: 101 } }),
      trustLenaMin: formatRequiresReason({ trust: { lena: { min: 101 } } }),
      unrecoveredTomas: formatRequiresReason({ trust: { tomas: 101 } }),
      supplies: formatRequiresReason({ supplies: { min: 999 } }),
      unpaid: formatUnpaidEffectsReason({ supplies: -999 })
    };
    resetRunState();
    state.recovered.tomas = true;
    direct.recoveredTomas = formatRequiresReason({ trust: { tomas: 101 } });
    resetRunState();
    state.dead.push("mira");
    state.deathCause.mira = "price-tags fixture";
    direct.deadMira = formatRequiresReason({ trust: { mira: 101 } });
    // Test-only scene (never shipped): a trust gate on a dead person must not voice her.
    scenes.price_tags_fixture_dead_trust = {
      text: "test-only price-tags fixture",
      choices: [
        { text: "Fixture gated choice", next: "price_tags_fixture_dead_trust", requires: { trust: { mira: 101 } } },
        { text: "Fixture exit", next: "price_tags_fixture_dead_trust" }
      ]
    };
    document.getElementById("choices").children = [];
    showScene("price_tags_fixture_dead_trust", { skipOnEnter: true });
    const deadButton = document.getElementById("choices").children.find(button => button.innerHTML.includes("Fixture gated choice"));
    direct.deadRendered = deadButton ? { disabled: !!deadButton.disabled, html: deadButton.innerHTML } : null;
    delete scenes.price_tags_fixture_dead_trust;
    return { out, direct };
  })()`);

  const expected = {
    vaultUnpaid: ["Needs 1 Cohesion; 0 available"],
    vaultTrust: ["Needs 30 Cohesion; 10 available", "Mira won't take this from you yet."],
    conservation: ["Needs 4 Hull; 3 available"],
    coolantTrust: ["Mira won't take this from you yet.", "Lena won't take this from you yet."],
    powerSupplies: ["Needs 8 Supplies; 5 available"],
    powerTrust: ["Mira won't take this from you yet."]
  };
  for (const [name, reasons] of Object.entries(expected)) {
    const off = result.out.off[name];
    const on = result.out.on[name];
    const offReasons = off.map(item => item.reason);
    for (const reason of reasons) {
      if (!offReasons.includes(reason)) errors.push(`${name}: expected disabled reason "${reason}", saw ${JSON.stringify(offReasons)}`);
    }
    if (JSON.stringify(off) !== JSON.stringify(on)) errors.push(`${name}: disabled buttons differ between Show costs OFF and ON`);
    for (const item of [...off, ...on]) {
      if (EFFECTS_MARKUP.test(item.html)) errors.push(`${name}: disabled button shows cost markup`);
      if (/trust/i.test(item.reason)) errors.push(`${name}: trust lock still reads as a meter: ${item.reason}`);
    }
  }
  const d = result.direct;
  for (const [name, reason] of [["trustMira", d.trustMira], ["trustLenaMin", d.trustLenaMin], ["recoveredTomas", d.recoveredTomas]]) {
    if (!TRUST_TEMPLATE.test(reason)) errors.push(`${name}: trust reason off-template: ${JSON.stringify(reason)}`);
  }
  if (d.trustMira !== "Mira won't take this from you yet." || d.trustLenaMin !== "Lena won't take this from you yet." || d.recoveredTomas !== "Tomas won't take this from you yet.") {
    errors.push(`trust template names the wrong person: ${JSON.stringify(d)}`);
  }
  if (d.unrecoveredTomas !== "") errors.push(`unrecovered Tomas was voiced in a lock reason: ${JSON.stringify(d.unrecoveredTomas)}`);
  if (d.deadMira !== "") errors.push(`dead Mira was voiced in a lock reason: ${JSON.stringify(d.deadMira)}`);
  if (!d.deadRendered || !d.deadRendered.disabled || !d.deadRendered.html.includes('<span class="choice-reason">Requirements not met</span>') || d.deadRendered.html.includes("Mira")) {
    errors.push(`dead-person trust gate did not fall back to the generic honest reason: ${JSON.stringify(d.deadRendered)}`);
  }
  if (d.supplies !== "Needs 999 Supplies; 61 available" || d.unpaid !== "Needs 999 Supplies; 61 available") {
    errors.push(`resource reasons changed: ${JSON.stringify([d.supplies, d.unpaid])}`);
  }
}

function persistenceChecks(errors) {
  // Default OFF and the toggle on both controls.
  const writer = loadGame(ROOT);
  const toggled = writer.evaluate(`(() => {
    localStorage.clear();
    syncShowCostsControls();
    const pressed = () => ["btn-show-costs", "btn-show-costs-meta"].map(id => document.getElementById(id).getAttribute("aria-pressed"));
    const chip = () => document.getElementById("show-costs-chip").textContent;
    const out = { defaultOn: showCostsOnChoices(), defaultPressed: pressed(), defaultChip: chip() };
    out.firstToggle = toggleShowCosts();
    out.rawOn = localStorage.getItem(${JSON.stringify(KEY)});
    out.onPressed = pressed();
    out.onChip = chip();
    out.secondToggle = toggleShowCosts();
    out.rawOff = localStorage.getItem(${JSON.stringify(KEY)});
    out.offPressed = pressed();
    toggleShowCosts();
    out.rawFinal = localStorage.getItem(${JSON.stringify(KEY)});
    out.inRun = (() => {
      resetRunState();
      state.trust.mira = 40; state.cohesion = 10;
      document.getElementById("choices").children = [];
      showScene("vault_voice", { skipOnEnter: true });
      const buttons = () => document.getElementById("choices").children.filter(b => !b.disabled).map(b => b.innerHTML);
      const shown = buttons();
      toggleShowCosts(); // what the footer button's inline onclick calls

      const hidden = buttons();
      toggleShowCosts();
      return { shown, hidden, back: buttons(), scene: state.scene, cohesion: state.cohesion };
    })();
    return out;
  })()`);
  if (toggled.defaultOn !== false) errors.push("Show costs is not OFF by default");
  if (JSON.stringify(toggled.defaultPressed) !== '["false","false"]') errors.push(`controls not unpressed by default: ${toggled.defaultPressed}`);
  if (!/^Off\b/.test(toggled.defaultChip)) errors.push(`title chip does not say Off by default: ${toggled.defaultChip}`);
  if (toggled.firstToggle !== true || toggled.rawOn !== "1" || JSON.stringify(toggled.onPressed) !== '["true","true"]' || !/^On\b/.test(toggled.onChip)) {
    errors.push(`toggle ON did not persist or sync both controls: ${JSON.stringify(toggled)}`);
  }
  if (toggled.secondToggle !== false || toggled.rawOff !== "0" || JSON.stringify(toggled.offPressed) !== '["false","false"]') {
    errors.push(`toggle OFF did not persist or sync both controls: ${JSON.stringify(toggled)}`);
  }
  const inRun = toggled.inRun;
  if (!inRun.shown.some(html => html.includes("choice-effects")) || inRun.hidden.some(html => EFFECTS_MARKUP.test(html)) ||
      JSON.stringify(inRun.back) !== JSON.stringify(inRun.shown) || inRun.scene !== "vault_voice" || inRun.cohesion !== 10) {
    errors.push(`in-run toggle did not repaint the current buttons in place without touching state: ${JSON.stringify(inRun)}`);
  }

  // A fresh page reads the stored preference; anything but "1" is OFF.
  const reader = loadGame(ROOT);
  const read = reader.evaluate(`(() => {
    const out = {};
    localStorage.clear();
    localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(toggled.rawFinal)});
    syncShowCostsControls();
    out.on = showCostsOnChoices();
    out.pressed = document.getElementById("btn-show-costs").getAttribute("aria-pressed");
    resetRunState();
    state.trust.mira = 40; state.cohesion = 10;
    document.getElementById("choices").children = [];
    showScene("vault_voice", { skipOnEnter: true });
    out.rendered = document.getElementById("choices").children.filter(b => !b.disabled).some(b => b.innerHTML.includes("choice-effects"));
    localStorage.setItem(${JSON.stringify(KEY)}, "yes");
    out.garbage = showCostsOnChoices();
    return out;
  })()`);
  if (toggled.rawFinal !== "1" || read.on !== true || read.pressed !== "true" || read.rendered !== true) {
    errors.push(`stored preference did not carry into a fresh page: ${JSON.stringify(read)}`);
  }
  if (read.garbage !== false) errors.push("an unrecognised stored value did not fall back to OFF");

  // Storage blocked entirely: default OFF, and the toggle still works for the session.
  const blocked = loadGame(ROOT);
  const blockedResult = blocked.evaluate(`(() => {
    const out = {};
    localStorage.getItem = () => { throw new Error("storage blocked"); };
    localStorage.setItem = () => { throw new Error("storage blocked"); };
    const render = () => {
      resetRunState();
      state.trust.mira = 40; state.cohesion = 10;
      document.getElementById("choices").children = [];
      showScene("vault_voice", { skipOnEnter: true });
      return document.getElementById("choices").children.filter(b => !b.disabled).some(b => b.innerHTML.includes("choice-effects"));
    };
    out.defaultOn = showCostsOnChoices();
    out.defaultRendered = render();
    try { out.toggle = toggleShowCosts(); } catch (e) { out.threw = String(e); }
    out.afterToggle = showCostsOnChoices();
    out.toggledRendered = render();
    out.pressed = document.getElementById("btn-show-costs-meta").getAttribute("aria-pressed");
    try { out.toggleBack = toggleShowCosts(); } catch (e) { out.threwBack = String(e); }
    out.backRendered = render();
    return out;
  })()`);
  if (blockedResult.threw || blockedResult.threwBack || blockedResult.defaultOn !== false || blockedResult.defaultRendered !== false ||
      blockedResult.toggle !== true || blockedResult.afterToggle !== true || blockedResult.toggledRendered !== true ||
      blockedResult.pressed !== "true" || blockedResult.toggleBack !== false || blockedResult.backRendered !== false) {
    errors.push(`setting did not survive blocked storage: ${JSON.stringify(blockedResult)}`);
  }

  // Writes fail but a stale "1" is readable (quota full): the reader's toggle still wins.
  const stale = loadGame(ROOT);
  const staleResult = stale.evaluate(`(() => {
    localStorage.clear();
    localStorage.setItem(${JSON.stringify(KEY)}, "1");
    localStorage.setItem = () => { throw new Error("quota"); };
    const before = showCostsOnChoices();
    const toggle = toggleShowCosts();
    return { before, toggle, after: showCostsOnChoices(), raw: localStorage.getItem(${JSON.stringify(KEY)}) };
  })()`);
  if (staleResult.before !== true || staleResult.toggle !== false || staleResult.after !== false) {
    errors.push(`toggle did not hold against a failed write: ${JSON.stringify(staleResult)}`);
  }

  // The setting never enters the run save.
  const saver = loadGame(ROOT);
  const saved = saver.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showScene("wake");
    setShowCostsOnChoices(true);
    persistSave({ silent: true });
    return localStorage.getItem(SAVE_KEY) || "";
  })()`);
  if (!saved || /show_costs|showCosts/i.test(saved)) errors.push("the Show costs setting leaked into the run save");
}

function sourceChecks(errors) {
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const title = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  for (const id of ["btn-show-costs", "btn-show-costs-meta"]) {
    const tag = index.match(new RegExp(`<button id="${id}"[^>]*>`))?.[0] || "";
    if (!tag.includes('type="button"') || !tag.includes('aria-pressed="false"') || !tag.includes('onclick="toggleShowCosts()"')) {
      errors.push(`${id} is not a native toggle button with aria-pressed`);
    }
  }
  const meta = index.match(/<div id="meta"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || "";
  if (!/<div class="meta-actions">[\s\S]*id="btn-show-costs-meta"/.test(meta)) errors.push("in-run Costs toggle is not in the existing footer actions");
  if (!/aria-label="Show costs on choices"[^>]*>Costs</.test(index)) errors.push("footer toggle accessible name must contain its visible label");
  if (!/<div class="reader-setting-actions" role="group" aria-label="Reader setting">/.test(index)) errors.push("title reader-setting group missing");
  if (/role="alert"|class="[^"]*toast/.test(index)) errors.push("a notification surface appeared in index.html");
  // The pulse must live before style.css's unterminated .new-run-confirm-chip block, or browsers nest it away.
  const brokenAt = style.indexOf(".new-run-confirm-chip {");
  const pulseAt = style.indexOf(".stat-value.stat-pulse {");
  if (pulseAt < 0 || (brokenAt >= 0 && pulseAt > brokenAt)) errors.push("stat pulse rule missing or placed where browsers drop it");
  const reduced = style.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g) || [];
  if (!reduced.some(block => /\.stat-value\.stat-pulse\s*\{[^}]*animation:\s*none/.test(block))) errors.push("stat pulse ignores prefers-reduced-motion");
  if (!/#title-screen #btn-show-costs\[aria-pressed="true"\]/.test(title)) errors.push("title toggle has no pressed state");
}

export function sunPlayerflowPriceTagsChecks() {
  const errors = [];
  const summary = [];
  sourceChecks(errors);
  disabledReasonChecks(errors);
  persistenceChecks(errors);
  seededRunChecks(errors, summary);
  return { errors, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary } = sunPlayerflowPriceTagsChecks();
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-price-tags");
    for (const line of errors.slice(0, 60)) console.error("FAIL " + line);
    if (errors.length > 60) console.error(`FAIL ... ${errors.length - 60} more`);
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-price-tags (default OFF: no cost markup on enabled buttons across ${SEEDS.length} seeded runs; ON: identical path with today's labels; disabled reasons unchanged; trust locks in one template, never voicing the dead; setting persists and survives blocked storage; changed values pulse once)`);
}
