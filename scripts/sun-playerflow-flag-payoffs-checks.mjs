// SUN-FLAG-PAYOFFS-01 — three setups the game wrote and never read now pay off in text:
// embryo_ceiling (arc_future_2) in vault_sacrifice's pre-choice narration; lena_notes (offshift_lena)
// in Lena's What Remains paragraph, alive and dead; vault_face_read (act3_vault_face_read) in Sela's
// paragraph, or Elias's when Sela is dead. Every line is played through the scene that writes its
// flag, renders only with that flag, and stays honest for the dead. No state records who sat at the
// manifest terminal, so crewEpilogues infers it from whether Sela is dead; that holds only while
// Sela's one death site (vent) comes before the vault face, which this file pins statically and in
// seeded real play. The retired vault_face flag is no longer written.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EMBRYO = "The vault comes into this fault already bleeding. The lower ceiling you accepted is still on the board, unrecovered, and whatever this choice costs comes off the lower number.";
const LENA_ALIVE = " Her succession notes are in your keeping, in her handwriting; the thinner folder still says no last dose, the last hour awake.";
const LENA_DEAD = " Her succession notes were in your keeping, in her handwriting, in the order the next person would need them.";
const SELA = " One line of the vault manifest was said in your voice beside her, E-6104, name field empty; she did not ask for the next.";
const ELIAS_ALIVE = " His manifest count has a second column, one entry long, in your name.";
const ELIAS_DEAD = " His manifest count had a second column, one entry long, in your name.";
const ORDER = ["rourke", "lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
const at = k => ORDER.indexOf(k);
const count = (hay, needle) => hay.split(needle).length - 1;

const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; kill("rourke", "died with company"); };
  const story = () => document.getElementById("story").innerHTML;
  const choicesOf = id => { const s = scenes[id]; return (typeof s.choices === "function" ? s.choices() : s.choices) || []; };
  const row = {};

  // embryo_ceiling, written by either arc_future_2 route, read in vault_sacrifice before the choice only.
  row.embryo = [];
  for (const route of ["refuse", "no_parts"]) for (const miraDead of [false, true]) {
    fresh(); if (miraDead) kill("mira", "finished the repair");
    if (route === "no_parts") { state.embryos = 40; state.supplies = 1; }
    showScene("arc_future_2");
    const pick = choicesOf("arc_future_2").find(c => c.flag && c.flag.embryo_ceiling && (route === "refuse" ? c.text.startsWith("Refuse") : c.text.startsWith("There are no parts")));
    if (pick) makeChoice(pick);
    state.supplies = 61; state.embryos = Math.max(state.embryos, 60);
    const flag = state.flags.embryo_ceiling;
    showScene("vault_sacrifice");
    const before = story();
    const choice = choicesOf("vault_sacrifice").find(c => c.flag && c.flag.vault_sacrifice);
    makeChoice(choice);
    showScene("vault_sacrifice");
    row.embryo.push({ route, miraDead, picked: !!pick, flag, before, after: story() });
  }
  fresh(); showScene("vault_sacrifice"); row.embryoUnset = story();

  // lena_notes, written on entry to offshift_lena.
  const lena = (setup, notes) => { fresh(); if (notes) showScene("offshift_lena"); const flag = state.flags.lena_notes; setup(); return { flag, paragraphs: crewEpilogues() }; };
  row.lena = {
    alive: lena(() => {}, true),
    dying: lena(() => { state.dying.lena = "kept working until the clock ran out"; }, true),
    deadClock: lena(() => kill("lena", "kept working until the clock ran out"), true),
    deadVault: lena(() => kill("lena", "resources diverted to the vault"), true),
    unset: lena(() => {}, false)
  };

  // vault_face_read, written on entry to act3_vault_face_read through "Read the next one."
  const vault = (pre, post) => { fresh(); pre(); showScene("act3_vault_face"); const read = choicesOf("act3_vault_face").find(c => c.next === "act3_vault_face_read");
    const faceText = story(); if (read) makeChoice(read); const readText = story(); const flags = { read: state.flags.vault_face_read, face: state.flags.vault_face }; post();
    return { offered: !!read, faceText, readText, flags, paragraphs: crewEpilogues() }; };
  row.vault = {
    both: vault(() => {}, () => {}),
    selaOnly: vault(() => kill("elias", "held the line"), () => {}),
    eliasOnly: vault(() => kill("sela", "vented at twenty"), () => {}),
    eliasLater: vault(() => kill("sela", "vented at twenty"), () => kill("elias", "held the line")),
    neither: vault(() => { kill("sela", "vented at twenty"); kill("elias", "held the line"); }, () => {})
  };
  fresh(); showScene("act3_vault_face"); row.vaultLeft = { flags: { read: state.flags.vault_face_read, face: state.flags.vault_face }, paragraphs: crewEpilogues() };
  return row;
})())`, 180_000));

// embryo_ceiling
assert.equal(out.embryo.length, 4);
for (const c of out.embryo) {
  const label = `embryo ${c.route}${c.miraDead ? " (Mira dead)" : ""}`;
  assert.ok(c.picked && c.flag === "lowered", `${label}: arc_future_2 did not write embryo_ceiling`);
  assert.equal(count(c.before, EMBRYO), 1, `${label}: the pre-choice text should carry the lower-ceiling line once`);
  assert.ok(c.before.indexOf("full vault divert.") < c.before.indexOf(EMBRYO), `${label}: the line should follow the irreversible-damage sentence`);
  assert.ok(!c.after.includes(EMBRYO), `${label}: the post-choice text repeats the line`);
  if (c.miraDead) assert.ok(!c.before.includes("Mira"), `${label}: the dead are named`);
}
assert.ok(!out.embryoUnset.includes("already bleeding"), "embryo: line renders without embryo_ceiling");

// lena_notes
const L = out.lena;
for (const k of ["alive", "dying", "deadClock", "deadVault"]) assert.equal(L[k].flag, true, `lena ${k}: offshift_lena did not write lena_notes`);
for (const k of ["alive", "dying"]) {
  const p = L[k].paragraphs[at("lena")];
  assert.equal(count(p, LENA_ALIVE), 1, `lena ${k}: alive line missing: ${p}`);
  assert.ok(!p.includes(LENA_DEAD), `lena ${k}: dead line for a living Lena`);
  assert.ok(p.indexOf(LENA_ALIVE) < p.indexOf("Rourke's chart") || !p.includes("Rourke's chart"), `lena ${k}: line should sit before the Rourke clause`);
}
for (const k of ["deadClock", "deadVault"]) {
  const p = L[k].paragraphs[at("lena")];
  assert.equal(count(p, LENA_DEAD), 1, `lena ${k}: dead line missing: ${p}`);
  assert.ok(!p.includes(LENA_ALIVE) && !/still says|are in your keeping/.test(p), `lena ${k}: present tense for the dead: ${p}`);
}
assert.ok(!/succession notes/.test(L.unset.paragraphs.join("\n")), "lena: notes line renders without lena_notes");

// vault_face_read
const V = out.vault;
for (const [k, v] of Object.entries(V)) assert.equal(v.flags.face, undefined, `vault ${k}: the retired vault_face flag is still written`);
assert.equal(out.vaultLeft.flags.face, undefined, "vault: the retired vault_face flag is still written");
for (const k of ["both", "selaOnly", "eliasOnly", "eliasLater"]) assert.ok(V[k].offered && V[k].flags.read === true, `vault ${k}: "Read the next one." did not write vault_face_read`);
assert.ok(!V.neither.offered && V.neither.flags.read === undefined, "vault neither: the read is offered with no one at the terminal");
const sela = v => v.paragraphs[at("sela")], elias = v => v.paragraphs[at("elias")];
for (const k of ["both", "selaOnly"]) {
  assert.ok(V[k].readText.includes("Sela does not thank you"), `vault ${k}: Sela should be at the terminal`);
  assert.equal(count(sela(V[k]), SELA), 1, `vault ${k}: Sela line missing: ${sela(V[k])}`);
  assert.ok(!/manifest count/.test(elias(V[k])), `vault ${k}: Elias credited for Sela's read`);
}
for (const k of ["eliasOnly", "eliasLater"]) {
  assert.ok(V[k].readText.includes("Elias slides the tablet"), `vault ${k}: Elias should be at the terminal`);
  assert.ok(!sela(V[k]).includes("manifest"), `vault ${k}: a dead Sela credited: ${sela(V[k])}`);
}
assert.equal(count(elias(V.eliasOnly), ELIAS_ALIVE), 1, `vault eliasOnly: Elias line missing: ${elias(V.eliasOnly)}`);
assert.ok(elias(V.eliasLater).includes(ELIAS_DEAD) && !elias(V.eliasLater).includes(ELIAS_ALIVE), `vault eliasLater: the dead Elias keeps present tense: ${elias(V.eliasLater)}`);
assert.ok(elias(V.eliasOnly).indexOf(ELIAS_ALIVE) === elias(V.eliasOnly).indexOf(".") + 1, "vault eliasOnly: the line should follow Elias's opener");
for (const v of [V.neither, out.vaultLeft]) assert.ok(!/manifest/.test(v.paragraphs.join("\n")), "vault: a manifest line renders without vault_face_read");

// The attribution guard. Sela's only death site must be the vent scene. A new site anywhere — and
// above all one reachable after act3_vault_face_read — would let a Sela who read beside the
// Commander die later and hand her line to Elias. If you add one, rework the attribution in
// crewEpilogues (Sela and Elias blocks) before adding it to SELA_DEATH_SITES.
const SELA_DEATH_SITES = new Set(["vent"]);
const DYNAMIC_VICTIMS = { "state.flags.prom_line_other": ["prom_vent", "prom_line"] };
const sceneIds = JSON.parse(runtime.evaluate("JSON.stringify(Object.keys(scenes))"));
const chunks = {}, outside = [];
for (const file of readdirSync(resolve(ROOT, "src")).filter(f => f.endsWith(".js")).sort()) {
  let cur = null;
  for (const [i, line] of readFileSync(resolve(ROOT, "src", file), "utf8").split("\n").entries()) {
    const head = line.match(/^ {0,2}["']?([a-z0-9_]+)["']?\s*:\s*\{/);
    if (head && sceneIds.includes(head[1])) cur = head[1];
    else if (/^\}\);?\s*$/.test(line)) cur = null;
    const code = line.replace(/\/\/.*$/, "");
    if (cur) chunks[cur] = (chunks[cur] || "") + code + "\n";
    else if (/\bkill\(/.test(code) && !/^\s*function kill\(/.test(code)) outside.push(`${file}:${i + 1}`);
  }
}
assert.deepEqual(sceneIds.filter(id => !chunks[id]), [], "guard: a registered scene was not found in src/ (the scanner needs updating)");
assert.deepEqual(outside, [], `guard: kill() called outside a scene body; review it for Sela: ${outside.join(", ")}`);
assert.ok(!/state\.dead\.push\(/.test(Object.values(chunks).join("\n")), "guard: a scene writes state.dead directly instead of kill()");
const selaSites = [];
for (const [id, src] of Object.entries(chunks)) {
  for (const m of src.matchAll(/\bkill\(\s*([^,)]+)/g)) {
    const arg = m[1].trim();
    const literal = arg.match(/^["'`]([a-z]+)["'`]$/);
    if (literal) { if (literal[1] === "sela") selaSites.push(id); continue; }
    assert.ok(DYNAMIC_VICTIMS[arg], `guard: ${id} kills a computed victim (${arg}); prove it is never Sela and list it in DYNAMIC_VICTIMS`);
  }
}
for (const writer of Object.values(DYNAMIC_VICTIMS).flat()) assert.ok(chunks[writer] && !/["'`]sela["'`]/.test(chunks[writer]), `guard: ${writer} may choose Sela as the promise-test victim`);
assert.deepEqual(selaSites.sort(), [...SELA_DEATH_SITES].sort(), `guard: Sela death sites changed (${selaSites.join(", ")}); the vault-read attribution in crewEpilogues assumes vent is her only one`);

// Seeded real play (no-repeat-lap runner pattern): Sela never dies after the vault read, and every
// payoff line renders only with its flag and with the right reader.
const RUNS = 100;
const play = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  let seed = 4127;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const realKill = kill; let log = null;
  kill = function (who, cause) { if (log && who === "sela" && !state.dead.includes("sela")) log.selaDiedAfterRead = !!state.flags.vault_face_read; return realKill(who, cause); };
  const rows = [];
  for (let r = 0; r < ${RUNS}; r++) {
    resetRunState(); log = {}; showScene("wake");
    let ended = false, selaAtRead = null, embryoShown = false;
    for (let step = 0; step < 700; step++) {
      const id = state.scene;
      if (document.getElementById("story").innerHTML.includes("already bleeding")) embryoShown = true;
      if (id === "act3_vault_face_read" && selaAtRead === null) selaAtRead = isAlive("sela");
      if (id === "ending_check" || !scenes[id]) { ended = true; break; }
      const sc = scenes[id];
      const list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
      if (!list.length) break;
      makeChoice(list[Math.floor(rnd() * list.length)]);
    }
    const epi = crewEpilogues().join("\\n");
    rows.push({ ended, embryoShown, selaAtRead, log, f: { e: state.flags.embryo_ceiling, l: !!state.flags.lena_notes, v: !!state.flags.vault_face_read, face: state.flags.vault_face },
      lena: epi.includes("succession notes"), sela: epi.includes("vault manifest was said"), elias: epi.includes("manifest count") });
  }
  kill = realKill;
  return rows;
})())`, 600_000));
assert.equal(play.length, RUNS);
for (const [i, r] of play.entries()) {
  assert.ok(r.ended, `play ${i}: run did not end`);
  assert.notEqual(r.log.selaDiedAfterRead, true, `play ${i}: Sela died after the vault read`);
  assert.equal(r.f.face, undefined, `play ${i}: vault_face written`);
  assert.ok(!r.embryoShown || r.f.e === "lowered", `play ${i}: embryo line without embryo_ceiling`);
  assert.equal(r.lena, r.f.l, `play ${i}: Lena notes line ${r.lena ? "without" : "missing with"} lena_notes`);
  assert.equal(r.sela || r.elias, r.f.v, `play ${i}: manifest line ${r.f.v ? "missing with" : "without"} vault_face_read`);
  if (r.f.v) assert.equal(r.sela, r.selaAtRead === true, `play ${i}: manifest line credited to the wrong reader`);
}
const n = k => play.filter(r => r[k]).length;
console.log(`PASS sun-playerflow-flag-payoffs: embryo_ceiling, lena_notes and vault_face_read pay off only with their flags, alive and dead; vault_face retired; Sela's only death site is vent; ${RUNS} seeded runs (embryo ${n("embryoShown")}, Lena ${n("lena")}, Sela ${n("sela")}, Elias ${n("elias")}) with no line off its flag or reader`);
