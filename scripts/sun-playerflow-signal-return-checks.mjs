// SUN-SIGNAL-RETURN-01 — hearing Elias out first does not skip the signal decision.
// At `transmission` the choice "Before the signal — hear Elias out on the ground-side file." leads to
// history_elias, prom_make_elias and prom_r_elias. Those used to exit to vault_voice, so a player who
// took the detour never chose on the signal and flags.signal stayed unset for the rest of the run.
// The detour now comes back to `transmission` while flags.signal is unset. The return is read from
// past_known_by.elias, which only history_elias writes; it prints one short line instead of the
// briefing and offers the first visit's signal choices less the detour. Checks, through the real engine:
//   1. scripted detour, every history_elias answer x every prom_make_elias answer: the run comes back
//      to `transmission` with the return line, no briefing, flags.signal unset, and the first visit's
//      choices (labels, exits, effects, requirements, order) less only the detour; each signal choice
//      then sets its flag and leaves for vault_voice;
//   2. the detour scenes' absent-Elias exits and prom_make_elias's spent-promise redirect go back to
//      `transmission` while the signal is unmade, and to vault_voice once it is made;
//   3. saves written by the engine on history_elias, prom_make_elias, prom_r_elias and the returned
//      `transmission` (marked and legacy, i.e. without sceneEntered) resume through Continue into a
//      fresh runtime and reach the signal decision, and the returned screen resumes as the live screen;
//   4. seeded real play (runner pattern from sun-playerflow-no-repeat-lap-checks.mjs, uniform random
//      picker): every run that visits `transmission` has flags.signal set when it first enters
//      vault_voice, `transmission` is visited at most twice and the second visit follows prom_r_elias.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RETURN_LINE = "The signal is still repeating on the board when you get back: the same degraded string, the same coordinates that match nothing. No one has logged an order on it.";
const DETOUR_LABEL = "Before the signal — hear Elias out on the ground-side file.";
const BRIEFING = ["There is a signal. Faint. Repeating.", "A repeating carrier wave surfaces on the passive array."];
const SIGNALS = { chase: "Change course enough to investigate.", ignore: "Log it and hold course.", study: "Have Mira try to decode more" };
const DETOUR = ["history_elias", "prom_make_elias", "prom_r_elias"];
const RUNS = 400;
const CHUNK = 20;
const RELOAD_EVERY = 5;
const MAX_STEPS = 700;
const SEED = 3011;
const CREW_NAMES = ["Lena", "Elias", "Mira", "Tomas", "Amara", "Jiro", "Sela", "Vess", "Rourke"];

if (!RETURN_LINE.length || CREW_NAMES.some(name => RETURN_LINE.includes(name))) throw new Error("the return line must name no one");

// The writer keeps the engine's persistSave for the saves it takes and stubs the per-choice autosave.
const PRELUDE = `
  if (!globalThis.__realPersistSave) globalThis.__realPersistSave = persistSave;
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html,
      set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  const story = () => document.getElementById("story").innerHTML;
  const listOf = id => { const sc = scenes[id]; return (typeof sc.choices === "function" ? sc.choices() : sc.choices) || []; };
  const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
    (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
    (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const screen = () => ({ scene: state.scene, story: story(), signal: state.flags.signal || null,
    labels: choicesEl.children.map(b => b.__ssChoiceLabelHtml || b.innerHTML),
    choices: JSON.parse(JSON.stringify(listOf(state.scene))) });
  const save = legacy => {
    localStorage.clear();
    if (globalThis.__realPersistSave({ silent: true }) !== true) throw new Error("persistSave failed at " + state.scene);
    const raw = localStorage.getItem(SAVE_KEY);
    if (!legacy) return raw;
    const data = JSON.parse(raw); delete data.sceneEntered; return JSON.stringify(data);
  };
  // A campaign at the signal decision: the early walk has run, Elias and Mira are alive and trusted.
  const atTransmission = () => {
    resetRunState();
    state.past_known = true;
    state.flags.past = "owned";
    showScene("transmission");
  };
`;
const stripReplies = html => html.replace(/<p class="choice-reply">[\s\S]*?<\/p>/g, "");

const runtime = loadGame(ROOT);
const failures = [];
// Each section reports its first failed assertion and the check goes on, so the seeded count below
// prints even when a scripted section fails.
function section(name, body) {
  try { body(); } catch (error) { failures.push(`${name}: ${error && error.message ? error.message.split("\n")[0] : error}`); }
}

// 1. Scripted detour through every answer pair.
section("scripted detour", () => {
const scripted = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const out = [];
  for (let h = 0; h < 3; h++) for (let p = 0; p < 2; p++) {
    atTransmission();
    const first = screen();
    const detour = listOf("transmission").find(c => c.next === "history_elias");
    makeChoice(detour);
    const path = [state.scene];
    makeChoice(listOf("history_elias").filter(enabled)[h]); path.push(state.scene);
    makeChoice(listOf("prom_make_elias").filter(enabled)[p]); path.push(state.scene);
    makeChoice(listOf("prom_r_elias").filter(enabled)[0]); path.push(state.scene);
    const back = screen();
    const picks = {};
    const snapshot = JSON.stringify(state);
    for (const c of listOf("transmission").filter(enabled)) {
      const restore = JSON.parse(snapshot);
      for (const k of Object.keys(restore)) state[k] = restore[k];
      showScene("transmission");
      makeChoice(c);
      picks[c.text] = { scene: state.scene, signal: state.flags.signal || null };
    }
    out.push({ h, p, first, path, back, picks });
  }
  return out;
})())`));

const firstBriefing = scripted[0].first;
assert.ok(BRIEFING.some(line => firstBriefing.story.includes(line)), "first visit prints the signal briefing");
assert.ok(!firstBriefing.story.includes(RETURN_LINE), "first visit must not print the return line");
assert.equal(firstBriefing.choices.filter(c => c.next === "history_elias").length, 1, "first visit offers the Elias detour once");
assert.ok(firstBriefing.labels.some(label => label.includes(DETOUR_LABEL)), "first visit renders the detour button");
for (const row of scripted) {
  const where = `history_elias answer ${row.h + 1}, prom_make_elias answer ${row.p + 1}`;
  assert.deepEqual(row.path, ["history_elias", "prom_make_elias", "prom_r_elias", "transmission"], `${where}: detour must return to transmission (${row.path.join(" > ")})`);
  assert.equal(row.back.signal, null, `${where}: the signal is still unmade on return`);
  assert.ok(stripReplies(row.back.story).includes(RETURN_LINE), `${where}: return prints the return line`);
  for (const line of BRIEFING) assert.ok(!row.back.story.includes(line), `${where}: return must not repeat the briefing (${line})`);
  assert.deepEqual(row.back.choices, row.first.choices.filter(c => c.next !== "history_elias"),
    `${where}: return offers the first visit's choices less the detour`);
  assert.deepEqual(row.back.labels, row.first.labels.filter(label => !label.includes(DETOUR_LABEL)),
    `${where}: return renders the first visit's buttons less the detour`);
  for (const [value, start] of Object.entries(SIGNALS)) {
    const pick = Object.entries(row.picks).find(([text]) => text.startsWith(start));
    assert.ok(pick, `${where}: the return offers the ${value} choice`);
    assert.deepEqual(pick[1], { scene: "vault_voice", signal: value }, `${where}: ${value} sets the signal and leaves for vault_voice`);
  }
}

});

// 2. Absent-Elias exits and the spent-promise redirect.
section("absent-Elias and spent-promise exits", () => {
const exits = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const out = {};
  for (const signal of [null, "ignore"]) {
    for (const id of ${JSON.stringify(DETOUR)}) {
      atTransmission();
      state.past_known_by.elias = true;
      if (signal) state.flags.signal = signal;
      kill("elias", "signal-return fixture");
      out[id + ":" + signal] = { exit: livingCastExit(id), entered: (showScene(id), state.scene) };
    }
    atTransmission();
    state.past_known_by.elias = true;
    state.promises.elias = "made";
    if (signal) state.flags.signal = signal;
    showScene("prom_make_elias");
    out["spent:" + signal] = { entered: state.scene };
  }
  return out;
})())`));
for (const id of DETOUR) {
  assert.deepEqual(exits[id + ":null"], { exit: "transmission", entered: "transmission" }, `${id}: absent-Elias exit returns to the unmade signal decision`);
  assert.deepEqual(exits[id + ":ignore"], { exit: "vault_voice", entered: "vault_voice" }, `${id}: absent-Elias exit goes on once the signal is made`);
}
assert.equal(exits["spent:null"].entered, "transmission", "a spent Elias promise returns to the unmade signal decision");
assert.equal(exits["spent:ignore"].entered, "vault_voice", "a spent Elias promise goes on once the signal is made");

});

// 3. Save and resume mid-detour.
function resume(raw) {
  const reader = loadGame(ROOT, { includeValidator: false });
  return JSON.parse(reader.evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, ${JSON.stringify(raw)});
    const ok = resumeGame();
    const resumed = screen();
    const walked = [state.scene];
    for (let i = 0; i < 6 && state.scene !== "transmission"; i++) {
      makeChoice(listOf(state.scene).filter(enabled)[0]);
      walked.push(state.scene);
    }
    return { ok, resumed, walked, back: screen() };
  })())`));
}
let parked = [];
section("mid-detour save and resume", () => {
parked = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const out = [];
  for (const legacy of [false, true]) {
    atTransmission();
    makeChoice(listOf("transmission").find(c => c.next === "history_elias"));
    for (const id of ${JSON.stringify([...DETOUR, "transmission"])}) {
      if (state.scene !== id) throw new Error("expected " + id + ", at " + state.scene);
      out.push({ id, legacy, raw: save(legacy), live: screen() });
      if (id !== "transmission") makeChoice(listOf(id).filter(enabled)[0]);
    }
  }
  return out;
})())`));
for (const { id, legacy, raw, live } of parked) {
  const where = `${legacy ? "legacy" : "marked"} save on ${id}`;
  const back = resume(raw);
  assert.ok(back.ok, `${where}: Continue loads the save`);
  assert.equal(back.resumed.scene, id, `${where}: Continue resumes on the parked screen`);
  assert.equal(back.resumed.story, stripReplies(live.story), `${where}: Continue shows the live screen`);
  assert.equal(back.walked.at(-1), "transmission", `${where}: the detour leads back to the signal decision (${back.walked.join(" > ")})`);
  assert.equal(back.back.signal, null, `${where}: the signal is still unmade on return`);
  assert.ok(back.back.story.includes(RETURN_LINE), `${where}: the resumed return prints the return line`);
  assert.deepEqual(back.back.choices.map(c => c.next), ["vault_voice", "vault_voice", "vault_voice"], `${where}: the resumed return offers the three signal choices`);
}

});

// 4. Seeded real play.
const totals = { runs: 0, visited: 0, detours: 0, decided: 0 };
let player = null;
for (let chunk = 0; chunk * CHUNK < RUNS; chunk++) {
  if (chunk % RELOAD_EVERY === 0) player = loadGame(ROOT);
  const runs = Math.min(CHUNK, RUNS - chunk * CHUNK);
  const chunkSeed = SEED * 1000 + chunk;
  const out = JSON.parse(player.evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    let seed = ${chunkSeed};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const rows = [];
    for (let r = 0; r < ${runs}; r++) {
      const runSeed = seed;
      resetRunState();
      showScene("wake");
      const path = [];
      let signalAtVault = undefined, outcome = "capped", detour = false;
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        path.push(id);
        if (id === "vault_voice" && signalAtVault === undefined) signalAtVault = state.flags.signal || null;
        if (id === "ending_check" || !scenes[id]) { outcome = "ended"; break; }
        const list = listOf(id).filter(enabled);
        if (!list.length) { outcome = "stuck"; break; }
        const c = list[Math.floor(rnd() * list.length)];
        if (id === "transmission" && c.next === "history_elias") detour = true;
        try { makeChoice(c); } catch (error) { outcome = "threw: " + String(error && error.message).slice(0, 100); break; }
      }
      const visits = path.reduce((at, id, i) => (id === "transmission" && at.push(i), at), []);
      rows.push({ r, runSeed, outcome, detour, visits: visits.length,
        secondAfter: visits.length > 1 ? path[visits[1] - 1] : null,
        signalAtVault: signalAtVault === undefined ? "never" : signalAtVault,
        tail: visits.length ? path.slice(visits[0], visits[0] + 7).join(" > ") : "" });
    }
    return rows;
  })())`, 600_000));
  for (const row of out) {
    totals.runs++;
    const where = `chunk seed ${chunkSeed}, run ${row.r} (run-start LCG seed ${row.runSeed})`;
    if (row.outcome !== "ended") failures.push(`${where}: run did not end (${row.outcome})`);
    if (!row.visits) continue;
    totals.visited++;
    if (row.detour) totals.detours++;
    if (row.signalAtVault && row.signalAtVault !== "never") totals.decided++;
    else failures.push(`${where}: left the signal decision with no signal choice (${row.tail}; signal at vault_voice ${row.signalAtVault})`);
    if (row.visits > 2) failures.push(`${where}: transmission visited ${row.visits} times`);
    if (row.visits === 2 && row.secondAfter !== "prom_r_elias") failures.push(`${where}: second transmission visit followed ${row.secondAfter}, not prom_r_elias`);
  }
}
const summary = `${totals.runs} seeded random runs: ${totals.visited} visited transmission, ${totals.detours} took the Elias detour, ${totals.decided} made a signal choice before vault_voice`;
if (!totals.detours) failures.push("the seeded sample took no Elias detour; the check proves nothing");
if (failures.length) {
  console.error(`FAIL sun-playerflow-signal-return: ${summary}\n  ${failures.slice(0, 12).join("\n  ")}${failures.length > 12 ? `\n  ... ${failures.length - 12} more` : ""}`);
  process.exitCode = 1;
} else {
  console.log(`PASS sun-playerflow-signal-return: scripted detour (6 answer pairs), absent-Elias and spent-promise exits, ${parked.length} mid-detour saves resumed; ${summary}`);
}
