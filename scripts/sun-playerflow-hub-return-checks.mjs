// SUN-DIET-HUB-01 (D11 Deep, C01) — the corridor paragraph prints once a run.
// act3_spine_next is the post-vault hub; a run comes back to it about five times, and each visit
// used to print the same corridor paragraph. The first visit still prints it; a return prints one
// roster-neutral line, and the Tomas allusion still fires on whichever visit consumes it. A return
// is read from existing one-shot state the hub alone can spend after the vault; nothing is added.
// Checks, through the real engine:
//   1. a scripted hub loop: full paragraph on the first visit, the return line after, and every
//      later visit offers the first visit's choices (labels, exits, effects, order) less only the
//      offers already spent;
//   2. keys the opening walk or the private hours can spend do not turn a first visit into a return;
//   3. rendering the hub text writes nothing, on a first visit and on a return; the allusion is spent
//      by the exits of the visit that shows it (SUN-HUB-RESUME-01), so the save of that visit keeps it;
//   4. seeded real play: the first rendered visit always prints the paragraph, it prints at most
//      twice a run, and a second print follows only Elias's hour (whose mark the opening walk can
//      also set, so it cannot prove a return).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RETURN_LINE = "The vault light is still on. There is still work.";
const PARAGRAPH = [
  "The vault light stays on behind you.",
  "The ship has two men back who were written off, and a list of names that is no longer only numbers.",
  "A third name is on the board now. The Dawnbreak survivor is still finding which bulkheads answer.",
  "There is still work. There is still the fracture the private hours left in the corridor."
];
const ALLUSION = "Names first, then numbers.";
const CREW_NAMES = ["Lena", "Elias", "Mira", "Tomas", "Amara", "Jiro", "Sela", "Vess", "Rourke"];

// The headless DOM stub keeps old buttons when the engine clears #choices; clear them as a browser would.
const PRELUDE = `
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html,
      set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  const story = () => document.getElementById("story").innerHTML;
  const hub = scenes.act3_spine_next;
`;

const runtime = loadGame(ROOT);

// 1. Scripted hub loop with Tomas, Jiro and Vess recovered and the vault spent.
const loop = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const buttons = () => choicesEl.children.map(b => ({ label: b.__ssChoiceLabelHtml || b.innerHTML, disabled: !!b.disabled }));
  // SUN-HUB-RESUME-01: the visit that shows the Tomas allusion spends it on every exit (choice flag);
  // the menu comparison below is of what the player is offered, so that write is read separately.
  const offered = () => hub.choices.map(c => { const o = JSON.parse(JSON.stringify(c)); delete o.flag; return o; });
  const spends = () => hub.choices.map(c => JSON.stringify(c.flag || null));
  const visit = () => ({ scene: state.scene, story: story(), buttons: buttons(), choices: offered(), spends: spends() });
  const choose = start => {
    const sc = scenes[state.scene];
    const list = (typeof sc.choices === "function" ? sc.choices() : sc.choices) || [];
    const c = list.find(x => x.text.startsWith(start));
    if (!c) throw new Error("no choice starting " + JSON.stringify(start) + " at " + state.scene);
    makeChoice(c);
  };
  resetRunState();
  state.recovered.tomas = true; state.recovered.jiro = true; state.recovered.vess = true;
  state.flags.vault_sacrifice = "living";
  const v = [];
  showScene("act3_spine_next"); v.push(visit());
  choose("There's music coming"); choose("Go."); v.push(visit());
  choose("Sit a low-stakes game with Tomas"); choose("Play until the deck runs out");
  choose('"If the vault'); choose("Leave him to the trays."); v.push(visit());
  choose("Share a quiet hour with Elias"); choose("Leave the bulb untouched"); v.push(visit());
  return v;
})())`));

const [first, ...later] = loop;
for (const [i, row] of loop.entries()) assert.equal(row.scene, "act3_spine_next", `scripted visit ${i + 1} did not land on the hub`);
for (const line of PARAGRAPH) assert.ok(first.story.includes(line), `first visit must print the corridor paragraph: ${line}`);
assert.ok(!first.story.includes(RETURN_LINE), "first visit must not print the return line");
for (const [i, row] of later.entries()) {
  assert.ok(row.story.includes(RETURN_LINE), `later visit ${i + 2} must print the return line`);
  for (const line of PARAGRAPH) assert.ok(!row.story.includes(line), `later visit ${i + 2} must not repeat: ${line}`);
}
assert.ok(!first.story.includes(ALLUSION) && !later[0].story.includes(ALLUSION), "no Tomas allusion before a promise");
assert.ok(later[1].story.includes(ALLUSION), "the Tomas allusion must fire on the later visit that consumes it");
assert.ok(!later[2].story.includes(ALLUSION), "the Tomas allusion fires once");
// SUN-HUB-RESUME-01: the visit that shows the allusion spends it by every exit, and no other visit writes it.
for (const [i, row] of loop.entries()) {
  const expected = row.story.includes(ALLUSION) ? JSON.stringify({ prom_tomas_alluded: true }) : "null";
  assert.ok(row.spends.length && row.spends.every(f => f === expected), `visit ${i + 1}: exits must ${expected === "null" ? "write no flag" : "spend the allusion"} (${row.spends.join(", ")})`);
}
for (const name of CREW_NAMES) assert.ok(!RETURN_LINE.includes(name), `the return line must name no one (${name})`);

// Each visit offers the previous visit's choices, in the same order with the same exits and
// effects, less only the offer spent between them.
const spent = [
  { next: "warmth_music", label: "There's music coming from the empty berths." },
  { next: "bond_tomas", label: "Sit a low-stakes game with Tomas if he will play." },
  { next: "bond_elias", label: "Share a quiet hour with Elias — no orders." }
];
for (let i = 1; i < loop.length; i++) {
  const { next, label } = spent[i - 1];
  const before = loop[i - 1], after = loop[i];
  assert.equal(before.choices.filter(c => c.next === next).length, 1, `visit ${i} must offer ${next} once`);
  assert.deepEqual(after.choices, before.choices.filter(c => c.next !== next),
    `visit ${i + 1} choices must equal visit ${i}'s less ${next}`);
  assert.deepEqual(after.buttons, before.buttons.filter(b => !b.label.includes(label)),
    `visit ${i + 1} buttons must equal visit ${i}'s less ${next}`);
}
assert.ok(first.buttons.length >= 8 && first.buttons.every(b => !b.disabled), "scripted first visit renders its full, affordable menu");
assert.equal(first.choices.at(-1).text, "Continue.", "the hub keeps its Continue exit last");
for (const row of later) assert.deepEqual(row.choices.at(-1), first.choices.at(-1), "the Continue exit is unchanged on a return");

// 2. Keys a run can spend before the hub (opening walk, private hours, earlier scenes) leave a
// first visit a first visit.
const preSpent = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const cases = {
    elias_bonded: () => mark("elias", "bonded"),
    elias_bond_skipped: () => mark("elias", "bond_skipped"),
    tomas_scapegoated: () => { state.flags.tomas_scapegoated = true; },
    pair_shield: () => { state.flags.pair_shield = true; },
    ship_interrupt_fired: () => { state.flags.ship_interrupt_fired = true; },
    private_hours: () => { mark("amara", "held_only"); mark("mira", "declined"); state.romance.lena = true; }
  };
  const out = {};
  for (const [name, spend] of Object.entries(cases)) {
    resetRunState();
    state.recovered.tomas = true; state.recovered.jiro = true; state.recovered.vess = true;
    spend();
    showScene("act3_spine_next");
    out[name] = story();
  }
  return out;
})())`));
for (const [name, html] of Object.entries(preSpent)) {
  assert.ok(html.includes(PARAGRAPH[0]) && html.includes(PARAGRAPH[3]), `${name} before the hub must not turn the first visit into a return`);
  assert.ok(!html.includes(RETURN_LINE), `${name}: first visit printed the return line`);
}

// 3. Rendering the hub text is pure on both branches.
const purity = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const out = {};
  for (const [name, setup] of Object.entries({
    first: () => {},
    returning: () => { state.flags.warmth_music = true; },
    returningWithAllusion: () => { state.flags.warmth_meal = true; state.promises.tomas = "made"; }
  })) {
    resetRunState();
    state.recovered.tomas = true; state.recovered.jiro = true; state.recovered.vess = true;
    setup();
    hub.onEnter();
    const before = JSON.stringify(state);
    const a = hub.text(), b = hub.text();
    out[name] = { same: a === b, pure: JSON.stringify(state) === before, text: a };
  }
  return out;
})())`));
for (const [name, row] of Object.entries(purity)) {
  assert.ok(row.same, `${name}: hub text changes between renders`);
  assert.ok(row.pure, `${name}: hub text rendering wrote state`);
}
assert.ok(purity.first.text.startsWith(PARAGRAPH[0]), "pure first render prints the paragraph");
assert.equal(purity.returning.text, RETURN_LINE, "a return with no allusion prints the return line alone");
assert.ok(purity.returningWithAllusion.text.startsWith(RETURN_LINE) && purity.returningWithAllusion.text.includes(ALLUSION),
  "a return that consumes the allusion prints both");

// 4. Seeded real play (runner pattern from sun-playerflow-no-repeat-lap-checks.mjs).
const RUNS_PER_PICKER = 100;
const sweep = { runs: 0, visits: 0, returns: 0, repeats: 0, firstNotFull: [], tooMany: [], badRepeat: [], buttonMismatch: [] };
for (const picker of ["random", "cheapest"]) {
  for (let chunk = 0; chunk * 20 < RUNS_PER_PICKER; chunk++) {
    const play = loadGame(ROOT);
    const chunkSeed = 4100 + (picker === "cheapest" ? 100 : 0) + chunk;
    const rows = JSON.parse(play.evaluate(`JSON.stringify((() => {
      ${PRELUDE}
      let seed = ${chunkSeed};
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      Math.random = rnd;
      const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
        (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
        (!c.effects || canAffordEffects(c.effects));
      const RES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
      const cost = c => RES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
      const pick = list => {
        if (${JSON.stringify(picker)} === "cheapest") { const least = Math.min(...list.map(cost)); list = list.filter(c => cost(c) === least); }
        return list[Math.floor(rnd() * list.length)];
      };
      const runs = [];
      for (let r = 0; r < 20; r++) {
        resetRunState();
        showScene("wake");
        const path = [], visits = [];
        for (let step = 0; step < 700; step++) {
          const id = state.scene;
          path.push(id);
          if (id === "act3_spine_next") {
            const html = story();
            const labels = choicesEl.children.map(b => b.__ssChoiceLabelHtml || "");
            const expected = hub.choices.filter(enabled).map(c => c.text);
            visits.push({ html, since: path.slice(0, -1).slice(-3),
              buttonsMatch: labels.length === expected.length && labels.every((l, i) => l.includes(escapeHtml(expected[i]))) });
          }
          if (id === "ending_check" || !scenes[id]) break;
          const sc = scenes[id];
          const list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
          if (!list.length) break;
          makeChoice(pick(list));
        }
        runs.push(visits);
      }
      return runs;
    })())`, 600_000));
    for (const [r, visits] of rows.entries()) {
      const where = `${picker} chunk ${chunk} (seed ${chunkSeed}) run ${r}`;
      sweep.runs++;
      sweep.visits += visits.length;
      if (!visits.length) continue;
      const full = visits.map(v => v.html.includes(PARAGRAPH[3]));
      if (!full[0]) sweep.firstNotFull.push(where);
      if (full.filter(Boolean).length > 2) sweep.tooMany.push(where);
      visits.forEach((v, i) => {
        if (!v.buttonsMatch) sweep.buttonMismatch.push(`${where} visit ${i + 1}`);
        if (i === 0) return;
        if (!full[i]) { sweep.returns++; return; }
        sweep.repeats++;
        if (!v.since.some(id => id === "bond_elias" || id === "bond_elias_mending")) sweep.badRepeat.push(`${where} visit ${i + 1} after ${v.since.join(" > ")}`);
      });
    }
  }
}
assert.deepEqual(sweep.firstNotFull, [], "the first rendered hub visit must always print the paragraph");
assert.deepEqual(sweep.tooMany, [], "the paragraph must print at most twice a run");
assert.deepEqual(sweep.badRepeat, [], "a second print may follow only Elias's hour");
assert.deepEqual(sweep.buttonMismatch, [], "rendered hub buttons must match the hub's enabled choices in order");
assert.ok(sweep.returns > sweep.repeats * 5, `returns (${sweep.returns}) should dwarf repeats (${sweep.repeats})`);

console.log(`PASS sun-playerflow-hub-return: paragraph on first visit, return line after, allusion kept; ` +
  `choices equal less spent offers; pre-hub keys stay first; text pure; ` +
  `${sweep.runs} seeded runs, ${sweep.visits} hub visits, ${sweep.returns} returns, ${sweep.repeats} Elias-hour repeats`);
