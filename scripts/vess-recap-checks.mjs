import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// SUN-V035-PLAYTEST-VESS-RECAP-01. Baseline state/choices/gates/image, not text.
const BASELINE_FINGERPRINT = "dbf8183e37e1a4509fabc8e49c46a6b4208eedb66dd67db2e9247275d403e1bc";
const phases = ["none", "declined", "accepted", "complete", "flag_only"];
export const vessRecapFixtures = [];
for (const phase of phases) for (const life of ["alive", "dead", "missing"])
for (const originals of ["two", "spent", "absent", "none"])
for (const closed of [false, true]) vessRecapFixtures.push({ phase, life, originals, closed });

function exerciseVessRecap(fixtures, mode) {
  const errors = [], rows = [];
  const accepted = "Vess offered the attempt and you accepted. Power stayed hers.";
  const complete = "Shared the last long-range window and a private hour with Vess.";
  const remaining = "You can still check who is willing to meet without an audience";
  const expect = (ok, message) => { if (!ok) throw new Error(message); };
  const snapshot = () => JSON.stringify(state);
  const html = () => document.getElementById("story").innerHTML;
  const display = id => { document.getElementById("choices").children = []; showScene(id); };
  const click = label => {
    const b = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
    expect(b && !b.disabled, "unavailable " + label + " at " + state.scene);
    document.getElementById("choices").children = []; b.onclick();
  };
  const fixture = f => {
    localStorage.clear(); resetRunState();
    Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.flags.ship_interrupt_fired = true; state.flags.hydro = "full";
    if (f.originals !== "none") state.romance.lena = state.romance.amara = true;
    if (f.originals === "spent") state.pursuit.lena = state.pursuit.amara = true;
    if (f.originals === "absent") { kill("lena", "recap fixture"); kill("amara", "recap fixture"); }
    if (["accepted", "complete"].includes(f.phase)) state.romance.vess = true;
    if (["complete", "flag_only"].includes(f.phase)) state.flags.vess_intimate = true;
    if (f.phase === "declined") mark("vess", "declined");
    if (f.life === "dead") kill("vess", "recap fixture");
    if (f.life === "missing") state.recovered.vess = false;
    if (f.closed) for (const who of ROMANCEABLE) if (!state.romance[who]) mark(who, "declined");
    state.memories = [];
  };
  const checkText = () => {
    const text = html(), liveAccepted = isAlive("vess") && !!state.romance.vess;
    expect(text.includes(accepted) === !!(liveAccepted && !state.flags.vess_intimate),
      "accepted Vess missing or falsely completed");
    expect(text.includes(complete) === !!(liveAccepted && state.flags.vess_intimate),
      "completed Vess missing or fabricated");
    expect(!text.includes("one first-time bond"), "arbitrary first-time count remains");
    expect(text.includes(remaining) === hasOpenRomanceGates(), "remaining-check wording changes gate");
    const second = text.match(/Someone you already crossed a line with may still come looking: ([^<]+?)\. A second approach/);
    const names = ["mira", "amara", "sela", "lena"]
      .filter(who => state.romance[who] && !state.pursuit[who] && isAlive(who)).map(who => crew[who].name);
    expect((second ? second[1] : "") === names.join(", "), "second-approach list changed");
    expect(!scenes.pursuit_window.choices.some(c => /vess/.test(c.next)), "invented another Vess encounter");
  };
  for (const f of fixtures) {
    try {
      fixture(f);
      if (mode === "matrix") {
        state.scene = "pursuit_window"; const before = snapshot(); display("pursuit_window");
        rows.push([f, before, scenes.pursuit_window.choices, hasOpenRomanceGates(),
          ROMANCEABLE.filter(romanceOpen), resolveSceneImage("pursuit_window", scenes.pursuit_window)]);
        expect(snapshot() === before, "entry/render wrote state");
        expect(gameplayChoiceButtons().some(b => !b.disabled), "no affordable exit");
        checkText();
      } else if (mode === "route") {
        state.recovered.vess = false; state.romance.vess = false;
        delete state.flags.vess_intimate; delete state.marks.vess;
        state.supplies = 60; const cohesion = state.cohesion;
        display("vess_boarding"); click("Get her through the collar");
        if (f.phase === "declined") click("Decline. Log it clean.");
        else {
          click("Accept the offer");
          if (f.phase === "complete") { click("Give her the window"); click("Let the hour end"); }
          else click("Keep the window for the ship");
        }
        click("Walk in on Amara and Tomas"); click("Stay. Join"); click("Dress and leave");
        expect(state.scene === "pursuit_window", "actual route missed recap");
        expect(!!state.romance.vess === (f.phase !== "declined") &&
          !!state.flags.vess_intimate === (f.phase === "complete"), "actual encounter facts changed");
        expect(state.cohesion === cohesion + (f.phase === "complete" ? 5 : 4) && state.supplies === 60,
          "existing route resource effects changed");
        checkText();
        const before = snapshot(), raw = readRawSave(), text = html();
        for (let i = 0; i < 2; i++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === before && readRawSave() === raw && html() === text,
            "post-encounter Continue changed facts/replayed benefits");
        }
        expect(!scenes.vess_offer.choices.some(c => c.next === "vess_transmission"), "used Vess offer reopened");
        const expected = JSON.parse(snapshot()); expected.scene = "debt_notice";
        click("Close the private hours.");
        expect(snapshot() === JSON.stringify(expected), "free close changed state");
        if (f.phase !== "declined") expect(html().includes(f.phase === "complete" ? complete : accepted),
          "existing epilogue Vess record lost");
        expected.scene = "act3_spine_next"; click("Take the temperature change");
        expect(snapshot() === JSON.stringify(expected), "free onward route changed state");
      } else if (mode === "new_window") {
        display("pursuit_window"); const before = snapshot();
        expect(hasOpenRomanceGates(), "fixture has no remaining gate");
        const expected = JSON.parse(before); expected.scene = "intimacy_window";
        click("Use the last private window on someone new.");
        expect(snapshot() === JSON.stringify(expected), "checking remaining approaches changed history");
        expect(!scenes.intimacy_window.choices.some(c => /vess/.test(c.next)), "accepted Vess reoffered as new");
      } else if (mode === "save") {
        state.romance.amara_tomas = true; state.flags.pregnancy_risk = "unknown";
        state.promises.sela = "made"; state.memories = ["Keep this private history."];
        display("pursuit_window");
        const before = snapshot(), text = html(), choices = JSON.stringify(scenes.pursuit_window.choices);
        const save = snapshotState(); if (f.legacy) delete save.sceneEntered;
        const raw = JSON.stringify(save), confirm = window.confirm;
        // Replace the slot, not just live state: a no-op Import must fail.
        resetRunState(); state.supplies = 1; display("wake");
        expect(saveGame() && JSON.parse(readRawSave()).scene === "wake", "unrelated replacement slot not saved");
        window.confirm = () => true;
        try { expect(importSaveText(raw), "valid recap import rejected"); }
        finally { window.confirm = confirm; }
        let adopted;
        for (let i = 0; i < 2; i++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === before && html() === text &&
            JSON.stringify(scenes.pursuit_window.choices) === choices, "Continue changed history/view");
          if (!f.legacy) expect(readRawSave() === raw, "current imported bytes changed");
          if (i) expect(readRawSave() === adopted, "repeat Continue rewrote slot");
          adopted = readRawSave(); checkText();
        }
      } else if (mode === "entry") {
        state.flags.ship_memory = f.memory; state.flags.ship_interrupt_fired = f.fired;
        const before = snapshot(), redirect = scenes.pursuit_window.onEnter();
        const expected = !f.fired && ["jury_rig", "open_wound"].includes(f.memory) ? "ship_interrupt" : undefined;
        expect(redirect === expected && snapshot() === before, "ship interruption routing changed");
      }
    } catch (error) { errors.push(JSON.stringify(f) + ": " + error.message); }
  }
  return { errors, rows, count: fixtures.length };
}

export function vessRecapMatrix(runtime) {
  const result = runtime.evaluate("(" + exerciseVessRecap.toString() + ")(" +
    JSON.stringify(vessRecapFixtures) + ', "matrix")', 30_000);
  return { ...result, fingerprint: createHash("sha256").update(JSON.stringify(result.rows)).digest("hex") };
}

export function vessRecapChecks(runtime) {
  const matrix = vessRecapMatrix(runtime), errors = [...matrix.errors];
  try { assert.equal(matrix.fingerprint, BASELINE_FINGERPRINT); }
  catch { errors.push("Vess recap changed baseline state/choices/gates/image"); }
  const routes = ["accepted", "complete", "declined"].map(phase => ({ phase, originals: "two", life: "alive" }));
  const saves = [];
  for (const phase of phases) for (const life of ["alive", "dead", "missing"])
  for (const originals of ["two", "spent"]) for (const legacy of [false, true])
    saves.push({ phase, life, originals, legacy });
  const entries = [];
  for (const memory of [undefined, "proper_seal", "jury_rig", "open_wound"])
  for (const fired of [false, true]) entries.push({ memory, fired });
  for (const [mode, fixtures] of [["route", routes], ["new_window", routes], ["save", saves], ["entry", entries]]) {
    const result = runtime.evaluate("(" + exerciseVessRecap.toString() + ")(" +
      JSON.stringify(fixtures) + ", " + JSON.stringify(mode) + ")", 30_000);
    errors.push(...result.errors.map(e => mode + ": " + e));
  }
  return errors;
}
