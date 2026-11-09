// SUN-ROMANCE-ENDINGS-REACH-01 (decision 12 widened, ruled 2026-11-08) — a romance arc's last scene
// no longer depends on the Off-Shift junction pick. After the hour the Commander chose, a living,
// aboard partner whose last scene has not played gets one late hour (her own off-shift scene, or
// Amara's ledger page directly when no death is attributable) and reaches the last scene through
// her own stay choice. junctionChoice keeps the pick; nothing new is written. Dead or unrecovered
// partners never appear; the partner who was the pick is not visited twice; two partners chain in
// crew order and each is visited once. Mira's last scene sits at the Act III board and is checked
// in real play only. A seeded real-play romancer (uniform junction pick) closes the loop.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const story = () => document.getElementById("story").innerHTML;
  const choicesOf = id => { const sc = scenes[id]; const raw = sc.choices; return (typeof raw === "function" ? raw.call(sc) : raw) || []; };
  const LAST = { lena: "lena_last_hour", amara: "amara_page", sela: "sela_past_amber", vess: "vess_item_two" };
  const FLAG = { lena: "lena_last_hour", amara: "amara_page", sela: "sela_amber", vess: "vess_item_two" };
  const BRIDGE = { lena: "The prescription stands.", amara: "the light in hydroponics is still on", sela: "a second note reaches you", vess: "Query, non-urgent, still open." };
  const CLOSE = { lena: "medbay channel light burns past cycle-turn", amara: "hydroponics light outlasts you", sela: "reaches amber on schedule", vess: "Shut by morning." };
  // The junction pick's own hour: its scene and how to make it eligible.
  const PICKS = {
    lena: () => {}, elias: () => kill("mira", "vented with the lower ring"),
    mira: () => { state.crisisPath = "custody"; state.flags.custody_answer = "severed"; },
    tomas: () => { state.crisisPath = "breath"; state.promises.tomas = "kept"; },
    amara: () => kill("elias", "vented with the lower ring"), jiro: () => {}, sela: () => {}, vess: () => {}
  };
  const fresh = () => {
    resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
    state.crisisPath = "breath"; state.affinity.amara = 25;
  };
  const partner = who => { if (who === "lena") { state.romance.lena = true; mark("lena", "dying_held"); } else state.romance[who] = true; };
  // Walk one hour from a scene, always taking the first exit (never the private stay), until it leaves.
  const walkHour = (start, crewOf) => {
    showScene(start);
    const seen = [state.scene];
    for (let i = 0; i < 6 && crewOf(state.scene); i++) { makeChoice(choicesOf(state.scene)[0]); seen.push(state.scene); }
    return seen;
  };
  const OWN = { lena: /^(offshift_lena|lena_last_hour)$/, elias: /^offshift_elias$/, mira: /^offshift_mira$/, tomas: /^offshift_tomas(_r)?$/,
    amara: /^(offshift_amara|amara_page(_reply)?)$/, jiro: /^offshift_jiro$/, sela: /^(offshift_sela|sela_past_amber(_reply)?)$/, vess: /^(offshift_vess|vess_item_two(_logged)?)$/ };
  const row = { reach: {}, dead: {}, self: {}, gates: {} };

  // 1. Each arc, each other junction pick: the hour ends, her late hour opens, the stay reaches the last scene.
  for (const who of ["lena", "amara", "sela", "vess"]) {
    for (const [pick, setup] of Object.entries(PICKS)) {
      if (pick === who) continue;
      for (const amaraDeath of who === "amara" ? [true, false] : [true]) {
        // Elias's hour needs Mira dead, which is itself an attributable death.
        if (who === "amara" && !amaraDeath && pick === "elias") continue;
        fresh(); setup(); partner(who);
        if (who === "amara" && amaraDeath && pick !== "elias") kill("rourke", "vented with the lower ring");
        const flagsBefore = Object.keys(state.flags).sort().join(",");
        const pickText = (showScene(pick === "sela" ? "offshift_sela" : "offshift_" + pick), story());
        const r = { pick, amaraDeath, closingLineAboutHer: pickText.includes(CLOSE[who]) };
        const hour = [state.scene];
        for (let i = 0; i < 6 && OWN[pick].test(state.scene); i++) { makeChoice(choicesOf(state.scene)[0]); hour.push(state.scene); }
        r.lateEntry = state.scene; r.jc = state.flags.junctionChoice; r.bridge = story().includes(BRIDGE[who]);
        r.lateText = story();
        // Take her stay choice where the late hour is her off-shift scene.
        if (state.scene !== LAST[who]) {
          const stay = choicesOf(state.scene).find(c => c.next === LAST[who]);
          r.stayOffered = !!stay;
          if (stay) makeChoice(stay);
        }
        r.last = state.scene;
        r.lastFlagBefore = state.flags[FLAG[who]];
        for (let i = 0; i < 4 && state.scene !== "faction_split"; i++) makeChoice(choicesOf(state.scene)[0]);
        r.after = state.scene; r.flag = state.flags[FLAG[who]]; r.jcAfter = state.flags.junctionChoice;
        const newFlags = Object.keys(state.flags).filter(k => !flagsBefore.split(",").includes(k));
        r.newFlags = newFlags.sort();
        row.reach[who + "/" + pick + (who === "amara" ? (amaraDeath ? "/death" : "/nodeath") : "")] = r;
      }
    }
  }
  // Lena's held-only path is part of her arc's stay gate and follows it.
  fresh(); mark("lena", "held_only"); showScene("offshift_jiro"); makeChoice(choicesOf("offshift_jiro")[0]);
  row.heldOnly = { entry: state.scene, stay: choicesOf(state.scene).map(c => c.next).includes("lena_last_hour") };

  // 2. Dead and unrecovered partners never appear: the hour goes straight to the spine.
  for (const who of ["lena", "amara", "sela", "vess"]) {
    fresh(); partner(who); kill("rourke", "vented with the lower ring");
    if (who === "vess") { state.recovered.vess = false; } else kill(who, "fixture");
    showScene("offshift_jiro"); const t = story();
    makeChoice(choicesOf("offshift_jiro")[0]);
    row.dead[who] = { after: state.scene, named: t.includes(CLOSE[who]) || story().includes(BRIDGE[who]) };
  }
  // 3. The partner who was the pick, declining her stay, is not visited again.
  for (const who of ["lena", "amara", "sela", "vess"]) {
    fresh(); partner(who); kill("rourke", "vented with the lower ring");
    const seen = walkHour(who === "sela" ? "offshift_sela" : "offshift_" + who, id => OWN[who].test(id));
    row.self[who] = { seen, jc: state.flags.junctionChoice };
  }
  // 4. Two partners chain in crew order, each once; the last private hour moves to whoever stayed last.
  fresh(); partner("lena"); partner("vess");
  showScene("offshift_jiro");
  const chain = [state.scene];
  for (let i = 0; i < 12 && state.scene !== "faction_split"; i++) {
    const list = choicesOf(state.scene);
    makeChoice(list.find(c => c.tag === "private") || list[0]); chain.push(state.scene);
  }
  const remains = crewEpilogues();
  const para = name => remains.find(p => p.startsWith(name)) || "";
  row.chain = { chain, jc: state.flags.junctionChoice, lastHour: lastPrivateHour(),
    vessLast: para("Vess").includes("The last private hour of the run was hers."),
    lenaLast: para("Lena").includes("The last private hour of the run was hers."),
    jiroLast: para("Jiro").includes("The last private hour of the run was his.") };
  // 5. Gates: Lena's broken medical line closes the late hour as it closes her stay; the zero route is untouched.
  fresh(); partner("lena"); state.promises.lena = "broken"; showScene("offshift_jiro"); makeChoice(choicesOf("offshift_jiro")[0]);
  row.gates.lenaBroken = state.scene;
  fresh(); state.flags.junctionChoice = "none"; partner("vess"); showScene("offshift_tomas_r");
  row.gates.noneExit = choicesOf("offshift_tomas_r").map(c => c.next);
  // 6. Resume on a late hour keeps the pick and the bridge.
  fresh(); partner("sela"); showScene("offshift_jiro"); makeChoice(choicesOf("offshift_jiro")[0]);
  const saved = snapshotState(); saved.sceneEntered = true;
  localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  resumeGame();
  row.resume = { scene: state.scene, jc: state.flags.junctionChoice, bridge: story().includes(BRIDGE.sela) };
  return row;
})())`, 120_000));

for (const [key, r] of Object.entries(out.reach)) {
  const [who] = key.split("/");
  const entry = { lena: "offshift_lena", sela: "offshift_sela", vess: "offshift_vess", amara: r.amaraDeath ? "offshift_amara" : "amara_page" }[who];
  const last = { lena: "lena_last_hour", amara: "amara_page", sela: "sela_past_amber", vess: "vess_item_two" }[who];
  assert.equal(r.closingLineAboutHer, false, `${key}: the pick's hour still says her light went out`);
  assert.equal(r.lateEntry, entry, `${key}: the hour did not lead to her late hour (got ${r.lateEntry})`);
  assert.equal(r.jc, r.pick, `${key}: the late hour overwrote junctionChoice (${r.jc})`);
  assert.ok(r.bridge, `${key}: bridge line missing`);
  if (entry !== last) assert.ok(r.stayOffered, `${key}: her stay choice was not offered in the late hour`);
  assert.equal(r.last, last, `${key}: last scene not reached (got ${r.last})`);
  assert.ok(r.flag, `${key}: end-state flag not written`);
  assert.equal(r.after, "faction_split", `${key}: did not return to the spine (got ${r.after})`);
  assert.equal(r.jcAfter, r.pick, `${key}: junctionChoice changed`);
  const allowed = new Set(["junctionChoice", "lena_notes", "lena_last_hour", "amara_page", "sela_amber", "vess_item_two", "mira_fault_known", "course_briefed", "prom_tomas"]);
  assert.deepEqual(r.newFlags.filter(k => !allowed.has(k)), [], `${key}: wrote a flag outside the existing inventory`);
}
assert.ok(Object.keys(out.reach).length >= 26, `too few arc/pick pairs exercised: ${Object.keys(out.reach).length}`);
assert.deepEqual(out.heldOnly, { entry: "offshift_lena", stay: true }, "Lena held-only did not get her late hour");
for (const [who, r] of Object.entries(out.dead)) {
  assert.equal(r.after, "faction_split", `${who}: dead or unrecovered partner was routed (${r.after})`);
  assert.equal(r.named, false, `${who}: dead or unrecovered partner's light or bridge was printed`);
}
for (const [who, r] of Object.entries(out.self)) {
  assert.equal(r.seen[r.seen.length - 1], "faction_split", `${who}: own hour did not end on the spine: ${r.seen.join(" > ")}`);
  assert.equal(new Set(r.seen).size, r.seen.length, `${who}: own hour repeated a scene: ${r.seen.join(" > ")}`);
  assert.equal(r.jc, who, `${who}: junctionChoice not hers`);
}
assert.deepEqual(out.chain.chain, ["offshift_jiro", "offshift_lena", "lena_last_hour", "offshift_vess", "vess_item_two", "vess_item_two_logged", "faction_split"], `two partners did not chain once each in crew order: ${out.chain.chain.join(" > ")}`);
assert.equal(out.chain.jc, "jiro", "chain overwrote junctionChoice");
assert.equal(out.chain.lastHour, "vess", "last private hour did not move to the partner who stayed last");
assert.deepEqual([out.chain.jiroLast, out.chain.lenaLast, out.chain.vessLast], [false, false, true], "What Remains does not credit the partner who stayed last with the last private hour");
assert.equal(out.gates.lenaBroken, "faction_split", "a broken medical line opened Lena's late hour");
assert.deepEqual(out.gates.noneExit, ["faction_split"], "a 'none' junction routed a late hour");
assert.deepEqual(out.resume, { scene: "offshift_sela", jc: "jiro", bridge: true }, "resume on a late hour lost the pick or the bridge");

// 7. Real play: a romancer pursues one partner per run and picks the junction uniformly at random.
const real = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  let html = ""; Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: v => { html = String(v); choicesEl.children.length = 0; } });
  let seed = 85081;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
    (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  const TARGETS = ["lena", "mira", "amara", "sela", "vess"];
  const LAST = { lena: "lena_last_hour", mira: "mira_root_cause", amara: "amara_page", sela: "sela_past_amber", vess: "vess_item_two" };
  const ARC = { lena: /^(bond_lena|romance_lena|pursuit_lena|lena_|prom_make_lena|offshift_lena)/, mira: /^(bond_mira|romance_mira|pursuit_mira|favor_mira|mira_|offshift_mira|act3_lethal_mira_reserve)/,
    amara: /^(bond_amara|romance_amara_1|pursuit_amara|amara_page|offshift_amara|prom_make_amara)/, sela: /^(bond_sela|romance_sela|pursuit_sela|sela_|offshift_sela|filters_stencil|prom_make_sela)/,
    vess: /^(vess_offer|vess_transmission|vess_intimate|vess_item_two|offshift_vess)/ };
  const FIRST = { lena: "Lena", mira: "Mira", amara: "Amara", sela: "Sela", vess: "Vess" };
  const OWNER = { offshift_lena: "lena", lena_last_hour: "lena", offshift_amara: "amara", amara_page: "amara", amara_page_reply: "amara", offshift_sela: "sela", sela_past_amber: "sela", sela_past_amber_reply: "sela", offshift_vess: "vess", vess_item_two: "vess", vess_item_two_logged: "vess", mira_root_cause: "mira", mira_root_cause_logged: "mira" };
  const res = { runs: 0, ended: 0, deadRenders: [], arcs: {} };
  for (const w of TARGETS) res.arcs[w] = { partners: 0, openAtPoint: 0, reached: 0, reachedAfterOtherPick: 0, misses: [] };
  for (let r = 0; r < 100; r++) {
    const target = TARGETS[r % 5];
    resetRunState(); showScene("wake");
    const visits = new Map(), path = [];
    let atJunction = null, atBoard = null, sentToLocal = false;
    for (let step = 0; step < 800; step++) {
      const id = state.scene; path.push(id);
      if (OWNER[id] && !isAlive(OWNER[id])) res.deadRenders.push(id);
      if (!atJunction && state.crisisPath != null && /^(offshift_|filters_stencil)/.test(id)) {
        atJunction = { alive: isAlive(target), open: target === "lena" ? (!!state.romance.lena || hasMark("lena", "held_only")) && state.promises.lena !== "broken" : !!state.romance[target] };
      }
      if (id === "act3_lethal_mira_board" && !atBoard) atBoard = { alive: isAlive("mira"), partner: !!state.romance.mira };
      if (id === "ending_check" || !scenes[id]) { res.ended++; break; }
      const sc = scenes[id];
      const choices = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
      if (!choices.length) break;
      let pick;
      if (id === "offshift_open") pick = choices[Math.floor(rnd() * choices.length)];
      else {
        const score = c => (c.next && ARC[target].test(c.next) ? 10 : 0) + (c.next === LAST[target] ? 10 : 0) - (c.next === "romance_amara_tomas" ? 20 : 0) +
          (c.tag === "private" && String(c.text).includes(FIRST[target]) ? 6 : 0) + (c.affinity && c.affinity[target] > 0 ? Math.min(c.affinity[target], 5) : 0) -
          (c.mark && (c.mark[target] === "declined" || c.mark[target] === "held_only") ? 20 : 0) - 3 * (visits.get(id + "|" + c.text) || 0);
        const best = Math.max(...choices.map(score)); const top = choices.filter(c => score(c) === best);
        pick = top[Math.floor(rnd() * top.length)];
      }
      if (id === "act3_lethal_mira_board" && /^(Order Mira|Accept her)/.test(pick.text)) sentToLocal = true;
      visits.set(id + "|" + pick.text, (visits.get(id + "|" + pick.text) || 0) + 1);
      makeChoice(pick);
    }
    res.runs++;
    const a = res.arcs[target], seen = new Set(path);
    const isPartner = target === "lena" ? !!state.romance.lena || hasMark("lena", "held_only") : !!state.romance[target];
    if (!isPartner) continue;
    a.partners++;
    const open = target === "mira" ? !!(atBoard && atBoard.alive && atBoard.partner && !sentToLocal) : !!(atJunction && atJunction.alive && atJunction.open);
    if (!open) continue;
    a.openAtPoint++;
    if (seen.has(LAST[target])) { a.reached++; if (target !== "mira" && state.flags.junctionChoice !== target) a.reachedAfterOtherPick++; }
    else a.misses.push({ run: r, jc: state.flags.junctionChoice });
  }
  return res;
})())`, 600_000));

assert.equal(real.ended, real.runs, `real play: ${real.runs - real.ended} runs did not reach an ending`);
assert.deepEqual(real.deadRenders, [], `real play: a dead or unrecovered partner's scene rendered: ${real.deadRenders.join(", ")}`);
for (const [who, a] of Object.entries(real.arcs)) {
  assert.ok(a.openAtPoint >= 5, `real play: too few living, aboard ${who} partners to judge (${a.openAtPoint})`);
  assert.deepEqual(a.misses, [], `real play: living, aboard ${who} partners missed the last scene: ${JSON.stringify(a.misses)}`);
  if (who !== "mira") assert.ok(a.reachedAfterOtherPick >= 1, `real play: no ${who} partner reached the last scene after picking someone else`);
}
const summary = Object.entries(real.arcs).map(([w, a]) => `${w} ${a.reached}/${a.openAtPoint}`).join(", ");
console.log(`PASS sun-playerflow-romance-endings-reach: ${Object.keys(out.reach).length} arc/pick pairs reach the last scene after another hour, junctionChoice kept, no new flags; dead and unrecovered partners never routed or named; own pick not revisited; two partners chain once each in crew order and the last private hour moves; broken line and 'none' untouched; resume keeps the bridge; real-play romancer, living aboard partners reaching the last scene: ${summary}`);
