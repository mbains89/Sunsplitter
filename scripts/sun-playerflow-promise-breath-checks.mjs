// SUN-PROMISE-BREATH-01 (decision 27, ruled 2026-11-25; Hex design A steps 4-5) — Tomas's and Sela's
// promises are tested on the Breath path too.
// Pins:
//   - Sela: breath_onset sends both word answers to prom_price when her promise is made and she lives,
//     and to breath_hub otherwise; prom_price opens with the Breath petition on Breath and the Custody
//     petition elsewhere; keep and break return to breath_hub on Breath and custody_hub on Custody; a
//     dead Sela's saved test exits to the hub of the run's own path.
//   - Tomas: racks, garden or black sleep keep his made promise at breath_after with one Tomas line;
//     breath_trunks breaks it only while the racks were open at the hub (Myth read), with the quote-back;
//     racks closed (even with garden or black sleep open) or a dead Tomas leave it made and say nothing.
//   - Ruling (a): in seeded real play no promise resolves in the same choice that kills its holder,
//     and each promise sentence renders at most twice in a run (make and quote-back).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const fixtures = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const story = () => document.getElementById("story").innerHTML.replace(/<[^>]+>/g, " ");
  const list = id => { const c = scenes[id].choices; return typeof c === "function" ? c.call(scenes[id]) : c; };
  const fresh = path => { resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true }); state.crisisPath = path; };
  const out = {};
  // Sela on Breath, both word answers, keep and break.
  out.sela = [0, 1].map(word => [0, 1].map(answer => {
    fresh("breath"); state.promises.sela = "made"; showScene("breath_onset");
    const onsetNext = list("breath_onset")[word].next;
    makeChoice(list("breath_onset")[word]);
    const r = { onsetNext, test: state.scene, text: story() };
    const dead = state.dead.length;
    makeChoice(list("prom_price")[answer]);
    r.result = state.scene; r.promise = state.promises.sela; r.resultText = story(); r.exits = list(state.scene).map(c => c.text + ">" + c.next);
    r.killed = state.dead.length - dead; r.selaAlive = isAlive("sela");
    makeChoice(list(state.scene)[0]); r.after = state.scene;
    return r;
  }));
  // A partner hears no custody offer on Breath: there is no heat question and no custody hub.
  fresh("breath"); state.promises.sela = "made"; state.romance.sela = true; showScene("prom_price"); makeChoice(list("prom_price")[0]);
  out.partnerKeepBreath = story();
  fresh("breath"); showScene("breath_onset"); out.selaUnmade = list("breath_onset").map(c => c.next);
  fresh("breath"); state.promises.sela = "made"; kill("sela", "fixture"); showScene("breath_onset"); out.selaDead = list("breath_onset").map(c => c.next);
  fresh("breath"); showScene("prom_price"); out.priceUnmadeBreath = state.scene;
  // Custody keeps its own petition and exits.
  fresh("custody"); state.promises.sela = "made"; showScene("custody_onset"); makeChoice(list("custody_onset")[0]);
  out.custody = { test: state.scene, text: story() };
  makeChoice(list("prom_price")[0]); out.custody.keepExits = list("prom_price_keep").map(c => c.text + ">" + c.next);
  fresh("custody"); showScene("prom_price"); out.priceUnmadeCustody = state.scene;
  // A saved test with Sela dead exits to its own path's hub.
  out.absent = ["breath", "custody"].map(path => ["prom_price", "prom_price_keep", "prom_price_break"].map(id => {
    fresh(path); state.promises.sela = "made"; kill("sela", "fixture"); showScene(id, { skipOnEnter: true, resume: true });
    return id + ">" + list(id).map(c => c.next).join(",");
  }));
  // Tomas on Breath.
  const tomas = (pick, setup) => {
    fresh("breath"); state.promises.tomas = "made"; setup(); showScene("breath_hub");
    const dead = state.dead.length;
    makeChoice(list("breath_hub").find(c => c.next === pick));
    const atAnswer = state.promises.tomas;
    makeChoice(list(state.scene)[0]);
    return { atAnswer, final: state.promises.tomas, scene: state.scene, text: story(), killed: state.dead.length - dead, remains: whatRemainsFacts().join(" ") };
  };
  out.tomas = {
    racks: tomas("breath_racks", () => {}),
    garden: tomas("breath_garden", () => {}),
    blacksleep: tomas("breath_blacksleep", () => {}),
    trunksOpen: tomas("breath_trunks", () => {}),
    trunksOnlyBlacksleep: tomas("breath_trunks", () => { state.embryos = 0; state.supplies = 4; }),
    trunksGardenAndBlacksleep: tomas("breath_trunks", () => { state.embryos = 0; state.supplies = 10; }),
    trunksRacksLowCohesion: tomas("breath_trunks", () => { state.cohesion = 1; }),
    trunksForced: tomas("breath_trunks", () => { state.embryos = 0; state.supplies = 3; }),
    trunksForcedDeadHelpers: tomas("breath_trunks", () => { state.embryos = 0; kill("amara", "fixture"); kill("lena", "fixture"); }),
    deadRacks: tomas("breath_racks", () => kill("tomas", "fixture")),
    deadTrunks: tomas("breath_trunks", () => kill("tomas", "fixture"))
  };
  return out;
})())`, 120_000));

const SELA_BREATH = "The rumor has moved off the late arrivals.";
const SELA_CUSTODY = "Three of the crew came to you separately inside one watch.";
const QUOTE_TOMAS = "You said: if the vault and the living need the same mercy, the living get it.";
const TOMAS_KEPT = "Nobody on it went into the trunks.";
const TOMAS_BROKEN = "Same names. Not the same lungs.";

for (const [word, pair] of fixtures.sela.entries()) {
  for (const [answer, r] of pair.entries()) {
    const label = `Sela on Breath, word ${word}, answer ${answer}`;
    assert.equal(r.onsetNext, "prom_price", `${label}: breath_onset did not route to the petition test`);
    assert.equal(r.test, "prom_price", `${label}: the petition test did not render`);
    assert.ok(r.text.includes(SELA_BREATH) && !r.text.includes(SELA_CUSTODY), `${label}: the petition is not the Breath variant`);
    assert.equal(r.result, answer ? "prom_price_break" : "prom_price_keep", `${label}: wrong outcome scene`);
    assert.equal(r.promise, answer ? "broken" : "kept", `${label}: the promise did not resolve`);
    assert.deepEqual(r.exits, ["Back to the air loop.>breath_hub"], `${label}: the outcome does not return to breath_hub`);
    assert.ok(!r.resultText.includes("heat question"), `${label}: the Custody offer leaked onto Breath`);
    assert.equal(r.killed, 0, `${label}: the petition test killed someone`);
    assert.ok(r.selaAlive, `${label}: ruling (a) - Sela died in her own test`);
    assert.equal(r.after, "breath_hub", `${label}: the outcome did not reach breath_hub`);
  }
}
assert.ok(fixtures.sela[0][1].resultText.includes("You said: no one will use you as the price of their fear."), "Sela's Breath break lost its quote-back");
assert.ok(fixtures.partnerKeepBreath.includes("It will last longer than you want it to.") && !fixtures.partnerKeepBreath.includes("heat question"),
  "a partner Sela offered custody on Breath");
assert.deepEqual(fixtures.selaUnmade, ["breath_hub", "breath_hub"], "an unmade Sela promise still routes through the petition");
assert.deepEqual(fixtures.selaDead, ["breath_hub", "breath_hub"], "a dead Sela's promise still routes through the petition");
assert.equal(fixtures.priceUnmadeBreath, "breath_hub", "prom_price without a made promise does not fall through to breath_hub on Breath");
assert.equal(fixtures.custody.test, "prom_price", "Custody no longer reaches the petition test");
assert.ok(fixtures.custody.text.includes(SELA_CUSTODY) && !fixtures.custody.text.includes(SELA_BREATH), "the Custody petition changed");
assert.deepEqual(fixtures.custody.keepExits, ["Open the custody question.>custody_hub"], "the Custody petition exit changed");
assert.equal(fixtures.priceUnmadeCustody, "custody_hub", "prom_price without a made promise does not fall through to custody_hub on Custody");
assert.deepEqual(fixtures.absent, [
  ["prom_price>breath_hub", "prom_price_keep>breath_hub", "prom_price_break>breath_hub"],
  ["prom_price>custody_hub", "prom_price_keep>custody_hub", "prom_price_break>custody_hub"]
], "a dead Sela's saved petition test does not exit to its own path's hub");

const t = fixtures.tomas;
for (const key of ["racks", "garden", "blacksleep"]) {
  assert.equal(t[key].atAnswer, "made", `Tomas ${key}: resolved before breath_after`);
  assert.equal(t[key].final, "kept", `Tomas ${key}: not kept at breath_after`);
  assert.equal(t[key].scene, "breath_after", `Tomas ${key}: did not reach breath_after`);
  assert.ok(t[key].text.includes(TOMAS_KEPT) && !t[key].text.includes(TOMAS_BROKEN) && !t[key].text.includes(QUOTE_TOMAS), `Tomas ${key}: wrong line`);
  assert.equal(t[key].killed, 0, `Tomas ${key}: someone died`);
}
for (const key of ["trunksOpen"]) {
  assert.equal(t[key].atAnswer, "broken", `Tomas ${key}: open racks did not break the promise at breath_trunks`);
  assert.ok(t[key].text.includes(TOMAS_BROKEN) && t[key].text.includes(QUOTE_TOMAS) && !t[key].text.includes(TOMAS_KEPT), `Tomas ${key}: the quote-back did not render`);
  assert.equal(t[key].killed, 0, `Tomas ${key}: ruling (a) - the break killed someone`);
}
for (const key of ["trunksOnlyBlacksleep", "trunksGardenAndBlacksleep", "trunksRacksLowCohesion", "trunksForced", "trunksForcedDeadHelpers", "deadRacks", "deadTrunks"]) {
  assert.equal(t[key].final, "made", `Tomas ${key}: an untestable promise resolved (L-024)`);
  assert.ok(!t[key].text.includes(TOMAS_KEPT) && !t[key].text.includes(TOMAS_BROKEN) && !t[key].text.includes(QUOTE_TOMAS), `Tomas ${key}: an untested or dead Tomas spoke`);
  assert.ok(!/promised to Tomas|promise to Tomas/i.test(t[key].remains), `Tomas ${key}: an untested promise reached What Remains`);
}

// Seeded real play: the runner pattern of sun-playerflow-no-repeat-lap-checks (fresh campaign,
// recovery only through its own scenes, Math.imul LCG, chunks of 20, a fresh realm every 5 chunks).
const SEED = 23, CHUNK = 20, RELOAD_EVERY = 5, RUNS_PER_PICKER = 120, MAX_STEPS = 700;
const PICKERS = ["random", "cheapest"];
const SENTENCES = {
  amara: "I will not vent anyone who is still breathing", tomas: "If the vault and the living need the same mercy, the living get it",
  elias: "f Deck Four comes back, you hear it from me first", lena: "I will never kill one of them to keep you",
  sela: "o one will use you as the price of their fear", mira: "The living will decide what the future becomes"
};
function playChunk(runtime, picker, chunk, runs) {
  const chunkSeed = SEED * 1000 + PICKERS.indexOf(picker) * 100 + chunk;
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    persistSave = () => true;
    const choicesEl = document.getElementById("choices");
    if (!choicesEl.__clearsOnInnerHTML) {
      let html = choicesEl.innerHTML;
      Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html,
        set: value => { html = String(value); choicesEl.children.length = 0; } });
      choicesEl.__clearsOnInnerHTML = true;
    }
    let seed = ${chunkSeed};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const shown = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k)));
    const enabled = c => shown(c) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const RESOURCES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
    const costCount = c => RESOURCES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
    const pick = list => {
      if (${JSON.stringify(picker)} === "cheapest") {
        const least = Math.min(...list.map(costCount));
        list = list.filter(c => costCount(c) === least);
      }
      return list[Math.floor(rnd() * list.length)];
    };
    const SENTENCES = ${JSON.stringify(SENTENCES)};
    const HOLDERS = Object.keys(SENTENCES);
    const failures = [], tested = { breathSela: 0, breathTomas: 0 };
    let ended = 0;
    for (let r = 0; r < ${runs}; r++) {
      resetRunState();
      showScene("wake");
      const renders = {};
      let outcome = "capped";
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        if (id === "ending_check" || !scenes[id]) { outcome = "ended"; break; }
        const scene = scenes[id];
        const all = (typeof scene.choices === "function" ? scene.choices() : scene.choices) || [];
        const screen = (document.getElementById("story").innerHTML.replace(/<[^>]+>/g, " ") + " | " +
          all.filter(shown).map(c => c.text).join(" | ")).replace(/&quot;/g, '"').toLowerCase();
        for (const h of HOLDERS) renders[h] = (renders[h] || 0) + screen.split(SENTENCES[h].toLowerCase()).length - 1;
        const choices = all.filter(enabled);
        if (!choices.length) { outcome = "stuck"; break; }
        const before = Object.assign({}, state.promises), deadBefore = state.dead.slice();
        try { makeChoice(pick(choices)); }
        catch (error) { outcome = "threw " + id + ": " + String(error && error.message).slice(0, 80); break; }
        for (const h of HOLDERS) {
          if (before[h] !== "made" || (state.promises[h] !== "kept" && state.promises[h] !== "broken")) continue;
          if (state.crisisPath === "breath" && h === "sela") tested.breathSela++;
          if (state.crisisPath === "breath" && h === "tomas") tested.breathTomas++;
          if (!isAlive(h) || (state.dead.includes(h) && !deadBefore.includes(h))) {
            failures.push("ruling (a): " + h + "'s promise resolved " + state.promises[h] + " in the choice at " + id + " that left the holder dead (" + ${chunkSeed} + "/" + r + ")");
          }
        }
      }
      if (outcome === "ended") ended++;
      else failures.push("run " + ${chunkSeed} + "/" + r + " " + outcome);
      for (const h of HOLDERS) if (renders[h] > 2) failures.push(h + "'s promise sentence rendered " + renders[h] + " times (" + ${chunkSeed} + "/" + r + ")");
    }
    return { failures, tested, ended };
  })())`, 600_000));
}

const failures = [];
const tested = { breathSela: 0, breathTomas: 0 };
let runs = 0, ended = 0;
for (const picker of PICKERS) {
  let runtime = null;
  for (let chunk = 0; chunk * CHUNK < RUNS_PER_PICKER; chunk++) {
    if (chunk % RELOAD_EVERY === 0) runtime = loadGame(ROOT);
    const n = Math.min(CHUNK, RUNS_PER_PICKER - chunk * CHUNK);
    const out = playChunk(runtime, picker, chunk, n);
    runs += n; ended += out.ended;
    failures.push(...out.failures.map(f => `${picker}: ${f}`));
    tested.breathSela += out.tested.breathSela;
    tested.breathTomas += out.tested.breathTomas;
  }
}
assert.deepEqual(failures.slice(0, 20), [], `${failures.length} seeded-play failures`);
assert.ok(tested.breathSela > 0 && tested.breathTomas > 0, `seeded play never reached a Breath test: ${JSON.stringify(tested)}`);

console.log(`PASS sun-playerflow-promise-breath: Sela's petition and Tomas's mercy tested on Breath with path-aware exits; ` +
  `${ended}/${runs} seeded runs ended; Breath tests seen: Sela ${tested.breathSela}, Tomas ${tested.breathTomas}; ` +
  `no promise resolved in the act that killed its holder; no promise sentence rendered more than twice`);
