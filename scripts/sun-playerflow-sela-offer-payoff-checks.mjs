// SUN-SELA-OFFER-PAYOFF-01 — Sela's private custody offer pays off or is closed.
// In prom_price_keep a partner Sela tells the Commander, apart from the room, that she will offer
// shared custody of what she keeps when the heat question is answered (in her culture's terms, a
// marriage). custody_shared pays that off. A possession, thaw or severed answer now closes it in
// custody_after with one line in her voice. No new state: "heard the offer" is romance.sela plus
// promises.sela === "kept", which only prom_price_keep writes, and nothing between prom_price_keep
// and custody_after writes romance. This file pins that inference statically and checks, in targeted
// renders driven through the real scenes and in seeded real play from a fresh campaign, that
// (1) a partner who heard the offer gets the line exactly once on each non-shared answer and never on
// shared, (2) a non-partner never gets it, (3) a dead Sela never gets it, and (4) it writes nothing.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LEAD = "Before the log closes, Sela speaks to you alone.";
const CLOSE = "The heat question is answered, and the vault still has one key. I will not make the offer, and I am telling you so that you do not wait for it.";
const OFFER = "I will offer you shared custody of what I keep. I did not say that to them.";
const NON_SHARED = ["possession", "thawed", "severed"];
const count = (hay, needle) => hay.split(needle).length - 1;

// Static: the inference holds only while prom_price_keep is the one writer of a kept Sela promise,
// romance_sela_1 the one writer of romance.sela, and no computed key writes either map.
const writers = { kept: [], romance: [], computed: [] };
for (const file of readdirSync(resolve(ROOT, "src")).filter(f => f.endsWith(".js")).sort()) {
  let scene = null;
  for (const [i, line] of readFileSync(resolve(ROOT, "src", file), "utf8").split("\n").entries()) {
    const head = line.match(/^ {2,4}([a-z0-9_]+)\s*:\s*\{/);
    if (head) scene = head[1];
    const code = line.replace(/\/\/.*$/, "");
    if (/promises(?:\.sela|\[["'`]sela["'`]\])\s*=(?!=)\s*["'`]kept/.test(code)) writers.kept.push(`${file}:${scene}`);
    if (/romance(?:\.sela|\[["'`]sela["'`]\])\s*=(?!=)/.test(code)) writers.romance.push(`${file}:${scene}`);
    if (/(?:promises|romance)\[(?!["'`])[^\]]+\]\s*=(?!=)/.test(code)) writers.computed.push(`${file}:${i + 1}`);
  }
}
assert.deepEqual(writers.kept, ["scenes-47.js:prom_price_keep"], `static: promises.sela "kept" writers changed (${writers.kept.join(", ")}); the heard-the-offer inference in custody_after needs review`);
assert.deepEqual(writers.romance, ["scenes-30.js:romance_sela_1"], `static: romance.sela writers changed (${writers.romance.join(", ")}); the heard-the-offer inference in custody_after needs review`);
assert.deepEqual(writers.computed, [], `static: a computed key writes promises or romance (${writers.computed.join(", ")}); prove it is never Sela`);

const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  const story = () => document.getElementById("story").innerHTML;
  const choicesOf = id => { const s = scenes[id]; return (typeof s.choices === "function" ? s.choices() : s.choices) || []; };
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const snap = () => JSON.stringify({ f: state.flags, p: state.promises, r: state.romance, d: state.dead, m: state.memories,
    res: [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos], ideology: state.ideology });
  const row = {};

  // Static exits: prom_price_keep reaches custody_after only through the hub and the four answers.
  row.exits = {};
  for (const id of ["prom_price_keep", "custody_hub", "custody_possession", "custody_thaw", "custody_severed", "custody_shared"]) {
    resetRunState(); state.promises.sela = "made"; state.integrity = 70; state.cohesion = 40; state.supplies = 40; state.embryos = 60;
    row.exits[id] = [...new Set(choicesOf(id).map(c => c.next))].sort();
  }

  // Targeted renders driven through custody_onset > prom_price > keep|break > custody_hub > answer.
  const ANSWERS = { possession_treat: ["custody_possession", "Treat"], possession_seal: ["custody_possession", "Seal"], thawed: ["custody_thaw"], severed: ["custody_severed"], shared: ["custody_shared"] };
  const drive = ({ partner, promise, test, answer, selaDead }) => {
    resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.integrity = 70; state.cohesion = 40; state.supplies = 40; state.embryos = 60;
    if (partner) state.romance.sela = true;
    if (promise) state.promises.sela = promise;
    if (selaDead) kill("sela", "fixture death before the custody test");
    const screens = [];
    const seen = () => screens.push({ id: state.scene, text: story() });
    showScene("custody_onset"); seen();
    makeChoice(choicesOf("custody_onset")[0]); seen();
    if (state.scene === "prom_price") {
      makeChoice(choicesOf("prom_price").find(c => c.next === (test === "break" ? "prom_price_break" : "prom_price_keep"))); seen();
      makeChoice(choicesOf(state.scene)[0]); seen();
    }
    if (state.scene !== "custody_hub") return { error: "did not reach custody_hub: " + state.scene };
    const [target, sub] = ANSWERS[answer];
    const pick = choicesOf("custody_hub").filter(enabled).find(c => c.next === target);
    if (!pick) return { offered: false, screens };
    makeChoice(pick); seen();
    const next = choicesOf(state.scene).filter(enabled).find(c => !sub || c.text.startsWith(sub));
    makeChoice(next); seen();
    // The line is text only: re-running custody_after's entry and text getter writes nothing here
    // (no fixture makes a Tomas promise, the one thing its entry resolves).
    const before = snap();
    scenes.custody_after.onEnter(); scenes.custody_after.text();
    const entryDelta = before !== snap();
    return { offered: true, scene: state.scene, screens, entryDelta, choices: choicesOf("custody_after").map(c => c.text + ">" + c.next),
      promise: state.promises.sela || null, partner: !!state.romance.sela, alive: isAlive("sela") };
  };
  row.targeted = [];
  for (const partner of [true, false]) for (const [promise, test] of [["made", "keep"], ["made", "break"], ["declined", null], [null, null]])
    for (const answer of Object.keys(ANSWERS)) for (const selaDead of [false, true])
      row.targeted.push({ partner, promise, test, answer, selaDead, r: drive({ partner, promise, test, answer, selaDead }) });

  // Legacy or imported snapshot: a dead Sela with the offer state already on record.
  row.legacy = [];
  for (const answer of ["possession", "thawed", "severed", "shared"]) for (const selaDead of [false, true]) {
    resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.crisisPath = "custody"; state.flags.custody_answer = answer; state.flags.custody_roll = true;
    state.romance.sela = true; state.promises.sela = "kept";
    if (selaDead) kill("sela", "legacy death after the petition");
    const before = snap();
    showScene("custody_after", { skipOnEnter: true, resume: true });
    row.legacy.push({ answer, selaDead, text: story(), wrote: before !== snap() });
  }
  return row;
})())`, 180_000));

// Static exits.
assert.deepEqual(out.exits.prom_price_keep, ["custody_hub"], "prom_price_keep exits changed");
assert.deepEqual(out.exits.custody_hub, ["custody_possession", "custody_severed", "custody_shared", "custody_thaw"], "custody_hub exits changed");
for (const id of ["custody_possession", "custody_thaw", "custody_severed", "custody_shared"]) assert.deepEqual(out.exits[id], ["custody_after"], `${id} exits changed`);

// Targeted renders.
const afterChoices = new Set();
let lines = 0;
for (const t of out.targeted) {
  const label = `${t.partner ? "partner" : "non-partner"} promise=${t.promise}${t.test ? "/" + t.test : ""} ${t.answer}${t.selaDead ? " (Sela dead)" : ""}`;
  assert.ok(!t.r.error, `${label}: ${t.r.error}`);
  const shared = t.answer === "shared";
  if (!t.r.offered) {
    assert.ok(shared && (t.selaDead || t.test === "break"), `${label}: the answer was not offered`);
    continue;
  }
  assert.equal(t.r.scene, "custody_after", `${label}: did not reach custody_after`);
  const keep = t.r.screens.find(s => s.id === "prom_price_keep");
  const heard = !!keep && keep.text.includes(OFFER);
  if (t.partner && t.test === "keep" && !t.selaDead) assert.ok(heard, `${label}: the partner did not hear the offer in prom_price_keep`);
  if (keep && !t.partner) assert.ok(!keep.text.includes("shared custody"), `${label}: a non-partner heard the custody offer (#589 gates it to partners)`);
  const expected = heard && !t.selaDead && NON_SHARED.includes(t.answer.split("_")[0]) ? 1 : 0;
  for (const s of t.r.screens) {
    const n = count(s.text, CLOSE), m = count(s.text, LEAD);
    if (s.id === "custody_after") {
      assert.equal(n, expected, `${label}: custody_after carries the closing line ${n} times, expected ${expected}`);
      assert.equal(m, expected, `${label}: custody_after carries the lead-in ${m} times, expected ${expected}`);
      if (n) assert.ok(s.text.indexOf(CLOSE) < s.text.indexOf("The ship has a path again."), `${label}: the line should come before the closing sentence`);
    } else {
      assert.equal(n + m, 0, `${label}: the closing line renders on ${s.id}`);
    }
  }
  lines += expected;
  assert.equal(t.r.entryDelta, false, `${label}: custody_after entry wrote state`);
  afterChoices.add(JSON.stringify(t.r.choices));
}
assert.equal(lines, 4, `targeted: expected four closing lines (treat, seal, thaw, sever), saw ${lines}`);
assert.equal(afterChoices.size, 1, "custody_after choices differ with the line");

// Legacy snapshot renders.
for (const l of out.legacy) {
  const expected = !l.selaDead && l.answer !== "shared" ? 1 : 0;
  assert.equal(count(l.text, CLOSE), expected, `legacy ${l.answer}${l.selaDead ? " (Sela dead)" : ""}: closing line count`);
  assert.equal(l.wrote, false, `legacy ${l.answer}: render wrote state`);
}

// Seeded real play from a fresh campaign (no-repeat-lap runner pattern): Tomas, Jiro and Vess are
// recovered only by their own scenes. A light steer makes the rare intersection common: plans 0-3 seek
// a Sela partnership, keep the promise and take one answer each; plan 4 keeps the promise without a
// partnership; plan 5 breaks it; plan 6 is uniform random play, vent and all.
const RUNS = 210;
const play = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  let seed = 7411;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const story = () => document.getElementById("story").innerHTML;
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const HUB = ["custody_possession", "custody_thaw", "custody_severed", "custody_shared"];
  const rows = [];
  for (let r = 0; r < ${RUNS}; r++) {
    const plan = r % 7;
    const steer = plan < 6, partner = plan < 4 || plan === 5;
    const prefer = new Set(["custody_onset", "quiet_sela", "prom_make_sela", "prom_r_sela", plan === 5 ? "prom_price_break" : "prom_price_keep"]);
    if (partner) { prefer.add("bond_sela"); prefer.add("romance_sela_1"); }
    const hubPick = plan < 4 ? HUB[plan] : HUB[Math.floor(r / 7) % 3];
    resetRunState(); showScene("wake");
    const seenAt = [];
    let ended = false, heard = null, answerAtAfter = null, aliveAtAfter = null, partnerAtAfter = null;
    for (let step = 0; step < 700; step++) {
      const id = state.scene, text = story();
      if (text.includes(${JSON.stringify(CLOSE)}) || text.includes(${JSON.stringify(LEAD)})) seenAt.push(id + ":" + (text.split(${JSON.stringify(CLOSE)}).length - 1));
      if (id === "prom_price_keep") heard = text.includes(${JSON.stringify(OFFER)});
      if (id === "custody_after") { answerAtAfter = state.flags.custody_answer || null; aliveAtAfter = isAlive("sela"); partnerAtAfter = !!state.romance.sela; }
      if (id === "ending_check" || !scenes[id]) { ended = true; break; }
      const sc = scenes[id];
      let list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
      if (!list.length) break;
      let choice;
      if (steer) {
        const kept = list.filter(c => c.next !== "vent" && (partner || c.next !== "romance_sela_1"));
        if (kept.length) list = kept;
        const hub = id === "custody_hub" && list.find(c => c.next === hubPick);
        const pref = list.filter(c => prefer.has(c.next) && (c.next !== "prom_r_sela" || (c.flag && c.flag.prom_sela)));
        const future = list.filter(c => c.lean && c.lean.future > 0);
        const pool = hub ? [hub] : pref.length && rnd() < 0.9 ? pref : future.length && rnd() < 0.6 ? future : list;
        choice = pool[Math.floor(rnd() * pool.length)];
      } else choice = list[Math.floor(rnd() * list.length)];
      makeChoice(choice);
    }
    rows.push({ plan, ended, heard, seenAt, answerAtAfter, aliveAtAfter, partnerAtAfter, promise: state.promises.sela || null, selaDead: state.dead.includes("sela") });
  }
  return rows;
})())`, 600_000));

assert.equal(play.length, RUNS);
const tally = { closed: {}, shared: 0, nonPartner: 0, broken: 0, dead: 0 };
for (const [i, r] of play.entries()) {
  const label = `play ${i} (plan ${r.plan}, seed 7411)`;
  assert.ok(r.ended, `${label}: run did not end`);
  const expected = r.heard === true && r.aliveAtAfter === true && NON_SHARED.includes(r.answerAtAfter) ? 1 : 0;
  if (expected) {
    assert.deepEqual(r.seenAt, ["custody_after:1"], `${label}: a partner who heard the offer and answered ${r.answerAtAfter} should see the closing line once at custody_after: ${r.seenAt}`);
    tally.closed[r.answerAtAfter] = (tally.closed[r.answerAtAfter] || 0) + 1;
  } else {
    assert.deepEqual(r.seenAt, [], `${label}: the closing line rendered off its gate (heard ${r.heard}, answer ${r.answerAtAfter}, partner ${r.partnerAtAfter}, alive ${r.aliveAtAfter}): ${r.seenAt}`);
    if (r.heard && r.answerAtAfter === "shared") tally.shared++;
    if (r.answerAtAfter && !r.partnerAtAfter) tally.nonPartner++;
    if (r.promise === "broken" && r.answerAtAfter) tally.broken++;
    if (r.selaDead) tally.dead++;
  }
  if (r.heard) assert.ok(r.promise === "kept" && r.partnerAtAfter !== false, `${label}: heard the offer without a kept promise or a partnership`);
}
for (const answer of NON_SHARED) assert.ok((tally.closed[answer] || 0) >= 3, `play: too few closed-offer runs on ${answer} (${tally.closed[answer] || 0}); widen the steer`);
assert.ok(tally.shared >= 3 && tally.nonPartner >= 3 && tally.broken >= 3 && tally.dead >= 3, `play: thin coverage ${JSON.stringify(tally)}`);
console.log(`PASS sun-playerflow-sela-offer-payoff: the private custody offer closes once in custody_after on possession, thaw and severed and stays paid on shared; non-partners, broken promises and dead Sela never see it; no writes; ${out.targeted.length} targeted routes, ${RUNS} seeded runs (closed ${JSON.stringify(tally.closed)}, heard+shared ${tally.shared}, non-partner custody ${tally.nonPartner}, broken ${tally.broken}, Sela dead ${tally.dead})`);
