import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// SUN-V035-PLAYTEST-JOIN-TYPO-01. Exact predecessor's non-whitespace prose,
// ordering, choices, image and state across the layout matrix.
const BASELINE_FINGERPRINT = "72c07d7a44d89b31274819afd65e1a408d5224d85e37465a1a7162e1425dbd6d";

export const joinLayoutFixtures = [];
for (const cascade of ["none", "open", "sealed"])
for (const conflict of ["none", "held", "backed"])
for (const mid of ["none", "future", "living"])
for (const absent of [[], ["elias"], ["amara"], ["elias", "amara"]])
  joinLayoutFixtures.push({ cascade, conflict, mid, absent });
for (const tail of ["power_high", "power_limited", "bond_elias", "bond_tomas",
  "bond_jiro", "debtors", "lena_file", "past_threatened", "mira_favor",
  "past_owned", "past_deflected", "past_denied", "lena_dying", "cohesion_zero",
  "cohesion_low", "supplies_zero", "supplies_low", "all_low", "all_zero"])
for (const absent of [[], ["elias"], ["amara"], ["elias", "amara"]])
  joinLayoutFixtures.push({ tail, absent });
for (const tail of ["all_low", "all_zero"]) for (const roster of ["missing", "dead"])
  joinLayoutFixtures.push({ tail, roster });

// This function is evaluated inside the real game's VM, not in Node globals.
function runJoinFixtures(fixtures, mode) {
  const errors = [], rows = [];
  const expect = (ok, message) => { if (!ok) throw new Error(message); };
  const snapshot = () => JSON.stringify(state);
  const display = id => { document.getElementById("choices").children = []; showScene(id); };
  const html = () => document.getElementById("story").innerHTML;
  const click = label => {
    const b = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
    expect(b && !b.disabled, "unavailable choice: " + label);
    document.getElementById("choices").children = []; b.onclick();
  };
  const fixture = f => {
    localStorage.clear(); resetRunState();
    state.crisisPath = "breath"; state.flags.junctionChoice = "none";
    Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    if (f.cascade && f.cascade !== "none") state.flags.cascade_truth = f.cascade;
    if (f.conflict && f.conflict !== "none") mark("conflict", f.conflict);
    if (f.mid && f.mid !== "none") state.flags.mid_arc = f.mid;
    const tail = f.tail || "", all = tail.startsWith("all_");
    if (tail === "power_high" || all) state.flags.elias_power = "high";
    if (tail === "power_limited" || tail === "all_zero") state.flags.elias_power = "limited";
    for (const who of ["elias", "tomas", "jiro"])
      if (tail === "bond_" + who || all) mark(who, "bonded");
    if (tail === "debtors" || all) { state.affinity.mira = 100; state.romance.mira = true; }
    if (tail === "lena_file" || all) state.past_known_by.lena = true;
    if (tail.startsWith("past_")) state.flags.past = tail.slice(5);
    if (all) state.flags.past = tail === "all_zero" ? "denied" : "owned";
    if (tail === "mira_favor" || all) state.flags.mira_favor = true;
    if (tail === "lena_dying" || all) state.dying.lena = "kept working until the clock ran out";
    if (tail === "cohesion_zero" || tail === "all_zero") state.cohesion = 0;
    if (tail === "cohesion_low" || tail === "all_low") state.cohesion = 12;
    if (tail === "supplies_zero" || tail === "all_zero") state.supplies = 0;
    if (tail === "supplies_low" || tail === "all_low") state.supplies = 8;
    if (all) { mark("sela", "spoken"); state.flags.crisis = "vent"; }
    for (const who of f.absent || []) kill(who, "join fixture");
    if (f.roster === "missing")
      Object.assign(state.recovered, { tomas: false, jiro: false, vess: false });
    if (f.roster === "dead") for (const who of Object.keys(crew)) kill(who, "join fixture");
  };
  const layoutErrors = () => {
    const raw = scenes.faction_split.text, rendered = html();
    const tail = raw.split("The next order will not be answered the same way by everyone.")[1];
    const paragraphs = [...rendered.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
    const failures = [];
    if (tail === undefined || (tail && !tail.startsWith("\n\n"))) failures.push("missing paragraph separator");
    if (/everyone\.[^\s<]/.test(rendered)) failures.push("glued rendered join");
    if (!paragraphs.length || paragraphs.some(p => !p.replace(/<[^>]+>/g, "").trim()))
      failures.push("empty rendered paragraph");
    return failures;
  };
  for (const f of fixtures) {
    try {
      fixture(f);
      if (mode === "arrivals") {
        state.romance.mira = true; delete state.flags.junctionChoice;
        display("offshift_mira");
        const expected = JSON.parse(snapshot()); expected.scene = "faction_split";
        click("Stay while she closes it up.");
        expect(snapshot() === JSON.stringify(expected), "free arrival changed state");
        expect(state.flags.junctionChoice === "mira", "actual junction route not admitted");
        expect(layoutErrors().length === 0, layoutErrors().join(", "));
      } else if (mode === "layout") {
        display("faction_split");
        const before = snapshot(), raw = scenes.faction_split.text;
        expect(state.scene === "faction_split", "fixture redirected");
        rows.push([f, raw.replace(/\s/g, ""), scenes.faction_split.choices,
          resolveSceneImage("faction_split", scenes.faction_split), before]);
        expect(snapshot() === before, "render wrote state");
        expect(gameplayChoiceButtons().some(b => !b.disabled), "no affordable exit");
        errors.push(...layoutErrors().map(e => JSON.stringify(f) + ": " + e));
      } else if (mode === "choices") {
        state.integrity = state.cohesion = state.supplies = state.embryos = 60;
        display("faction_split");
        const original = [
          { text: "Call them together and force the fracture into the open.", next: "reckon_summary", effects: { cohesion: -3, integrity: -2 }, lean: { living: 2 }, requires: { cohesion: { min: 25 }, survivors: { min: 4 } }, flag: { reckon: "public" } },
          { text: "Keep the work moving. Ignore the sides until you cannot.", next: "reckon_summary", effects: { cohesion: 1, supplies: -2, integrity: 2 }, requires: { supplies: { min: 2 } }, flag: { reckon: "suppress" } },
          { text: "Pick a side yourself and make it visible.", next: "reckon_summary", effects: { cohesion: -6, integrity: 1 }, lean: { future: 2 }, requires: { survivors: { min: 5 }, cohesion: { min: 15 } }, flag: { reckon: "public" } },
          { text: "Give them the right to remember the dead and the near-loss in their own words.", next: "reckon_summary", effects: { cohesion: 2 }, flag: { reckon: "memory" }, lean: { living: 1 } },
          { text: "Tell them the truth you have been carrying — planet, odds, and what remains.", next: "reckon_summary", effects: { cohesion: 1 }, flag: { reckon: "truth" }, lean: { living: 1 } }
        ];
        expect(JSON.stringify(scenes.faction_split.choices) === JSON.stringify(original), "choice descriptor changed");
        const choice = original[f.pick], expected = JSON.parse(snapshot());
        expected.scene = choice.next; Object.assign(expected.flags, choice.flag);
        for (const [key, value] of Object.entries(choice.effects)) expected[key] += value;
        for (const [key, value] of Object.entries(choice.lean || {})) expected.ideology[key] += value;
        click(choice.text);
        expect(snapshot() === JSON.stringify(expected), "choice changed more than original delta");
        const raw = readRawSave();
        for (let i = 0; i < 2; i++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === JSON.stringify(expected) && readRawSave() === raw,
            "post-choice Continue replayed effects");
        }
      } else if (mode === "saves") {
        state.romance.lena = state.romance.vess = state.romance.amara_tomas = true;
        state.flags.vess_intimate = true; state.flags.pregnancy_risk = "unknown";
        state.promises.sela = "made"; state.memories = ["Preserve the imported private history."];
        display("faction_split");
        const before = snapshot(), text = html(), choices = JSON.stringify(scenes.faction_split.choices);
        const save = snapshotState(); if (f.legacy) delete save.sceneEntered;
        const raw = JSON.stringify(save);
        const confirm = window.confirm; window.confirm = () => true;
        try { expect(importSaveText(raw), "valid import rejected"); }
        finally { window.confirm = confirm; }
        let adopted;
        for (let i = 0; i < 2; i++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === before && html() === text &&
            JSON.stringify(scenes.faction_split.choices) === choices, "Continue did not restore history/view");
          if (!f.legacy) expect(readRawSave() === raw, "current imported bytes changed");
          if (i) expect(readRawSave() === adopted, "repeat Continue rewrote slot");
          adopted = readRawSave();
          expect(layoutErrors().length === 0, layoutErrors().join(", "));
        }
      } else if (mode === "entry") {
        state.crisisPath = f.crisis; delete state.flags.junctionChoice;
        const before = snapshot();
        expect(scenes.faction_split.onEnter() === f.next && snapshot() === before, "entry gate changed");
      }
    } catch (error) { errors.push(JSON.stringify(f) + ": " + error.message); }
  }
  return { errors, rows, count: fixtures.length };
}

export function joinLayoutProof(runtime) {
  const result = runtime.evaluate("(" + runJoinFixtures.toString() + ")(" +
    JSON.stringify(joinLayoutFixtures) + ', "layout")', 30_000);
  return { ...result, fingerprint: createHash("sha256").update(JSON.stringify(result.rows)).digest("hex") };
}

export function joinTypoChecks(runtime) {
  const errors = [], layout = joinLayoutProof(runtime);
  errors.push(...layout.errors.map(e => "Join layout: " + e));
  try { assert.equal(layout.fingerprint, BASELINE_FINGERPRINT); }
  catch { errors.push("Join non-whitespace prose/order/choices/image/state differ from predecessor"); }
  const reported = [{ mid: "living" }, { cascade: "sealed" }, { conflict: "backed" }];
  const transactions = reported.flatMap(f => Array.from({ length: 5 }, (_, pick) => ({ ...f, pick })));
  const saves = [...reported, {}].flatMap(f =>
    [{}, { absent: ["elias", "amara"] }, { roster: "missing" }, { roster: "dead" }].flatMap(cast =>
      [false, true].map(legacy => ({ ...f, ...cast, legacy }))));
  const gates = [
    { crisis: null, next: "act3_crisis_router" },
    { crisis: "breath", next: "aftermath_seal" },
    { crisis: "breath", absent: ["elias"], next: "offshift_open" }
  ];
  for (const [mode, fixtures] of [["arrivals", reported], ["choices", transactions],
    ["saves", saves], ["entry", gates]]) {
    const result = runtime.evaluate("(" + runJoinFixtures.toString() + ")(" +
      JSON.stringify(fixtures) + ", " + JSON.stringify(mode) + ")", 30_000);
    errors.push(...result.errors.map(e => "Join " + mode + ": " + e));
  }
  return errors;
}
