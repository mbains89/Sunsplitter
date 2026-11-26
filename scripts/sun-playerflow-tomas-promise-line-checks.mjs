// SUN-TOMAS-PROMISE-LINE-01 (Myth read of SUN-PROMISE-BREATH-01) — Tomas's promise reaches the ending
// only as a crisis test settled it. Played through the real scenes:
//   - an Off-Shift vow (offshift_tomas "Say the sentence.") is kept by fiat with no test, so it never
//     prints a crisis line in What Remains or Tomas's epilogue, on Custody (after possession) or Breath;
//   - a promise made through bond_tomas > prom_make_tomas and kept at the crisis prints "At the crisis,
//     the living received the mercy promised to Tomas." and "At the crisis the living got the mercy" on
//     either path; a crisis break prints its own path's line; an untested promise prints nothing (L-024).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const list = id => { const c = scenes[id].choices; return typeof c === "function" ? c.call(scenes[id]) : c; };
  const pick = (id, test) => { const c = list(id).find(test); if (!c) throw new Error(id + ": choice missing"); makeChoice(c); };
  const fresh = () => {
    resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.flags.vault_sacrifice = "split";
  };
  const make = () => {
    showScene("bond_tomas"); pick("bond_tomas", c => c.next === "prom_make_tomas");
    pick("prom_make_tomas", c => c.flag && c.flag.prom_tomas);
    return state.promises.tomas;
  };
  const ending = () => {
    const tomas = crewEpilogues().find(p => /Tomas/.test(p.split(" ").slice(0, 4).join(" "))) || "";
    return { promise: state.promises.tomas, facts: whatRemainsFacts().join(" | "), tomas };
  };
  const vow = (path, answer) => {
    fresh(); state.crisisPath = path;
    if (path === "custody") { showScene("custody_hub"); pick("custody_hub", c => c.next === "custody_" + answer); pick(state.scene, () => true); }
    else { showScene("breath_hub"); pick("breath_hub", c => c.next === "breath_" + answer); pick(state.scene, () => true); }
    const atCrisis = state.promises.tomas || null;
    showScene("offshift_tomas"); pick("offshift_tomas", c => c.text === "Say the sentence.");
    return Object.assign({ atCrisis }, ending());
  };
  const test = (path, hubNext, setup) => {
    fresh(); const made = make(); setup(); state.crisisPath = path;
    const hub = path === "custody" ? "custody_hub" : "breath_hub";
    showScene(hub); pick(hub, c => c.next === hubNext);
    while (state.scene !== "prom_vent" && state.scene !== "prom_deck4" && /^(custody|breath)_/.test(state.scene)) pick(state.scene, () => true);
    return Object.assign({ made }, ending());
  };
  return {
    vowCustodyPossession: vow("custody", "possession"),
    vowBreathTrunks: vow("breath", "trunks"),
    vowBreathRacks: vow("breath", "racks"),
    keptCustody: test("custody", "custody_thaw", () => {}),
    keptBreath: test("breath", "breath_racks", () => {}),
    brokenCustody: test("custody", "custody_possession", () => {}),
    brokenBreath: test("breath", "breath_trunks", () => {}),
    untestedForcedTrunks: test("breath", "breath_trunks", () => { state.embryos = 0; })
  };
})())`, 120_000));

const KEPT_FACT = "At the crisis, the living received the mercy promised to Tomas.";
const KEPT_EPI = "At the crisis the living got the mercy; he counted the cost.";
const ANY_TEST = /promised to Tomas|custody test|At the crisis/;

for (const key of ["vowCustodyPossession", "vowBreathTrunks", "vowBreathRacks"]) {
  const r = out[key];
  assert.equal(r.atCrisis, null, `${key}: the fixture made a promise before Off-Shift`);
  assert.equal(r.promise, "kept", `${key}: the Off-Shift vow did not take`);
  assert.ok(!ANY_TEST.test(r.facts), `${key}: an Off-Shift vow printed a crisis result in What Remains: ${r.facts}`);
  assert.ok(!ANY_TEST.test(r.tomas), `${key}: an Off-Shift vow printed a crisis result in Tomas's epilogue: ${r.tomas}`);
}
for (const key of ["keptCustody", "keptBreath"]) {
  const r = out[key];
  assert.equal(r.made, "made", `${key}: bond_tomas did not lead to a made promise`);
  assert.equal(r.promise, "kept", `${key}: the crisis did not keep the promise`);
  assert.ok(r.facts.includes(KEPT_FACT) && !/custody test/.test(r.facts), `${key}: What Remains lacks the crisis keep: ${r.facts}`);
  assert.ok(r.tomas.includes(KEPT_EPI), `${key}: Tomas's epilogue lacks the crisis keep: ${r.tomas}`);
}
assert.equal(out.brokenCustody.promise, "broken");
assert.ok(out.brokenCustody.facts.includes("At the custody test, the inhabited ring paid to keep the vault as possession."), "Custody break missing from What Remains");
assert.ok(out.brokenCustody.tomas.includes("At the custody test the inhabited ring paid to keep the vault, and he counted who paid."), "Custody break missing from the epilogue");
assert.equal(out.brokenBreath.promise, "broken");
assert.ok(out.brokenBreath.facts.includes("At the crisis, crew went into the trunks while the racks could have paid."), "Breath break missing from What Remains");
assert.ok(out.brokenBreath.tomas.includes("At the crisis crew went into the trunks while the racks could have paid, and he counted who was sent."), "Breath break missing from the epilogue");
assert.equal(out.untestedForcedTrunks.promise, "made", "forced trunks resolved Tomas's promise");
assert.ok(!ANY_TEST.test(out.untestedForcedTrunks.facts) && !ANY_TEST.test(out.untestedForcedTrunks.tomas), "an untested promise reached the ending (L-024)");

console.log("PASS sun-playerflow-tomas-promise-line: an Off-Shift vow never prints a crisis result (Custody after possession, " +
  "Breath); a crisis keep prints the crisis line on both paths; each path's break prints its own line; untested prints nothing");
