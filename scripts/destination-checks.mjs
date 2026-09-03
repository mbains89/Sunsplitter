import { createHash } from "node:crypto";

// SUN-V035-PLAYTEST-DESTINATION-01: pin every non-label field and final outcome
// to b133aaf. A text correction must not change destinations, prices or endings.
const BASELINE_MATRIX = "4ab47f2c5bb9d6c11e1ce7e4d463718129a02aad192ac899300f755ead22ae65";
const BASELINE_OUTCOMES = "144c4006befe4006c304c4582bf44c19c014f693cf49b1ca3eb15277752e087f";
const planets = ["unset", "deferred", "committed"];
const navs = ["jiro", "mira", "rough", "jiro_dead", "jiro_missing", "jiro_debt", "mira_debt", "dead"];
const memories = ["quiet", "proper_seal", "jury_rig", "open_wound"];
export const destinationFixtures = planets.flatMap(planet => navs.flatMap(nav =>
  memories.flatMap(memory => ["rich", "exact", "low_integrity", "low_supplies", "zero"]
    .map(budget => ({ planet, nav, memory, budget })))));

function exerciseDestination(fixtures, mode) {
  const errors = [], rows = [];
  const expect = (ok, message) => { if (!ok) throw new Error(message); };
  const snapshot = () => JSON.stringify(state);
  const html = () => document.getElementById("story").innerHTML;
  const display = id => { document.getElementById("choices").children = []; showScene(id); };
  const click = label => {
    const button = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
    expect(button && !button.disabled, "unavailable " + label + " at " + state.scene);
    document.getElementById("choices").children = []; button.onclick();
  };
  const fixture = f => {
    localStorage.clear(); resetRunState();
    Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    if (f.planet !== "unset") state.flags.planet = f.planet;
    if (f.memory !== "quiet") state.flags.ship_memory = f.memory;
    state.integrity = state.supplies = state.cohesion = state.embryos = 70;
    if (["mira", "rough", "mira_debt"].includes(f.nav)) state.trust.jiro = 34;
    if (f.nav === "rough") state.trust.mira = 39;
    if (["jiro_dead", "dead"].includes(f.nav)) kill("jiro", "destination fixture");
    if (f.nav === "dead") kill("mira", "destination fixture");
    if (f.nav === "jiro_missing") state.recovered.jiro = false;
    if (f.nav.endsWith("_debt")) {
      for (const who of Object.keys(state.affinity)) state.affinity[who] = 65;
      state.affinity.lena = 80; state.romance.lena = true;
      state.affinity[f.nav === "jiro_debt" ? "jiro" : "mira"] = 0;
      state.affinity.amara = state.affinity.tomas = 0;
      state.flags.last_tx_spent = true;
    }
    const branch = ["jiro", "mira", "rough"].indexOf(navBranch());
    const floor = [{ integrity: 30, supplies: 10 }, { integrity: 28, supplies: 10 },
      { integrity: 35, supplies: 12 }][branch];
    if (f.budget !== "rich") Object.assign(state, floor);
    if (f.budget === "low_integrity") state.integrity--;
    if (f.budget === "low_supplies") state.supplies--;
    if (f.budget === "zero") state.integrity = state.supplies = 0;
  };
  const navBranch = () => {
    const debt = relationshipDebtors();
    if (isAlive("jiro") && state.trust.jiro >= 35 && !debt.includes("jiro")) return "jiro";
    if (isAlive("mira") && state.trust.mira >= 40 && !debt.includes("mira")) return "mira";
    return "rough";
  };
  const checkLabels = () => {
    const committed = state.flags.planet === "committed", choices = scenes.final_choice.choices;
    expect(html().includes("You still have no destination.") === !committed, "setup lost destination truth");
    expect(html().includes("The course is still locked on the rogue planet.") === committed,
      "setup lost committed-course truth");
    const hold = choices.find(c => c.flag.final === "hold");
    const oldLabels = {
      jiro: "Hold course for the rogue planet. We finish what we started.",
      mira: "Hold course — Mira can keep the drive honest even without Jiro's full voice.",
      rough: "Hold course anyway. Navigation will be rougher without full crew buy-in."
    };
    const newLabels = {
      jiro: "Set course for the rogue planet.",
      mira: "Set course for the rogue planet — Mira can keep the drive honest even without Jiro's full voice.",
      rough: "Set course for the rogue planet anyway. Navigation will be rougher without full crew buy-in."
    };
    expect(hold.text === (committed ? oldLabels : newLabels)[navBranch()], "course label contradicts setup");
    const comfort = choices.find(c => c.flag.final === "comfort");
    if (!relationshipDebtors().some(k => k === "amara" || k === "tomas"))
      expect(comfort.text === (committed ? "Abandon the destination." : "Leave the destination unset.") +
        " Spend the remaining fuel on speed and comfort.", "comfort label invents an existing destination");
    else expect(comfort.text === "Push for comfort anyway — even if some of the living will not thank you.",
      "existing debt wording changed");
    expect(gameplayChoiceButtons().some(b => !b.disabled), "no affordable final exit");
  };
  const continueTwice = (before, text, raw, legacy = false) => {
    let adopted;
    for (let i = 0; i < 2; i++) {
      resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
      expect(resumeGame() && snapshot() === before && html() === text, "Continue changed state/view");
      if (!legacy) expect(readRawSave() === raw, "current saved bytes changed");
      if (i) expect(readRawSave() === adopted, "repeated Continue rewrote adopted save");
      adopted = readRawSave(); checkLabels();
    }
  };
  for (const f of fixtures) {
    try {
      fixture(f);
      if (mode === "route") {
        resetRunState(); display("status");
        if (f.opening === "ration") click("Ration immediately");
        else if (f.opening === "repairs") click("Prioritize life support");
        else {
          click("We need a destination.");
          click(f.planet === "committed" ? "Set course. We go there" : "Not yet. Stabilize");
        }
        const planet = state.flags.planet;
        // Controlled milestone contexts; actual relevant buttons, not a full playthrough.
        display("transmission"); click("Log it and hold course");
        expect(state.flags.planet === planet && state.flags.signal === "ignore", "signal invented destination");
        display("act3_reckoning_cut"); click("Briefing. One hour.");
        expect(state.flags.planet === planet && isAlive("jiro"), "recovery changed destination");
        display("ship_memory_payoff"); click("Face the final orders.");
        expect(state.flags.planet === planet && state.flags.priority === f.opening, "route lost original choice");
        checkLabels(); continueTwice(snapshot(), html(), readRawSave());
      } else if (mode === "matrix") {
        state.scene = "final_choice"; const before = snapshot(); display("final_choice");
        const choices = scenes.final_choice.choices.map(c =>
          ["hold", "comfort"].includes(c.flag.final) ? { ...c, text: "<destination label>" } : c);
        rows.push([f, before, html(), choices, gameplayChoiceButtons().map(b => b.disabled),
          resolveSceneImage("final_choice", scenes.final_choice)]);
        expect(snapshot() === before, "render wrote state");
        checkLabels();
      } else if (mode === "outcome") {
        display("final_choice");
        const originalPlanet = state.flags.planet;
        const choice = scenes.final_choice.choices.find(c => c.flag.final === f.pick);
        expect(choice, "missing existing final action");
        click(choice.text);
        if (state.scene === "patch_fails") {
          expect(f.pick === "hold", "non-course action entered patch");
          click(f.abort ? "Abort the hard burn." : "Hold course anyway.");
          if (f.abort) {
            expect(state.scene === "final_choice" && state.flags.planet === originalPlanet,
              "aborted burn lost destination history");
            try { checkLabels(); }
            catch (error) { errors.push(JSON.stringify(f) + ": " + error.message); }
            click("Keep them alive one day at a time.");
          }
        }
        expect(state.scene === "ending_check" && state.flags.planet === originalPlanet,
          "destination outcome changed early commitment");
        rows.push([f, snapshot(), document.getElementById("ending-title").textContent,
          document.getElementById("ending-text").textContent, whatRemainsFacts()]);
        expect(rows.at(-1)[2], "final action failed to reach ending");
      } else if (mode === "save") {
        state.romance.lena = state.romance.vess = state.romance.amara_tomas = true;
        state.flags.vess_intimate = true; state.flags.pregnancy_risk = "unknown";
        state.promises.sela = "made"; state.memories = ["Preserve destination and private history."];
        if (f.aborted) {
          display("final_choice"); click(scenes.final_choice.choices.find(c => c.flag.final === "hold").text);
          expect(state.scene === "patch_fails", "save fixture missed patch");
          click("Abort the hard burn."); expect(state.scene === "final_choice", "save fixture missed return");
        } else display("final_choice");
        checkLabels();
        const before = snapshot(), text = html(), save = snapshotState();
        if (f.legacy) delete save.sceneEntered;
        const raw = JSON.stringify(save), confirm = window.confirm;
        resetRunState(); state.supplies = 1; display("wake");
        expect(saveGame() && JSON.parse(readRawSave()).scene === "wake", "unrelated slot not saved");
        window.confirm = () => true;
        try { expect(importSaveText(raw), "valid destination import rejected"); }
        finally { window.confirm = confirm; }
        continueTwice(before, text, raw, f.legacy);
      }
    } catch (error) { errors.push(JSON.stringify(f) + ": " + error.message); }
  }
  return { count: fixtures.length, errors, rows };
}

const run = (runtime, fixtures, mode) => runtime.evaluate("(" + exerciseDestination.toString() +
  ")(" + JSON.stringify(fixtures) + "," + JSON.stringify(mode) + ")", 30_000);
const fingerprint = result => ({ ...result,
  fingerprint: createHash("sha256").update(JSON.stringify(result.rows)).digest("hex") });
export const destinationMatrix = runtime => fingerprint(run(runtime, destinationFixtures, "matrix"));
const outcomeFixtures = planets.flatMap(planet => ["jiro", "mira", "rough"].flatMap(nav =>
  memories.flatMap(memory => ["hold", "comfort", "transmission", "endure"]
    .map(pick => ({ planet, nav, memory, budget: "rich", pick })))));
outcomeFixtures.push(...planets.flatMap(planet => ["jiro", "mira", "rough"].flatMap(nav =>
  ["jury_rig", "open_wound"].map(memory =>
    ({ planet, nav, memory, budget: "rich", pick: "hold", abort: true })))));
export const destinationOutcomes = runtime => fingerprint(run(runtime, outcomeFixtures, "outcome"));

export function destinationChecks(runtime) {
  const matrix = destinationMatrix(runtime), outcomes = destinationOutcomes(runtime);
  const errors = [...matrix.errors, ...outcomes.errors];
  if (matrix.fingerprint !== BASELINE_MATRIX) errors.push("Destination mechanics/setup/image differ from predecessor");
  if (outcomes.fingerprint !== BASELINE_OUTCOMES) errors.push("Destination outcomes differ from predecessor");
  const routes = [
    { opening: "ration", planet: "unset" }, { opening: "repairs", planet: "unset" },
    { opening: "planet", planet: "deferred" }, { opening: "planet", planet: "committed" }
  ].map(f => ({ ...f, nav: "jiro", memory: "quiet", budget: "rich" }));
  const saves = planets.flatMap(planet => navs.flatMap(nav =>
    [false, true].flatMap(aborted => [false, true].map(legacy =>
      ({ planet, nav, memory: "open_wound", budget: "rich", aborted, legacy })))));
  for (const [mode, fixtures] of [["route", routes], ["save", saves]])
    errors.push(...run(runtime, fixtures, mode).errors.map(e => mode + ": " + e));
  return errors;
}
