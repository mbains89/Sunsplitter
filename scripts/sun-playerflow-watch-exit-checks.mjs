// SUN-WATCH-EXIT-01 (pending item 22, ruled 2026-11-25) — the Last Off-Shift hour can be declined.
// offshift_open ends on "Go back to the watch.", which takes the zero-door route (junctionChoice
// "none", then faction_split). "none" opens no late hour, so decision 12 as widened on 2026-11-08
// (a living, aboard partner's last scene does not depend on the junction pick) holds only if the exit
// is offered when no partner has a late hour still to come. The witness here does not read the gate:
// from the same state it plays every door through to faction_split (first exits, never a stay) and
// records whose late hour opened. The check FAILS when:
//   1. the exit renders and some door would still open a partner's late hour (the exit would cost
//      her the hour), or the exit is hidden when no door opens one (the decline is withheld for nothing);
//   2. the exit, taken, does not land on faction_split with junctionChoice "none", or the run loops
//      back to the hour (offshift_open, any off-shift scene, filters_stencil, a last scene) or does
//      not reach an ending;
//   3. the same fails in seeded real play from a fresh campaign (uniform picks; at the junction the
//      exit, when shown, is taken half the time).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Shared by both realms: the witness, the exit, and a forward walk that must never revisit the hour.
const HELPERS = `
  persistSave = () => true;
  if (typeof shipMemoryRecordRun === "function") shipMemoryRecordRun = () => {};
  const choicesEl = document.getElementById("choices");
  let html = ""; Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: v => { html = String(v); choicesEl.children.length = 0; } });
  const EXIT = "Go back to the watch.";
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
    (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const choicesOf = id => { const sc = scenes[id]; const raw = sc && sc.choices; return ((typeof raw === "function" ? raw.call(sc) : raw) || []).filter(enabled); };
  const exitOf = () => choicesOf("offshift_open").find(c => c.text === EXIT) || null;
  const doorsOf = () => choicesOf("offshift_open").filter(c => c.text !== EXIT);
  const LATE = { lena: "offshift_lena", amara: "offshift_amara", sela: "offshift_sela", vess: "offshift_vess" };
  const OWNER = { offshift_lena: "lena", offshift_elias: "elias", offshift_mira: "mira", offshift_tomas: "tomas", offshift_amara: "amara",
    offshift_jiro: "jiro", filters_stencil: "sela", offshift_sela: "sela", offshift_vess: "vess" };
  const HOUR = /^(offshift_|filters_stencil$|lena_last_hour|amara_page|sela_past_amber|vess_item_two)/;
  const save = () => JSON.stringify(state);
  const restore = s => { Object.keys(state).forEach(k => { delete state[k]; }); Object.assign(state, JSON.parse(s)); };
  // Partners whose late hour opens after each door, from the current state. State is restored after.
  const witness = () => {
    const before = save(), scene = state.scene, opened = [];
    for (const door of doorsOf()) {
      restore(before);
      const owner = OWNER[door.next];
      makeChoice(door);
      for (let i = 0; i < 40 && state.scene !== "faction_split"; i++) {
        for (const [who, entry] of Object.entries(LATE)) if (state.scene === entry && who !== owner && !opened.includes(who)) opened.push(who);
        const cs = choicesOf(state.scene);
        if (!cs.length) break;
        makeChoice(cs[0]);
      }
    }
    restore(before); state.scene = scene;
    return opened;
  };
  // After the exit: faction_split, "none", then first choices to the ending without touching the hour.
  const takeExitAndFinish = pickNext => {
    const exit = exitOf();
    makeChoice(exit);
    const landed = state.scene, jc = state.flags.junctionChoice, path = [];
    for (let i = 0; i < 700 && state.scene !== "ending_check" && scenes[state.scene]; i++) {
      path.push(state.scene);
      const cs = choicesOf(state.scene);
      if (!cs.length) break;
      makeChoice(pickNext(cs));
    }
    return { landed, jc, ended: state.scene === "ending_check" || !scenes[state.scene], back: path.filter(id => HOUR.test(id)) };
  };
`;

// 1–2. Fixtures: one state per gate shape, all three recovered crew aboard, breath crisis.
const fixtures = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  ${HELPERS}
  const fresh = () => {
    resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
    state.crisisPath = "breath"; state.scene = "offshift_open";
  };
  const partner = who => { state.romance[who] = true; if (who === "lena") mark("lena", "dying_held"); };
  const DONE = { lena: "lena_last_hour", amara: "amara_page", sela: "sela_amber", vess: "vess_item_two" };
  const cases = {
    "no partner": () => {},
    "Mira partner (her last scene is at the board)": () => partner("mira"),
    "Lena held only": () => mark("lena", "held_only"),
    "Lena partner, medical line broken": () => { partner("lena"); state.promises.lena = "broken"; },
    "Vess partner, not recovered": () => { partner("vess"); state.recovered.vess = false; },
    "Lena pending, Vess done": () => { partner("lena"); partner("vess"); state.flags.vess_item_two = true; },
    "Lena and Vess both done": () => { partner("lena"); partner("vess"); state.flags.lena_last_hour = true; state.flags.vess_item_two = true; }
  };
  for (const who of Object.keys(DONE)) {
    cases[who + " partner, hour to come"] = () => partner(who);
    cases[who + " partner, last scene done"] = () => { partner(who); state.flags[DONE[who]] = true; };
    cases[who + " partner, dead"] = () => { partner(who); kill(who, "watch-exit fixture"); };
  }
  const out = {};
  for (const [label, setup] of Object.entries(cases)) {
    fresh(); setup();
    const doors = doorsOf().length, shown = !!exitOf(), opened = witness();
    const row = { doors, shown, opened };
    if (shown) {
      const exit = exitOf();
      row.exit = { next: exit.next, flag: exit.flag };
      Object.assign(row, takeExitAndFinish(cs => cs[0]));
    }
    out[label] = row;
  }
  return out;
})())`, 600_000));

const EXPECT_SHOWN = {
  "no partner": true, "Mira partner (her last scene is at the board)": true, "Lena held only": false,
  "Lena partner, medical line broken": true, "Vess partner, not recovered": true,
  "Lena pending, Vess done": false, "Lena and Vess both done": true
};
for (const who of ["lena", "amara", "sela", "vess"]) {
  EXPECT_SHOWN[who + " partner, hour to come"] = false;
  EXPECT_SHOWN[who + " partner, last scene done"] = true;
  EXPECT_SHOWN[who + " partner, dead"] = true;
}
for (const [label, row] of Object.entries(fixtures)) {
  assert.ok(row.doors >= 2, `${label}: fixture did not render the selector (${row.doors} doors)`);
  if (row.shown) assert.deepEqual(row.opened, [], `${label}: the exit renders while a door would still open a late hour for ${row.opened.join(", ")}`);
  else assert.ok(row.opened.length > 0, `${label}: the exit is withheld though no door opens a late hour`);
  assert.equal(row.shown, EXPECT_SHOWN[label], `${label}: exit ${row.shown ? "shown" : "hidden"}, expected ${EXPECT_SHOWN[label] ? "shown" : "hidden"}`);
  if (row.shown) {
    assert.deepEqual(row.exit, { next: "faction_split", flag: { junctionChoice: "none" } }, `${label}: the exit is not the zero-door route`);
    assert.equal(row.landed, "faction_split", `${label}: the exit landed on ${row.landed}, not faction_split`);
    assert.equal(row.jc, "none", `${label}: the exit wrote junctionChoice=${row.jc}`);
    assert.deepEqual(row.back, [], `${label}: after the exit the run came back to the hour: ${row.back.join(", ")}`);
    assert.ok(row.ended, `${label}: after the exit the run did not reach an ending`);
  }
}

// 3. Real play from a fresh campaign. Recovery only through its own scenes; seeded LCG.
const RUNS = 200;
const real = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  ${HELPERS}
  let seed = 22061;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const pick = cs => cs[Math.floor(rnd() * cs.length)];
  const res = { runs: 0, ended: 0, renders: 0, shown: 0, hidden: 0, taken: 0, bad: [] };
  for (let r = 0; r < ${RUNS}; r++) {
    localStorage.clear(); resetRunState(); showScene("wake");
    let done = false;
    for (let step = 0; step < 700 && !done; step++) {
      const id = state.scene;
      if (id === "ending_check" || !scenes[id]) { res.ended++; done = true; break; }
      const cs = choicesOf(id);
      if (!cs.length) break;
      if (id === "offshift_open") {
        res.renders++;
        const shown = !!exitOf(), opened = witness();
        if (shown) res.shown++; else res.hidden++;
        if (shown && opened.length) res.bad.push({ run: r, why: "exit shown, late hour still to come", opened });
        if (!shown && !opened.length) res.bad.push({ run: r, why: "exit hidden, no late hour to come" });
        if (shown && rnd() < 0.5) {
          res.taken++;
          const after = takeExitAndFinish(pick);
          if (after.landed !== "faction_split" || after.jc !== "none") res.bad.push({ run: r, why: "exit did not land", landed: after.landed, jc: after.jc });
          if (after.back.length) res.bad.push({ run: r, why: "looped back to the hour", back: after.back });
          if (!after.ended) res.bad.push({ run: r, why: "no ending after the exit" });
          else res.ended++;
          done = true;
          break;
        }
      }
      makeChoice(pick(cs));
    }
    res.runs++;
  }
  return res;
})())`, 900_000));

assert.deepEqual(real.bad, [], `real play: ${JSON.stringify(real.bad.slice(0, 5))}`);
assert.equal(real.ended, real.runs, `real play: ${real.runs - real.ended} runs did not reach an ending`);
assert.ok(real.shown >= 5 && real.taken >= 5, `real play: too few exits to judge (shown ${real.shown}, taken ${real.taken})`);

const shownN = Object.values(fixtures).filter(row => row.shown).length;
console.log(`PASS sun-playerflow-watch-exit: ${Object.keys(fixtures).length} gate fixtures (exit shown in ${shownN}, each time no door opens a late hour; hidden in ${Object.keys(fixtures).length - shownN}, each time a door does); the exit writes "none", lands on faction_split and never returns to the hour; real play ${real.runs} runs, junction rendered ${real.renders} times (exit shown ${real.shown}, hidden ${real.hidden}, taken ${real.taken}), all reached an ending`);
