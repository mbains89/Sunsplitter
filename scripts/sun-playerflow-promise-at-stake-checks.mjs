// SUN-PROMISE-AT-STAKE-01 (decision 27a, Hex ticket 4) — where breaking a promise and killing its holder
// would be the same act, the promise is never resolved there; the living holder alludes to it instead.
//   crisis (the early vent): Amara and Sela, on the intercom from behind the bulkhead;
//   act3_lethal_tomas_cost: Tomas, in the annex variant and in the service-throat (pure Future) variant.
// Pins: 1. each line renders only while its holder is alive (and aboard) with that promise still "made";
//       2. no line quotes any of the six promise sentences (contract-class rule, MINTED_PHRASES.md:
//          a promise sentence renders only at its make and its break quote-back), checked as no shared
//          run of four or more words;
//       3. in seeded real play each line renders at most once per run, only on its own scene, and
//          crisis and act3_lethal_tomas_cost render at most once per run (so no one-shot flag is needed);
//       4. the lines write nothing: promise state and flags are unchanged by rendering.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LINES = {
  amara: { scene: "crisis", marker: "Both books are open at this page" },
  sela: { scene: "crisis", marker: "has found its nearest shape" },
  tomas_annex: { holder: "tomas", scene: "act3_lethal_tomas_cost", marker: "the annex sum again" },
  tomas_throat: { holder: "tomas", scene: "act3_lethal_tomas_cost", marker: "I said I'd hold the vault to that" }
};
const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };

const runtime = loadGame(ROOT);
const fixtures = runtime.evaluate(`(() => {
  persistSave = () => true;
  const LINES = ${JSON.stringify(LINES)};
  const paragraphs = () => document.getElementById("story").innerHTML.split(/<\\/p>/)
    .map(p => p.replace(/<[^>]+>/g, "").replace(/\\s+/g, " ").trim()).filter(Boolean);
  const seen = () => { const ps = paragraphs(); const out = {};
    for (const [key, line] of Object.entries(LINES)) { const p = ps.find(x => x.includes(line.marker)); if (p) out[key] = p; }
    return out; };
  const rows = [];
  const STATES = ["made", "declined", "kept", "broken", undefined];
  // crisis: Amara and Sela, alive or vented earlier, every promise state.
  for (const holder of ["amara", "sela"]) for (const value of STATES) for (const dead of [false, true]) {
    resetRunState();
    if (value !== undefined) state.promises[holder] = value;
    if (dead) kill(holder, "at-stake fixture");
    const before = JSON.stringify([state.promises, state.flags]);
    showScene("crisis");
    rows.push({ holder, key: holder, value: value || "unset", dead, scene: state.scene, seen: seen(),
      paragraphs: paragraphs(), wrote: JSON.stringify([state.promises, state.flags]) !== before });
  }
  // Tomas: annex variant and service-throat variant; recovered and alive, unrecovered, dead.
  const tomasSetups = {
    tomas_annex: () => { state.flags.stores = "vote"; },
    tomas_throat: () => { state.flags.vault_sacrifice = "future"; state.flags.tomas = "future"; }
  };
  for (const [key, setup] of Object.entries(tomasSetups)) for (const value of STATES) for (const aboard of ["alive", "unrecovered", "dead"]) {
    resetRunState();
    if (aboard !== "unrecovered") state.recovered.tomas = true;
    if (aboard === "dead") kill("tomas", "at-stake fixture");
    setup();
    if (value !== undefined) state.promises.tomas = value;
    const before = JSON.stringify([state.promises, state.flags]);
    showScene("act3_lethal_tomas_cost");
    rows.push({ holder: "tomas", key, value: value || "unset", dead: aboard !== "alive", aboard, scene: state.scene, seen: seen(),
      paragraphs: paragraphs(), wrote: JSON.stringify([state.promises, state.flags]) !== before });
  }
  // The six promise sentences, read from their make scenes (the choice that sets prom_<holder>), with
  // every holder aboard so the living-cast wrapper offers the real choices.
  const sentences = {};
  resetRunState();
  Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
  for (const holder of ["amara", "lena", "elias", "mira", "sela", "tomas"]) {
    const raw = scenes["prom_make_" + holder].choices;
    const list = typeof raw === "function" ? raw.call(scenes["prom_make_" + holder]) : raw;
    const made = list.find(c => c.flag && c.flag["prom_" + holder]);
    sentences[holder] = made ? made.text.replace(/^"|"$/g, "") : null;
  }
  return { rows, sentences };
})()`, 120_000);

for (const [holder, sentence] of Object.entries(fixtures.sentences)) expect(sentence && sentence.split(" ").length >= 6, `could not read ${holder}'s promise sentence: ${sentence}`);

const quoted = [];
for (const row of fixtures.rows) {
  const line = LINES[row.key];
  const want = row.value === "made" && !row.dead;
  const shown = Boolean(row.seen[row.key]);
  const label = `${row.key} promise=${row.value}${row.aboard ? " tomas=" + row.aboard : row.dead ? " holder dead" : ""}`;
  if (want) {
    expect(row.scene === line.scene, `${label}: ${line.scene} did not render (went to ${row.scene})`);
    expect(shown, `${label}: at-stake line missing on ${line.scene}`);
  } else {
    expect(!shown, `${label}: at-stake line rendered: ${row.seen[row.key]}`);
  }
  // A line from another key must never show in this fixture (the two Tomas variants are exclusive).
  for (const other of Object.keys(row.seen)) if (other !== row.key && LINES[other].scene === line.scene && LINES[other].holder === "tomas" && line.holder === "tomas") {
    expect(false, `${label}: the other Tomas variant's line rendered: ${row.seen[other]}`);
  }
  expect(!row.wrote, `${label}: rendering ${line.scene} changed promise or flag state`);
  if (row.key === "amara" || row.key === "sela") {
    const name = row.key === "amara" ? "Amara" : "Sela";
    const speaks = row.paragraphs.filter(p => p.startsWith(name + ","));
    expect(row.dead ? speaks.length === 0 : speaks.length <= 1, `${label}: ${name} speaks ${speaks.length} times on the crisis screen`);
    if (shown) {
      const i = row.paragraphs.indexOf(row.seen[row.key]);
      expect(i >= 0 && row.paragraphs[row.paragraphs.length - 1].startsWith("You have less than four minutes"), `${label}: crisis no longer ends on the four-minute line`);
    }
  }
  if (shown) quoted.push([row.key, row.seen[row.key]]);
}

// No line quotes a promise sentence: no shared run of four or more words with any of the six.
const words = text => text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]+/g, " ").split(/\s+/).filter(Boolean);
const grams = (list, n) => new Set(list.slice(0, list.length - n + 1).map((_, i) => list.slice(i, i + n).join(" ")));
const distinct = new Map(quoted.map(([key, text]) => [text, key]));
expect([...new Set(distinct.values())].sort().join() === Object.keys(LINES).sort().join(), `not every at-stake line was seen in the fixtures: ${[...distinct.values()]}`);
for (const [text, key] of distinct) {
  const lineGrams = grams(words(text), 4);
  for (const [holder, sentence] of Object.entries(fixtures.sentences)) {
    if (!sentence) continue;
    const shared = [...grams(words(sentence), 4)].filter(g => lineGrams.has(g));
    expect(shared.length === 0, `${key} line quotes ${holder}'s promise sentence ("${shared.join('", "')}"): ${text}`);
  }
  const count = words(text).length;
  expect(count >= 15 && count <= 32, `${key} line is ${count} words (keep it about 20-25): ${text}`);
}

// Seeded real play (runner pattern from sun-playerflow-no-repeat-lap-checks.mjs): fresh campaign,
// recovery only through its own scenes, Math.imul LCG, #choices cleared between screens.
const CHUNK = 20, CHUNKS = 2, MAX_STEPS = 700, SEED = 23;
const PICKERS = ["random", "cheapest"];
let lineRenders = 0, runs = 0;
for (const picker of PICKERS) {
  const game = loadGame(ROOT);
  for (let chunk = 0; chunk < CHUNKS; chunk++) {
    const chunkSeed = SEED * 1000 + PICKERS.indexOf(picker) * 100 + chunk;
    const results = JSON.parse(game.evaluate(`JSON.stringify((() => {
      persistSave = () => true;
      const choicesEl = document.getElementById("choices");
      if (!choicesEl.__clearsOnInnerHTML) {
        let html = choicesEl.innerHTML;
        Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html,
          set: value => { html = String(value); choicesEl.children.length = 0; } });
        choicesEl.__clearsOnInnerHTML = true;
      }
      const LINES = ${JSON.stringify(LINES)};
      if (!globalThis.__atStakeShowScene) globalThis.__atStakeShowScene = showScene;
      let log = null;
      showScene = function(id, opts) {
        const out = globalThis.__atStakeShowScene(id, opts);
        if (log && state.scene === id) {
          const text = document.getElementById("story").innerHTML.replace(/<[^>]+>/g, " ");
          const hits = Object.keys(LINES).filter(k => text.includes(LINES[k].marker))
            .map(k => { const who = LINES[k].holder || k; return { key: k, alive: isAlive(who), promise: state.promises[who] || null }; });
          log.push({ id, hits });
        }
        return out;
      };
      let seed = ${chunkSeed};
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      Math.random = rnd;
      const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
        (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
        (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
        (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
      const RESOURCES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
      const costCount = c => RESOURCES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
      const pick = list => {
        if (${JSON.stringify(picker)} === "cheapest") {
          const least = Math.min(...list.map(costCount));
          list = list.filter(c => costCount(c) === least);
        }
        return list[Math.floor(rnd() * list.length)];
      };
      const results = [];
      for (let r = 0; r < ${CHUNK}; r++) {
        log = [];
        resetRunState();
        showScene("wake");
        let outcome = "capped";
        for (let step = 0; step < ${MAX_STEPS}; step++) {
          const id = state.scene;
          if (id === "ending_check" || !scenes[id]) { outcome = "ended"; break; }
          const scene = scenes[id];
          const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
          if (!choices.length) { outcome = "stuck"; break; }
          try { makeChoice(pick(choices)); }
          catch (error) { outcome = "threw: " + id + ": " + String(error && error.message).slice(0, 80); break; }
        }
        results.push({ run: r, outcome, log });
        log = null;
      }
      return results;
    })())`, 600_000));
    for (const result of results) {
      runs++;
      const where = `${picker} chunk ${chunkSeed} run ${result.run}`;
      expect(result.outcome === "ended", `${where}: run did not end (${result.outcome})`);
      for (const id of ["crisis", "act3_lethal_tomas_cost"]) {
        const n = result.log.filter(e => e.id === id).length;
        expect(n <= 1, `${where}: ${id} rendered ${n} times`);
      }
      const perLine = {};
      for (const entry of result.log) for (const hit of entry.hits) {
        lineRenders++;
        perLine[hit.key] = (perLine[hit.key] || 0) + 1;
        expect(entry.id === LINES[hit.key].scene, `${where}: ${hit.key} line rendered on ${entry.id}`);
        expect(hit.alive && hit.promise === "made", `${where}: ${hit.key} line rendered with holder alive=${hit.alive} promise=${hit.promise}`);
      }
      for (const [key, n] of Object.entries(perLine)) expect(n <= 1, `${where}: ${key} line rendered ${n} times in one run`);
    }
  }
}
expect(lineRenders > 0, `no at-stake line rendered in ${runs} seeded runs; the real-play sample is vacuous`);

if (failures.length) {
  for (const failure of failures) console.error("FAIL " + failure);
  process.exit(1);
}
console.log(`PASS sun-playerflow-promise-at-stake: Amara's and Sela's crisis lines and Tomas's two lethal lines render only while the holder is alive with the promise made, write nothing, quote no promise sentence; ${runs} seeded runs show ${lineRenders} at-stake lines, each at most once per run, and crisis and act3_lethal_tomas_cost at most once per run`);
