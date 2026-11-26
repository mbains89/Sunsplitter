// SUN-PROMISE-FORWARD-01 (decision 27, 2026-11-25) — Lena's, Elias's and Mira's promise tests run just
// before their own Act 3 lethals while crisisPath is unset, and each outcome returns to that lethal;
// after the crisis the old ladder (prom_vent -> prom_deck4 -> prom_line -> prom_direct) is unchanged.
// Elias's test runs on every ship_memory state (ruling b). Each lethal opens with its seam line only
// after its test. Myth read: once prom_line runs first with Jiro as the patient and the line is kept,
// prom_vent must not render Jiro's prom_line sentence a second time (real-play repro before the fix:
// measure.mjs seed 41, random picker, chunk seed 41008, run 18).
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);

const out = runtime.evaluate(`(() => {
  persistSave = () => true;
  const screen = () => document.getElementById("story").innerHTML.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
  const quotes = text => (text.match(/"[^"]{12,}"/g) || []).map(q => q.replace(/[",.]+$/g, "").replace(/^"/, ""));
  const pick = (id, i) => { const raw = scenes[id].choices; makeChoice((typeof raw === "function" ? raw.call(scenes[id]) : raw)[i]); };
  const fresh = () => {
    resetRunState();
    Object.assign(state.recovered, { tomas: true, jiro: true });
    state.dying = { lena: "kept working until the clock ran out" };
    state.integrity = state.cohesion = state.supplies = state.embryos = 60;
  };
  const row = {};

  // Myth's case: the shared line is kept with Jiro on it, then the Breath pocket test reads Jiro again.
  fresh(); state.promises.lena = "made"; state.promises.amara = "made";
  showScene("act3_lethal_lena_clock");
  row.lineEntered = state.scene; row.linePatient = state.flags.prom_line_other;
  const lineText = screen();
  pick("prom_line", 0); pick("prom_line_keep", 0);
  row.afterLine = state.scene; row.lena = state.promises.lena;
  state.crisisPath = "breath";
  showScene("prom_vent");
  row.ventEntered = state.scene; row.ventPatient = state.flags.prom_line_other;
  const ventText = screen();
  row.repeated = quotes(lineText).filter(q => ventText.includes(q));
  row.ventCountsOn = ventText.includes("That makes four times out of margin");

  // Without an earlier shared-line test, Jiro's pocket line is the original one.
  fresh(); state.promises.amara = "made"; state.crisisPath = "breath";
  showScene("prom_vent");
  row.ventAlone = screen().includes("I've run out of margin twice before");

  // Forward routes and seams.
  const route = (setup, lethal, test, choice) => {
    fresh(); setup(); showScene(lethal);
    const entered = state.scene; pick(test, choice);
    const outcome = state.scene; pick(outcome, 0);
    return { entered, outcome, back: state.scene, opening: screen().slice(0, 60) };
  };
  row.lena = [0, 1].map(i => route(() => { state.promises.lena = "made"; }, "act3_lethal_lena_clock", "prom_line", i));
  row.elias = ["open_wound", "jury_rig", "proper_seal"].map((memory, i) =>
    route(() => { state.promises.elias = "made"; state.flags.ship_memory = memory; }, "act3_lethal_elias_order", "prom_deck4", i % 3));
  row.mira = [0, 1].map(i => route(() => { state.promises.mira = "made"; }, "act3_lethal_mira_board", "prom_direct", i));
  // Untested lethals open without a seam.
  fresh(); showScene("act3_lethal_lena_clock"); row.plainClock = screen().slice(0, 40);
  fresh(); showScene("act3_lethal_elias_order"); row.plainOrder = screen().slice(0, 40);
  fresh(); showScene("act3_lethal_mira_board"); row.plainBoard = screen().slice(0, 40);

  // Post-crisis ladder unchanged.
  fresh(); state.crisisPath = "breath";
  for (const k of ["elias", "lena", "mira"]) state.promises[k] = "made";
  state.flags.ship_memory = "jury_rig";
  showScene("prom_deck4"); pick("prom_deck4", 0); pick("prom_deck4_keep", 0);
  row.ladder = [state.scene]; pick("prom_line", 0); pick("prom_line_keep", 0);
  row.ladder.push(state.scene); pick("prom_direct", 0); pick("prom_direct_keep", 0);
  row.ladder.push(state.scene);
  return row;
})()`, 120_000);

const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };
expect(out.lineEntered === "prom_line" && out.linePatient === "jiro", `clock did not open the shared-line test on Jiro: ${out.lineEntered}/${out.linePatient}`);
expect(out.afterLine === "act3_lethal_lena_clock" && out.lena !== "made", `kept line did not return to the clock: ${out.afterLine}`);
expect(out.ventEntered === "prom_vent" && out.ventPatient === "jiro", `pocket test did not render on Jiro: ${out.ventEntered}/${out.ventPatient}`);
expect(out.repeated.length === 0, `Jiro repeats a prom_line sentence at prom_vent: ${JSON.stringify(out.repeated)}`);
expect(out.ventCountsOn, "prom_vent after a kept shared line lost Jiro's count-on line");
expect(out.ventAlone, "prom_vent without a shared-line test lost Jiro's original line");
const seams = { lena: "The shared line was the first crash.", elias: "The ship is not finished with Deck 4.", mira: ["\"Ours\" includes the next fault.", "Eleven percent less often is not never."] };
const lethals = { lena: ["act3_lethal_lena_clock", "prom_line"], elias: ["act3_lethal_elias_order", "prom_deck4"], mira: ["act3_lethal_mira_board", "prom_direct"] };
for (const who of ["lena", "elias", "mira"]) out[who].forEach((r, i) => {
  const [lethal, test] = lethals[who];
  const seam = Array.isArray(seams[who]) ? seams[who][i] : seams[who];
  expect(r.entered === test, `${who}[${i}]: ${lethal} entered ${r.entered}, not ${test}`);
  expect(r.outcome.startsWith(test + "_"), `${who}[${i}]: outcome ${r.outcome}`);
  expect(r.back === lethal, `${who}[${i}]: outcome returned to ${r.back}, not ${lethal}`);
  expect(r.opening.startsWith(seam), `${who}[${i}]: ${lethal} does not open on its seam: ${r.opening}`);
});
for (const [key, text] of [["plainClock", "The treatment-bay alarm"], ["plainOrder", "Deck 4"], ["plainBoard", "The secondary transfer loop"]]) {
  expect(out[key].startsWith(text), `${key} opens with a seam without a test: ${out[key]}`);
}
expect(out.ladder[0] === "prom_line" && out.ladder[1] === "prom_direct" && !/^act3_lethal/.test(out.ladder[2]),
  `post-crisis ladder changed: ${JSON.stringify(out.ladder)}`);

if (failures.length) {
  for (const failure of failures) console.error("FAIL " + failure);
  process.exit(1);
}
console.log("PASS sun-playerflow-promise-forward: shared line, Deck Four and directive tests open their lethals and return to them, seams only after a test, proper_seal tested, post-crisis ladder unchanged; Jiro does not repeat his shared-line sentence at the pocket test");
