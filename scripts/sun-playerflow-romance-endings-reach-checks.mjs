// SUN-ROMANCE-ENDINGS-REACH-01 (decision 12 widened, ruled 2026-11-08) — a romance arc's last scene
// no longer depends on the Off-Shift junction pick. After the hour the Commander chose, a living,
// aboard partner whose last scene has not played gets one late hour (her own off-shift scene; with
// no attributable death Amara's is the kettle and her stay choice only) and reaches the last scene through
// her own stay choice. junctionChoice keeps the pick; nothing new is written. Dead or unrecovered
// partners never appear; the partner who was the pick is not visited twice. Mira's last scene sits
// at the Act III board and is checked in real play only. A seeded real-play romancer (uniform
// junction pick) closes the loop.
// SUN-LATE-HOUR-CAP-01 (STATUS decision 26) — one late hour a night. It goes to the first pending
// partner in crew order (Lena, Amara, Sela, Vess); when it ends the night ends, stayed or declined,
// and a late hour never leads to another. It always opens "past cycle-turn". Of the partners left
// behind, the first gets the closing line she had before the late hours existed, in the pick's
// hour; the partner whose late hour is coming does not. What Remains credits the last hour spent.
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
  const BRIDGE = { lena: "The prescription stands.", amara: "the light in hydroponics is still on", sela: "She has not let it reach yellow.", vess: "Query, non-urgent, still open." };
  const CLOSE = { lena: "medbay channel light burns past cycle-turn", amara: "hydroponics light outlasts you", sela: "reaches amber on schedule", vess: "Shut by morning." };
  // A late hour's first words (SUN-LATE-HOUR-CAP-01: there is one a night, so it is always past cycle-turn).
  const OPEN = { lena: "Down-corridor, the medbay channel light is still burning past cycle-turn.", amara: "Past cycle-turn, the light in hydroponics is still on",
    sela: "Past cycle-turn, the yellow lamp is still held at amber.", vess: "Past cycle-turn, the relay bay light is still on when you pass." };
  // The left-behind closing lines, whole, in the order partnerUnchosen walks them.
  const LEFT = { lena: "Down-corridor, the medbay channel light burns past cycle-turn. Then it doesn't.", mira: "Somewhere below, a torque wrench keeps time past shift-end.",
    amara: "The hydroponics light outlasts you. Barely.", sela: "At cycle-turn, a yellow lamp somewhere reaches amber on schedule.", vess: "The relay bay light is on when you pass. Shut by morning." };
  const LATER = /(Later|Toward morning|Nearly morning), the /;
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
        r.opener = story().includes(OPEN[who]) && !LATER.test(story());
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
  // 4. Two partners, neither the pick: the first in crew order has the one late hour and the night
  //    ends there. The other is left behind with her closing line, printed in the pick's hour.
  fresh(); partner("lena"); partner("vess");
  showScene("offshift_jiro");
  const jiroHour = story();
  const chain = [state.scene], lateTexts = [];
  for (let i = 0; i < 12 && state.scene !== "faction_split"; i++) {
    const list = choicesOf(state.scene);
    makeChoice(list.find(c => c.tag === "private") || list[0]); chain.push(state.scene);
    if (state.scene !== "faction_split") lateTexts.push(story());
  }
  const remains = crewEpilogues();
  const para = name => remains.find(p => p.startsWith(name)) || "";
  row.chain = { chain, jc: state.flags.junctionChoice, lastHour: lastPrivateHour(),
    vessLeftBehind: jiroHour.includes(LEFT.vess), lenaLineInPick: jiroHour.includes(LEFT.lena),
    lateCloses: Object.keys(LEFT).filter(w => lateTexts.some(t => t.includes(LEFT[w]))),
    vessItemTwo: state.flags.vess_item_two || null,
    vessLast: para("Vess").includes("The last private hour of the run was hers."),
    lenaLast: para("Lena").includes("The last private hour of the run was hers."),
    jiroLast: para("Jiro").includes("The last private hour of the run was his.") };
  // 4b. A declined late hour is still the last hour spent, and the night still ends on it.
  fresh(); partner("lena"); partner("vess");
  showScene("offshift_lena"); makeChoice(choicesOf("offshift_lena").find(c => c.next === "lena_last_hour"));
  makeChoice(choicesOf("lena_last_hour")[0]);
  const vessOpener = story().includes(OPEN.vess);
  makeChoice(choicesOf("offshift_vess").find(c => c.text === "Hold it between you."));
  row.declined = { scene: state.scene, last: lastPrivateHour(), vessOpener };
  // 4c. A late hour never leads to another: with all four partners pending, the pick's hour leads to
  //     the first in crew order and every late hour's exit is the spine. The chained openers are gone.
  fresh(); ["lena", "amara", "sela", "vess"].forEach(partner); state.flags.junctionChoice = "jiro";
  row.noChain = { fromPick: afterHour("jiro"), fromLate: ["lena", "amara", "sela", "vess"].map(afterHour),
    partner: typeof lateHourPartner === "function" ? lateHourPartner() : null, openerHelper: typeof lateHourOpener };
  // 4d. A save parked in what used to be a second late hour (before the cap) still plays and ends the night.
  fresh(); partner("lena"); partner("vess"); state.flags.junctionChoice = "jiro"; state.flags.lena_last_hour = true;
  showScene("offshift_vess");
  row.parked = { opener: story().includes(OPEN.vess) && !LATER.test(story()), exits: [...new Set(choicesOf("offshift_vess").filter(c => c.tag !== "private").map(c => c.next))] };
  // 4e. The cap, exhaustively: every junction pick, every set of partners, with and without Mira as
  //     a partner and an attributable death, staying every time or declining every time.
  const ORDER = ["lena", "amara", "sela", "vess"];
  const ownerOf = id => Object.keys(OWN).find(w => OWN[w].test(id)) || null;
  row.cap = [];
  for (const pick of Object.keys(PICKS)) for (let mask = 0; mask < 16; mask++) for (const mira of [false, true]) for (const death of [false, true]) for (const stay of [true, false]) {
    if (mira && pick === "elias") continue; // Elias's hour needs Mira dead.
    fresh(); PICKS[pick]();
    if (pick === "tomas") delete state.promises.tomas; // his closing line sits on the reply screen, after the six words
    const set = ORDER.filter((w, i) => mask & (1 << i)); set.forEach(partner);
    if (mira) { state.romance.mira = true; state.crisisPath = "custody"; state.flags.custody_answer = "severed"; }
    if (death) kill("rourke", "vented with the lower ring");
    const anyDeath = death || pick === "elias" || pick === "amara";
    const expLate = ORDER.find(w => set.includes(w) && w !== pick) || null;
    const expLeft = ["lena", "mira", "amara", "sela", "vess"].find(w => w !== pick && w !== expLate && (w === "mira" ? mira : set.includes(w)) && (w !== "amara" || anyDeath)) || null;
    showScene("offshift_" + pick);
    const seq = [], hours = [], pickTexts = [], lateTexts = [];
    for (let i = 0; i < 12 && state.scene !== "faction_split"; i++) {
      const id = state.scene, who = ownerOf(id);
      seq.push(id); if (hours[hours.length - 1] !== who) hours.push(who);
      (who === pick ? pickTexts : lateTexts).push(story());
      const list = choicesOf(id);
      makeChoice(stay ? (list.find(c => c.tag === "private") || list[0]) : list[0]);
    }
    row.cap.push({ key: [pick, set.join("+") || "-", mira ? "mira" : "", death ? "death" : "", stay ? "stay" : "decline"].join("/"),
      pick, expLate, expLeft, hours, repeated: new Set(seq).size !== seq.length, end: state.scene, jc: state.flags.junctionChoice, last: lastPrivateHour(),
      remains: crewEpilogues().filter(p => p.includes("The last private hour of the run was")).map(p => p.split(" ")[0].toLowerCase()),
      pickCloses: Object.keys(LEFT).filter(w => pickTexts.some(t => t.includes(LEFT[w]))),
      lateCloses: Object.keys(LEFT).filter(w => lateTexts.some(t => t.includes(LEFT[w]))),
      opener: !expLate || (lateTexts[0].includes(OPEN[expLate]) && !lateTexts.some(t => LATER.test(t))),
      stayedLast: !!expLate && !!state.flags[FLAG[expLate]],
      leftDone: ORDER.filter(w => w !== pick && w !== expLate && state.flags[FLAG[w]]) });
  }
  // 4f. Lena is first in crew order, so she is left behind only when a broken medical line has closed
  //     her hour. Then her old closing line is hers again, and the late hour goes to the next partner.
  fresh(); partner("lena"); partner("vess"); state.promises.lena = "broken";
  showScene("offshift_jiro");
  row.lenaLeft = { pickCloses: Object.keys(LEFT).filter(w => story().includes(LEFT[w])) };
  makeChoice(choicesOf("offshift_jiro")[0]);
  row.lenaLeft.late = state.scene; row.lenaLeft.opener = story().includes(OPEN.vess);
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
  const entry = { lena: "offshift_lena", sela: "offshift_sela", vess: "offshift_vess", amara: "offshift_amara" }[who];
  const last = { lena: "lena_last_hour", amara: "amara_page", sela: "sela_past_amber", vess: "vess_item_two" }[who];
  assert.equal(r.closingLineAboutHer, false, `${key}: the pick's hour still says her light went out`);
  assert.equal(r.lateEntry, entry, `${key}: the hour did not lead to her late hour (got ${r.lateEntry})`);
  assert.equal(r.jc, r.pick, `${key}: the late hour overwrote junctionChoice (${r.jc})`);
  assert.ok(r.bridge, `${key}: bridge line missing`);
  assert.ok(r.opener, `${key}: the late hour does not open past cycle-turn`);
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
assert.deepEqual(out.chain.chain, ["offshift_jiro", "offshift_lena", "lena_last_hour", "faction_split"], `two partners: the night did not end after the first partner's late hour: ${out.chain.chain.join(" > ")}`);
assert.equal(out.chain.jc, "jiro", "the late hour overwrote junctionChoice");
assert.equal(out.chain.vessLeftBehind, true, "the partner left behind did not get her closing line in the pick's hour");
assert.equal(out.chain.lenaLineInPick, false, "the pick's hour says the light went out for the partner whose late hour is coming");
assert.deepEqual(out.chain.lateCloses, [], `a closing line printed inside the late hour: ${out.chain.lateCloses.join(", ")}`);
assert.equal(out.chain.vessItemTwo, null, "the partner left behind reached her last scene");
assert.equal(out.chain.lastHour, "lena", "last private hour did not go to the partner who had the late hour");
assert.deepEqual([out.chain.jiroLast, out.chain.lenaLast, out.chain.vessLast], [false, true, false], "What Remains does not credit the partner who had the late hour with the last private hour");
assert.equal(out.gates.lenaBroken, "faction_split", "a broken medical line opened Lena's late hour");
assert.deepEqual(out.gates.noneExit, ["faction_split"], "a 'none' junction routed a late hour");
assert.deepEqual(out.resume, { scene: "offshift_sela", jc: "jiro", bridge: true }, "resume on a late hour lost the pick or the bridge");
assert.deepEqual(out.declined, { scene: "faction_split", last: "vess", vessOpener: true }, "a declined late hour lost the last private hour, or the first late hour lost its opener");
assert.deepEqual(out.noChain, { fromPick: "offshift_lena", fromLate: ["faction_split", "faction_split", "faction_split", "faction_split"], partner: "lena", openerHelper: "undefined" },
  "a late hour leads to another late hour, the pick's hour does not lead to the first partner in crew order, or lateHourOpener is still defined");
assert.deepEqual(out.parked, { opener: true, exits: ["faction_split"] }, "a save parked in a second late hour does not open past cycle-turn or does not end the night");
// The cap, exhaustively.
assert.equal(out.cap.length, 960, `cap: expected 960 fixture nights, ran ${out.cap.length}`);
for (const c of out.cap) {
  assert.ok(c.hours.length <= 2, `cap ${c.key}: ${c.hours.length} private hours in one night (${c.hours.join(" > ")})`);
  assert.deepEqual(c.hours, c.expLate ? [c.pick, c.expLate] : [c.pick], `cap ${c.key}: the night's hours are ${c.hours.join(" > ")}`);
  assert.equal(c.repeated, false, `cap ${c.key}: a scene repeated`);
  assert.equal(c.end, "faction_split", `cap ${c.key}: the night did not end on the spine (${c.end})`);
  assert.equal(c.jc, c.pick, `cap ${c.key}: junctionChoice changed (${c.jc})`);
  assert.equal(c.last, c.expLate || c.pick, `cap ${c.key}: lastPrivateHour() is ${c.last}`);
  assert.deepEqual(c.remains, [c.expLate || c.pick], `cap ${c.key}: What Remains credits the last private hour to ${c.remains.join(", ") || "nobody"}`);
  assert.deepEqual(c.pickCloses, c.expLeft ? [c.expLeft] : [], `cap ${c.key}: left-behind lines in the pick's hour: ${c.pickCloses.join(", ") || "none"} (expected ${c.expLeft || "none"})`);
  assert.deepEqual(c.lateCloses, [], `cap ${c.key}: a closing line printed inside the late hour (${c.lateCloses.join(", ")})`);
  assert.ok(c.opener, `cap ${c.key}: the late hour does not open past cycle-turn`);
  assert.deepEqual(c.leftDone, [], `cap ${c.key}: a partner left behind reached her last scene (${c.leftDone.join(", ")})`);
  if (c.expLate) assert.equal(c.stayedLast, c.key.endsWith("/stay"), `cap ${c.key}: the stay choice and the end-state flag disagree`);
}
const capStats = { late: out.cap.filter(c => c.expLate).length, left: out.cap.filter(c => c.expLeft).length };
assert.ok(capStats.late >= 700 && capStats.left >= 400, `cap: too few nights with a late hour (${capStats.late}) or a left-behind line (${capStats.left})`);
for (const w of ["mira", "amara", "sela", "vess"]) assert.ok(out.cap.some(c => c.expLeft === w), `cap: ${w}'s left-behind line was never exercised`);
assert.deepEqual(out.lenaLeft, { pickCloses: ["lena"], late: "offshift_vess", opener: true }, "Lena with a broken medical line: her closing line is missing, or the late hour did not go to the next partner");

// 7. Real play: a romancer pursues one partner per run and picks the junction uniformly at random.
//    Under the cap a living, aboard partner misses her last scene only when the night's one late
//    hour went to a partner ahead of her in crew order; no night holds more than two private hours.
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
  const HOUR = { offshift_lena: "lena", offshift_elias: "elias", offshift_mira: "mira", offshift_tomas: "tomas", offshift_amara: "amara", offshift_jiro: "jiro", offshift_sela: "sela", offshift_vess: "vess" };
  const NIGHT = ["lena", "amara", "sela", "vess"];
  const LEFT = { lena: "medbay channel light burns past cycle-turn", mira: "a torque wrench keeps time past shift-end", amara: "hydroponics light outlasts you", sela: "reaches amber on schedule", vess: "Shut by morning." };
  const res = { runs: 0, ended: 0, deadRenders: [], overTwo: [], falseLines: [], lateLines: [], leftLines: 0, lateHours: 0, wrongLast: [], arcs: {} };
  for (const w of TARGETS) res.arcs[w] = { partners: 0, openAtPoint: 0, reached: 0, reachedAfterOtherPick: 0, capped: 0, misses: [] };
  for (let r = 0; r < 100; r++) {
    const target = TARGETS[r % 5];
    resetRunState(); showScene("wake");
    const visits = new Map(), path = [], hours = [], lines = [];
    let atJunction = null, atBoard = null, sentToLocal = false;
    for (let step = 0; step < 800; step++) {
      const id = state.scene; path.push(id);
      if (OWNER[id] && !isAlive(OWNER[id])) res.deadRenders.push(id);
      if (HOUR[id]) hours.push(HOUR[id]);
      if (hours.length && state.crisisPath != null && /^(offshift_|lena_last_hour|amara_page|sela_past_amber|vess_item_two)/.test(id)) {
        const text = document.getElementById("story").innerHTML;
        for (const [w, line] of Object.entries(LEFT)) if (text.includes(line)) lines.push({ about: w, hour: hours.length });
      }
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
    if (hours.length > 2) res.overTwo.push({ run: r, hours });
    if (hours.length === 2) res.lateHours++;
    if (lines.some(l => hours.slice(l.hour).includes(l.about))) res.falseLines.push({ run: r, hours, lines });
    if (lines.some(l => l.hour > 1)) res.lateLines.push({ run: r, hours, lines });
    if (lines.some(l => NIGHT.includes(l.about) && !hours.includes(l.about))) res.leftLines++;
    if (hours.length && lastPrivateHour() !== hours[hours.length - 1]) res.wrongLast.push({ run: r, hours, last: lastPrivateHour() });
    const a = res.arcs[target], seen = new Set(path);
    const isPartner = target === "lena" ? !!state.romance.lena || hasMark("lena", "held_only") : !!state.romance[target];
    if (!isPartner) continue;
    a.partners++;
    const open = target === "mira" ? !!(atBoard && atBoard.alive && atBoard.partner && !sentToLocal) : !!(atJunction && atJunction.alive && atJunction.open);
    if (!open) continue;
    a.openAtPoint++;
    if (seen.has(LAST[target])) { a.reached++; if (target !== "mira" && state.flags.junctionChoice !== target) a.reachedAfterOtherPick++; }
    // The cap: the night's one late hour went to a partner ahead of her in crew order.
    else if (hours.length === 2 && hours[1] !== target && NIGHT.includes(hours[1]) && NIGHT.indexOf(hours[1]) < NIGHT.indexOf(target)) a.capped++;
    else a.misses.push({ run: r, jc: state.flags.junctionChoice, hours });
  }
  return res;
})())`, 600_000));

assert.equal(real.ended, real.runs, `real play: ${real.runs - real.ended} runs did not reach an ending`);
assert.deepEqual(real.deadRenders, [], `real play: a dead or unrecovered partner's scene rendered: ${real.deadRenders.join(", ")}`);
assert.deepEqual(real.overTwo, [], `real play: a night held more than two private hours: ${JSON.stringify(real.overTwo)}`);
assert.deepEqual(real.falseLines, [], `real play: a closing line said a partner's light went out and she then had an hour: ${JSON.stringify(real.falseLines)}`);
assert.deepEqual(real.lateLines, [], `real play: a closing line printed inside a late hour: ${JSON.stringify(real.lateLines)}`);
assert.deepEqual(real.wrongLast, [], `real play: lastPrivateHour() is not the last hour spent: ${JSON.stringify(real.wrongLast)}`);
assert.ok(real.lateHours >= 20, `real play: too few late hours to judge (${real.lateHours})`);
assert.ok(real.leftLines >= 1, "real play: no night printed a left-behind partner's closing line");
for (const [who, a] of Object.entries(real.arcs)) {
  assert.ok(a.openAtPoint >= 5, `real play: too few living, aboard ${who} partners to judge (${a.openAtPoint})`);
  assert.deepEqual(a.misses, [], `real play: living, aboard ${who} partners missed the last scene with no earlier partner taking the late hour: ${JSON.stringify(a.misses)}`);
  if (who === "lena" || who === "mira") assert.equal(a.capped, 0, `real play: ${who} lost her last scene to the cap, which cannot happen (${a.capped})`);
  if (who !== "mira") assert.ok(a.reachedAfterOtherPick >= 1, `real play: no ${who} partner reached the last scene after picking someone else`);
}
const summary = Object.entries(real.arcs).map(([w, a]) => `${w} ${a.reached}/${a.openAtPoint}${a.capped ? ` (${a.capped} left behind by the cap)` : ""}`).join(", ");
console.log(`PASS sun-playerflow-romance-endings-reach: ${Object.keys(out.reach).length} arc/pick pairs reach the last scene after another hour, junctionChoice kept, no new flags; dead and unrecovered partners never routed or named; own pick not revisited; one late hour a night in ${out.cap.length} fixture nights (first pending partner in crew order, never a second, always past cycle-turn; ${capStats.left} left-behind lines pinned); the last private hour is the last hour spent; broken line and 'none' untouched; resume keeps the bridge; real-play romancer, ${real.runs} runs, ${real.lateHours} late hours, no night over two hours, ${real.leftLines} nights with a left-behind line; living aboard partners reaching the last scene: ${summary}`);
