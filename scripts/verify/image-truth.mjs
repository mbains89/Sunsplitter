// Plate and presence honesty: pinned image hashes and roster truth for wired plates, Vess's hair
// canon, and the living/dead/unrecovered presence guards on the warmth and cut-out scenes.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./shared.mjs";

export function warmthLaughterChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.recovered.vess = true;
    const livingVessText = scenes.warmth_laughter.text;
    kill("vess", "fixture");
    const deadVessText = scenes.warmth_laughter.text;
    return { livingVessText, deadVessText };
  })()`);

  if (!fixture.livingVessText.includes("Vess is one — and Vess is telling a joke")) {
    errors.push("living Vess no longer participates in warmth_laughter");
  }
  if (fixture.deadVessText.includes("Vess")) {
    errors.push("dead Vess is still named or speaking in warmth_laughter");
  }
  if (!fixture.deadVessText.includes("one of them is telling a joke")) {
    errors.push("dead-Vess warmth_laughter no longer preserves the crew joke");
  }
  return errors;
}

export function rourkeDyingImageHonestyChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => ({
    dying: resolveSceneImage("dying", scenes.dying),
    outcomes: ["rourke_end", "rourke_stop", "rourke_try"].map(id => resolveSceneImage(id, scenes[id]))
  }))()`);

  if (fixture.dying !== "images/medical_bay.jpg") {
    errors.push(`dying Rourke scene resolves to ${fixture.dying || "no image"} instead of the injury-honest medical plate`);
  }
  if (fixture.outcomes.some(image => image !== "images/covered_body.jpg")) {
    errors.push(`Rourke outcome image wiring changed: ${fixture.outcomes.join(" | ")}`);
  }
  return errors;
}

export function romanceLena1ImageTruthChecks(runtime) {
  const errors = [];
  // HITL wire (MEASURE_LIVE_VS_HITL_88 + OWNER): staged event_id plate; shower stays later-only.
  const expected = "images/romance_lena_1.jpg";
  const forbidden = "images/shower_lena.jpg";
  const oldStandIn = "images/observation_bridge_alt_2.jpg";
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "romance_lena_1";
    const before = JSON.stringify(state);
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      showerMapped: sceneImages.lena_shower,
      showerResolved: resolveSceneImage("lena_shower", scenes.lena_shower),
      sexResolved: resolveSceneImage("romance_lena_sex", scenes.romance_lena_sex)
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("romance_lena_1 image resolve wrote run state");
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`romance_lena_1 ${field} still uses the premature shower plate ${forbidden}`);
    }
    if (fixture[field] === oldStandIn) {
      errors.push(`romance_lena_1 ${field} still uses the pre-HITL blister stand-in ${oldStandIn}`);
    }
    if (fixture[field] !== expected) {
      errors.push(`romance_lena_1 ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  if (fixture.showerMapped !== forbidden || fixture.showerResolved !== forbidden) {
    errors.push("lena_shower lost its later rinse plate");
  }
  if (fixture.sexResolved !== "images/afterglow_lena.jpg") {
    errors.push(`romance_lena_sex resolved to ${fixture.sexResolved || "missing"}; expected images/afterglow_lena.jpg`);
  }
  return errors;
}

export function romanceAmara1ImageTruthChecks(runtime) {
  const errors = [];
  const expected = "images/hydroponics.jpg";
  const forbidden = "images/shower_amara.jpg";
  const linger = "images/rear_amara.jpg";
  const expectedHashes = {
    "images/hydroponics.jpg": "00ab1cb40167e3b2882e2c1ebe02964898c52e7aa04ab8fb94f8beecb99a8960",
    "images/shower_amara.jpg": "588ba8e67d7c1c6f44e38f26da7f25f15a412283c65ffed55831b54065e827f9",
    "images/rear_amara.jpg": "e8167625d3facc2af56bdb16cca6f2eb034cf098bd6928bb05fc890d7742a737", // SUN-HITL-LATE-SIX-01: owner-approved Grok card wT0pe (was the as-is plate)
    "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf"
  };
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "romance_amara_1";
    const before = JSON.stringify(state);
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      rearMapped: sceneImages.amara_rear,
      rearDeclared: scenes.amara_rear && scenes.amara_rear.image,
      rearResolved: resolveSceneImage("amara_rear", scenes.amara_rear),
      inventedShowerScene: Boolean(scenes.amara_shower)
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("romance_amara_1 image resolve wrote run state");
  if (fixture.inventedShowerScene) errors.push("amara_shower scene was invented; linger stays on amara_rear");
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`romance_amara_1 ${field} still uses the premature shower plate ${forbidden}`);
    }
    if (fixture[field] !== expected) {
      errors.push(`romance_amara_1 ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  for (const field of ["rearMapped", "rearDeclared", "rearResolved"]) {
    if (fixture[field] !== linger) {
      errors.push(`amara_rear ${field} is ${fixture[field] || "missing"}; expected ${linger}`);
    }
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Amara leftover plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function tetherHandEliasImageTruthChecks(runtime) {
  const errors = [];
  // HITL wire (MEASURE_LIVE_VS_HITL_88 + OWNER): staged event_id plate; Mira/Sela keep tether_ride.
  const expected = "images/act2_tether_hand_elias.jpg";
  const forbidden = "images/self_risk.jpg";
  const oldStandIn = "images/tether_ride.jpg";
  const deadFallback = "images/corridor_pressure_3.jpg";
  const expectedHashes = {
    "images/act2_tether_hand_elias.jpg": "2b4337cece6d32307131328d419028e45fc506986e52a9c7dd0b4ac46de290dd",
    "images/tether_ride.jpg": "7961187200068efe1938de5a110d0a30f673be212e8aaf0694e0650e3a506c34",
    "images/self_risk.jpg": "427fb4c5a72239451d213dcf7d6e80bef15da646a4b5e6000ddb54ffeb9de8a7",
    "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf"
  };
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "act2_tether_hand_elias";
    const before = JSON.stringify(state);
    const livingText = typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      eliasAlive: isAlive("elias"),
      livingText
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("act2_tether_hand_elias image resolve wrote run state");
  if (!fixture.eliasAlive) errors.push("fresh run lost living Elias before tether-hand resolve");
  if (!String(fixture.livingText || "").startsWith("Elias suits up")) {
    errors.push("act2_tether_hand_elias living roster text is no longer Elias");
  }
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`act2_tether_hand_elias ${field} still uses the interior corridor-wheel plate ${forbidden}`);
    }
    if (fixture[field] === oldStandIn) {
      errors.push(`act2_tether_hand_elias ${field} still uses the pre-HITL tether_ride stand-in ${oldStandIn}`);
    }
    if (fixture[field] !== expected) {
      errors.push(`act2_tether_hand_elias ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  const dead = runtime.evaluate(`(() => {
    resetRunState();
    state.dead.push("elias");
    const before = JSON.stringify(state);
    const resolved = resolveSceneImage("act2_tether_hand_elias", scenes.act2_tether_hand_elias);
    return { resolved, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (dead.wroteState) errors.push("dead Elias tether-hand resolve wrote run state");
  if (dead.resolved !== deadFallback) {
    errors.push(`dead Elias tether-hand resolved to ${dead.resolved || "missing"}; expected ${deadFallback}`);
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Elias tether leftover plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function lethalEliasOrderImageTruthChecks(runtime) {
  const errors = [];
  // HITL wire (MEASURE_LIVE_VS_HITL_88 + OWNER): staged event_id plate; sealant keeps work_elias.
  const expected = "images/act3_lethal_elias_order.jpg";
  const forbidden = "images/bond_elias.jpg";
  const quietCup = "images/quiet_elias.jpg";
  const oldStandIn = "images/work_elias.jpg";
  const deadFallback = "images/corridor_pressure_3.jpg";
  const expectedHashes = {
    "images/act3_lethal_elias_order.jpg": "801046e8d1604fd2d7a84d48881b03c5d1457191afce47577f9c40a4d1ffaa01",
    "images/work_elias.jpg": "9dfa81959aba082c192c1a9d0ea3c24383dc7695da0ccbe74bc1c3025af63ff2",
    "images/bond_elias.jpg": "084655c278e2c398843a26885eceeab517117b0da8656a7ccb57029e514d1db8",
    "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf"
  };
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "act3_lethal_elias_order";
    const before = JSON.stringify(state);
    const livingText = typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      eliasAlive: isAlive("elias"),
      livingText,
      bondMapped: sceneImages.bond_elias,
      bondDeclared: scenes.bond_elias && scenes.bond_elias.image,
      bondResolved: resolveSceneImage("bond_elias", scenes.bond_elias)
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("act3_lethal_elias_order image resolve wrote run state");
  if (!fixture.eliasAlive) errors.push("fresh run lost living Elias before lethal-order resolve");
  if (!String(fixture.livingText || "").includes("Station B-four")) {
    errors.push("act3_lethal_elias_order living text no longer stages Station B-four");
  }
  if (!String(fixture.livingText || "").includes("Elias")) {
    errors.push("act3_lethal_elias_order living roster text is no longer Elias");
  }
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`act3_lethal_elias_order ${field} still uses the quiet seated cup plate ${forbidden}`);
    }
    if (fixture[field] === quietCup) {
      errors.push(`act3_lethal_elias_order ${field} still uses the seated rest plate ${quietCup}`);
    }
    if (fixture[field] === oldStandIn) {
      errors.push(`act3_lethal_elias_order ${field} still uses the pre-HITL work_elias stand-in ${oldStandIn}`);
    }
    if (fixture[field] !== expected) {
      errors.push(`act3_lethal_elias_order ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  for (const field of ["bondMapped", "bondDeclared", "bondResolved"]) {
    if (fixture[field] !== forbidden) {
      errors.push(`bond_elias ${field} is ${fixture[field] || "missing"}; expected ${forbidden}`);
    }
  }
  const dead = runtime.evaluate(`(() => {
    resetRunState();
    state.dead.push("elias");
    const before = JSON.stringify(state);
    const resolved = resolveSceneImage("act3_lethal_elias_order", scenes.act3_lethal_elias_order);
    return { resolved, wroteState: JSON.stringify(state) !== before, eliasAlive: isAlive("elias") };
  })()`);
  if (dead.wroteState) errors.push("dead Elias lethal-order resolve wrote run state");
  if (dead.eliasAlive) errors.push("dead Elias lethal-order fixture still reports living Elias");
  if (dead.resolved !== deadFallback) {
    errors.push(`dead Elias lethal-order resolved to ${dead.resolved || "missing"}; expected ${deadFallback}`);
  }
  if (dead.resolved === expected || dead.resolved === forbidden) {
    errors.push("dead Elias lethal-order still shows a living Elias plate");
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Elias lethal leftover plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function lethalEliasSealantImageTruthChecks(runtime) {
  const errors = [];
  const expected = "images/work_elias.jpg";
  const forbidden = "images/bond_elias.jpg";
  const quietCup = "images/quiet_elias.jpg";
  const officialPortrait = "images/elias.jpg";
  const deadFallback = "images/corridor_pressure_3.jpg";
  const expectedHashes = {
    "images/work_elias.jpg": "9dfa81959aba082c192c1a9d0ea3c24383dc7695da0ccbe74bc1c3025af63ff2",
    "images/bond_elias.jpg": "084655c278e2c398843a26885eceeab517117b0da8656a7ccb57029e514d1db8",
    "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf"
  };
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "act3_lethal_elias_sealant";
    const before = JSON.stringify(state);
    const livingText = typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      eliasAlive: isAlive("elias"),
      livingText,
      bondMapped: sceneImages.bond_elias,
      bondDeclared: scenes.bond_elias && scenes.bond_elias.image,
      bondResolved: resolveSceneImage("bond_elias", scenes.bond_elias),
      lenaMapped: sceneImages.romance_lena_1,
      lenaDeclared: scenes.romance_lena_1 && scenes.romance_lena_1.image,
      lenaResolved: resolveSceneImage("romance_lena_1", scenes.romance_lena_1),
      amaraMapped: sceneImages.romance_amara_1,
      amaraDeclared: scenes.romance_amara_1 && scenes.romance_amara_1.image,
      amaraResolved: resolveSceneImage("romance_amara_1", scenes.romance_amara_1),
      eliasTetherMapped: sceneImages.act2_tether_hand_elias,
      eliasTetherDeclared: scenes.act2_tether_hand_elias && scenes.act2_tether_hand_elias.image,
      eliasTetherResolved: resolveSceneImage("act2_tether_hand_elias", scenes.act2_tether_hand_elias),
      eliasLethalMapped: sceneImages.act3_lethal_elias_order,
      eliasLethalDeclared: scenes.act3_lethal_elias_order && scenes.act3_lethal_elias_order.image,
      eliasLethalResolved: resolveSceneImage("act3_lethal_elias_order", scenes.act3_lethal_elias_order),
      miraMapped: sceneImages.romance_mira_1,
      miraDeclared: scenes.romance_mira_1 && scenes.romance_mira_1.image,
      miraResolved: resolveSceneImage("romance_mira_1", scenes.romance_mira_1)
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("act3_lethal_elias_sealant image resolve wrote run state");
  if (!fixture.eliasAlive) errors.push("fresh run lost living Elias before lethal-sealant resolve");
  if (!String(fixture.livingText || "").includes("cartridges")) {
    errors.push("act3_lethal_elias_sealant living text no longer fires the sealant cartridges");
  }
  if (!String(fixture.livingText || "").includes("Elias")) {
    errors.push("act3_lethal_elias_sealant living roster text is no longer Elias");
  }
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`act3_lethal_elias_sealant ${field} still uses the quiet seated cup plate ${forbidden}`);
    }
    if (fixture[field] === quietCup) {
      errors.push(`act3_lethal_elias_sealant ${field} still uses the seated rest plate ${quietCup}`);
    }
    if (fixture[field] === officialPortrait) {
      errors.push(`act3_lethal_elias_sealant ${field} still uses the standing portrait ${officialPortrait} for sealant work`);
    }
    if (fixture[field] !== expected) {
      errors.push(`act3_lethal_elias_sealant ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  for (const field of ["bondMapped", "bondDeclared", "bondResolved"]) {
    if (fixture[field] !== forbidden) {
      errors.push(`bond_elias ${field} is ${fixture[field] || "missing"}; expected ${forbidden}`);
    }
  }
  const prior = {
    // HITL wire priors (MEASURE_LIVE_VS_HITL_88 + OWNER): match tip state.js staged plates.
    lenaMapped: "images/romance_lena_1.jpg",
    lenaDeclared: "images/romance_lena_1.jpg",
    lenaResolved: "images/romance_lena_1.jpg",
    amaraMapped: "images/hydroponics.jpg",
    amaraDeclared: "images/hydroponics.jpg",
    amaraResolved: "images/hydroponics.jpg",
    eliasTetherMapped: "images/act2_tether_hand_elias.jpg",
    eliasTetherDeclared: "images/act2_tether_hand_elias.jpg",
    eliasTetherResolved: "images/act2_tether_hand_elias.jpg",
    eliasLethalMapped: "images/act3_lethal_elias_order.jpg",
    eliasLethalDeclared: "images/act3_lethal_elias_order.jpg",
    eliasLethalResolved: "images/act3_lethal_elias_order.jpg",
    miraMapped: "images/quiet_mira.jpg",
    miraDeclared: "images/quiet_mira.jpg",
    miraResolved: "images/quiet_mira.jpg"
  };
  for (const [field, image] of Object.entries(prior)) {
    if (fixture[field] !== image) {
      errors.push(`prior ART-R2 ${field} is ${fixture[field] || "missing"}; expected ${image}`);
    }
  }
  const dead = runtime.evaluate(`(() => {
    resetRunState();
    state.dead.push("elias");
    const before = JSON.stringify(state);
    const resolved = resolveSceneImage("act3_lethal_elias_sealant", scenes.act3_lethal_elias_sealant);
    return { resolved, wroteState: JSON.stringify(state) !== before, eliasAlive: isAlive("elias") };
  })()`);
  if (dead.wroteState) errors.push("dead Elias lethal-sealant resolve wrote run state");
  if (dead.eliasAlive) errors.push("dead Elias lethal-sealant fixture still reports living Elias");
  if (dead.resolved !== deadFallback) {
    errors.push(`dead Elias lethal-sealant resolved to ${dead.resolved || "missing"}; expected ${deadFallback}`);
  }
  if (dead.resolved === expected || dead.resolved === forbidden) {
    errors.push("dead Elias lethal-sealant still shows a living Elias plate");
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Elias sealant leftover plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function romanceMira1ImageTruthChecks(runtime) {
  const errors = [];
  const expected = "images/quiet_mira.jpg";
  const forbidden = "images/shower_mira.jpg";
  const faceReveal = "images/romance_mira_1.jpg";
  const linger = "images/shower_mira.jpg";
  const expectedHashes = {
    // Stage zip intentionally refreshed quiet_mira HITL bytes — pin tip hash, do not revert JPEG.
    "images/quiet_mira.jpg": "8a4ce93e09534f2140df9d4e2270652ff610cd2b20f63cc7495c5ed11eb05ae0",
    "images/shower_mira.jpg": "1ddbff58230148475bc2b8e43512e57381e488473e10304eac18ff01f32cccdb", // SUN-HITL-LATE-SIX-01: owner-approved Grok card XCckB (was the as-is plate)
    "images/mira.jpg": "92eb569e8aec269c43c175d0082c22f27bc0a385f588f28aaa4d515790ac0bf2",
    "images/bodysuit_mira.jpg": "8b902308cd93489332629b004ec17e5a7b9675d9ae006391554c82690193229b",
    "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf"
  };
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const id = "romance_mira_1";
    const before = JSON.stringify(state);
    const row = {
      mapped: sceneImages[id],
      declared: scenes[id] && scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id]),
      showerMapped: sceneImages.mira_shower,
      showerDeclared: scenes.mira_shower && scenes.mira_shower.image,
      showerResolved: resolveSceneImage("mira_shower", scenes.mira_shower),
      lenaMapped: sceneImages.romance_lena_1,
      lenaDeclared: scenes.romance_lena_1 && scenes.romance_lena_1.image,
      lenaResolved: resolveSceneImage("romance_lena_1", scenes.romance_lena_1),
      amaraMapped: sceneImages.romance_amara_1,
      amaraDeclared: scenes.romance_amara_1 && scenes.romance_amara_1.image,
      amaraResolved: resolveSceneImage("romance_amara_1", scenes.romance_amara_1),
      eliasTetherMapped: sceneImages.act2_tether_hand_elias,
      eliasTetherDeclared: scenes.act2_tether_hand_elias && scenes.act2_tether_hand_elias.image,
      eliasTetherResolved: resolveSceneImage("act2_tether_hand_elias", scenes.act2_tether_hand_elias),
      eliasLethalMapped: sceneImages.act3_lethal_elias_order,
      eliasLethalDeclared: scenes.act3_lethal_elias_order && scenes.act3_lethal_elias_order.image,
      eliasLethalResolved: resolveSceneImage("act3_lethal_elias_order", scenes.act3_lethal_elias_order)
    };
    return { ...row, wroteState: JSON.stringify(state) !== before };
  })()`);
  if (fixture.wroteState) errors.push("romance_mira_1 image resolve wrote run state");
  for (const field of ["mapped", "declared", "resolved"]) {
    if (fixture[field] === forbidden) {
      errors.push(`romance_mira_1 ${field} still uses the premature shower plate ${forbidden}`);
    }
    if (fixture[field] === faceReveal) {
      errors.push(`romance_mira_1 ${field} wired the face-revealing plate ${faceReveal}`);
    }
    if (fixture[field] !== expected) {
      errors.push(`romance_mira_1 ${field} image is ${fixture[field] || "missing"}; expected ${expected}`);
    }
  }
  for (const field of ["showerMapped", "showerDeclared", "showerResolved"]) {
    if (fixture[field] !== linger) {
      errors.push(`mira_shower ${field} is ${fixture[field] || "missing"}; expected ${linger}`);
    }
  }
  const prior = {
    // HITL wire priors (MEASURE_LIVE_VS_HITL_88 + OWNER): match tip state.js staged plates.
    lenaMapped: "images/romance_lena_1.jpg",
    lenaDeclared: "images/romance_lena_1.jpg",
    lenaResolved: "images/romance_lena_1.jpg",
    amaraMapped: "images/hydroponics.jpg",
    amaraDeclared: "images/hydroponics.jpg",
    amaraResolved: "images/hydroponics.jpg",
    eliasTetherMapped: "images/act2_tether_hand_elias.jpg",
    eliasTetherDeclared: "images/act2_tether_hand_elias.jpg",
    eliasTetherResolved: "images/act2_tether_hand_elias.jpg",
    eliasLethalMapped: "images/act3_lethal_elias_order.jpg",
    eliasLethalDeclared: "images/act3_lethal_elias_order.jpg",
    eliasLethalResolved: "images/act3_lethal_elias_order.jpg"
  };
  for (const [field, image] of Object.entries(prior)) {
    if (fixture[field] !== image) {
      errors.push(`prior ART-R2 ${field} is ${fixture[field] || "missing"}; expected ${image}`);
    }
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Mira leftover plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function lenaIntimacyImageTruthChecks(runtime) {
  const errors = [];
  const expected = {
    romance_lena_sex: "images/afterglow_lena.jpg",
    pursuit_lena_sex: "images/pursuit_lena.jpg",
    lena_shower: "images/shower_lena.jpg",
    lena_rear: "images/rear_lena.jpg"
  };
  const expectedHashes = {
    "images/afterglow_lena.jpg": "96f8c6a1ad9164d3765c2be922d40322e80546fbcbe015284c2a1c30b162f841",
    "images/pursuit_lena.jpg": "f334ebe2a5f8a653033d702eb52c34dfaa546398cfb96b9b9bf3d2db97ce0ec5",
    "images/shower_lena.jpg": "cd0981c0d0e8b31f589658a77591aa73996547707567016d0f6a2a4f119cd097",
    "images/rear_lena.jpg": "b93c42a63fcdb1988000142c39a0a5d0f690989818462e858c39d745e1567fff"
  };
  const fixture = runtime.evaluate(`(() => {
    const ids = ["romance_lena_sex", "pursuit_lena_sex", "lena_shower", "lena_rear"];
    return Object.fromEntries(ids.map(id => [id, {
      mapped: sceneImages[id],
      declared: scenes[id].image,
      resolved: resolveSceneImage(id, scenes[id])
    }]));
  })()`);

  for (const [id, image] of Object.entries(expected)) {
    const row = fixture[id];
    for (const field of ["mapped", "declared", "resolved"]) {
      if (row?.[field] !== image) {
        errors.push(`${id} ${field} image is ${row?.[field] || "missing"}; expected ${image}`);
      }
    }
  }
  for (const [image, expectedHash] of Object.entries(expectedHashes)) {
    const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actualHash !== expectedHash) errors.push(`locked Lena plate drifted: ${image} sha256=${actualHash}`);
  }
  return errors;
}

export function tetherRushImageTruthChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => ({
    sighting: {
      mapped: sceneImages.act2_tether_sighting,
      declared: scenes.act2_tether_sighting.image,
      resolved: resolveSceneImage("act2_tether_sighting", scenes.act2_tether_sighting)
    },
    rush: {
      mapped: sceneImages.act2_tether_rush,
      declared: scenes.act2_tether_rush.image,
      resolved: resolveSceneImage("act2_tether_rush", scenes.act2_tether_rush)
    }
  }))()`);
  const expected = {
    sighting: "images/debris_field.jpg",
    rush: "images/tether_ride.jpg"
  };

  for (const [scene, image] of Object.entries(expected)) {
    for (const field of ["mapped", "declared", "resolved"]) {
      if (fixture[scene]?.[field] !== image) {
        errors.push(`act2_tether_${scene} ${field} image is ${fixture[scene]?.[field] || "missing"}; expected ${image}`);
      }
    }
  }
  if (fixture.sighting.resolved === fixture.rush.resolved) {
    errors.push("act2_tether_rush still repeats the act2_tether_sighting plate");
  }
  const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, expected.rush))).digest("hex");
  const expectedHash = "7961187200068efe1938de5a110d0a30f673be212e8aaf0694e0650e3a506c34";
  if (actualHash !== expectedHash) errors.push(`locked tether ride plate drifted: ${expected.rush} sha256=${actualHash}`);
  return errors;
}

export function act3SpineImageRepeatChecks(runtime) {
  const errors = [];
  const expected = "images/corridor_variant_2.jpg";
  const fixture = runtime.evaluate(`(() => {
    const hub = "act3_spine_next";
    const prepare = status => {
      localStorage.clear();
      resetRunState();
      state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
      if (status === "dead") { kill("vess", "image fixture"); kill("sela", "image fixture"); }
      if (status === "unrecovered") state.recovered.vess = false;
    };
    const snapshot = () => ({ id: state.scene, image: document.getElementById("scene-image").src });
    const sequences = [];
    for (const status of ["living", "dead"]) {
      for (const order of [["warmth_music", "warmth_laughter"], ["warmth_laughter", "warmth_music"]]) {
        prepare(status);
        showScene(hub);
        const frames = [snapshot()];
        for (const id of order) {
          const choice = scenes[hub].choices.find(choice => choice.next === id);
          if (!choice) { frames.push({ id: "missing offer", image: null }); break; }
          makeChoice(choice);
          frames.push(snapshot());
          makeChoice(scenes[id].choices[0]);
          frames.push(snapshot());
        }
        sequences.push({ status, order, frames });
      }
    }
    const resumes = [];
    for (const status of ["living", "dead", "unrecovered"]) {
      for (const id of [hub, "warmth_music", "warmth_laughter"]) {
        prepare(status);
        // Resume fixtures deliberately bypass entry, including an unavailable Vess save.
        showScene(id, { skipOnEnter: true, resume: true });
        const before = JSON.stringify(state);
        const saved = persistSave({ silent: true });
        const raw = localStorage.getItem("sunsplitter_save_v3");
        resetRunState();
        const loaded = loadGame();
        resumes.push({ status, expectedId: id, saved, loaded, ...snapshot(),
          stable: JSON.stringify(state) === before && localStorage.getItem("sunsplitter_save_v3") === raw });
      }
    }
    const debt = ["living", "dead"].map(status => {
      prepare(status);
      showScene("debt_notice");
      const before = snapshot();
      makeChoice(scenes.debt_notice.choices[0]);
      return { status, before, after: snapshot() };
    });
    prepare("unrecovered");
    showScene(hub);
    return { sequences, resumes, debt, unrecoveredEntry: snapshot(),
      mapped: sceneImages[hub], declared: scenes[hub].image };
  })()`);
  for (const field of ["mapped", "declared"]) {
    if (fixture[field] !== expected) errors.push(`act3_spine_next ${field} must use ${expected}`);
  }
  for (const row of fixture.sequences) {
    const ids = ["act3_spine_next", row.order[0], "act3_spine_next", row.order[1], "act3_spine_next"];
    if (JSON.stringify(row.frames.map(frame => frame.id)) !== JSON.stringify(ids)) {
      errors.push(`act3 hub/warmth route changed: ${JSON.stringify(row)}`);
    }
    for (let i = 0; i < row.frames.length; i++) {
      if (row.frames[i].id === "act3_spine_next" && row.frames[i].image !== expected) {
        errors.push(`act3 hub rendered wrong plate in ${row.status} sequence`);
      }
      if (i && row.frames[i].image === row.frames[i - 1].image) {
        errors.push(`consecutive act3 image repeat: ${row.frames[i - 1].id} -> ${row.frames[i].id}`);
      }
    }
  }
  for (const row of fixture.resumes) {
    // corridor.jpg shows Vess (SUN-PLATE-FACES-05): warmth scenes keep it only while she is aboard;
    // otherwise the empty berth-row plate (SUN-ART-R2-FALLBACKS-01).
    const image = row.expectedId === "act3_spine_next" ? expected
      : (row.status === "living" ? "images/corridor.jpg" : "images/art_r2_empty_berths.jpg");
    if (!row.saved || !row.loaded || !row.stable || row.id !== row.expectedId || row.image !== image) {
      errors.push(`act3 image-only resume changed state or image: ${JSON.stringify(row)}`);
    }
  }
  for (const row of fixture.debt) {
    if (row.after.id !== "act3_spine_next" || row.after.image !== expected || row.before.image === row.after.image) {
      errors.push(`debt return repeats hub plate or changes exit: ${JSON.stringify(row)}`);
    }
  }
  // SUN-HITL-SHADOW-02: vess_signal renders its owner-approved plate (Mira and Elias at the signal, no Vess).
  if (fixture.unrecoveredEntry.id !== "vess_signal" || fixture.unrecoveredEntry.image !== "images/vess_signal.jpg") {
    errors.push("unrecovered Vess hub entry no longer redirects before painting the hub");
  }
  const hash = createHash("sha256").update(readFileSync(resolve(ROOT, expected))).digest("hex");
  if (hash !== "b1320c8eb2445272fa49599169f18a506a69e7b755dcdd88ba33c8db106d401e") {
    errors.push(`act3 reused empty-corridor bytes drifted: ${hash}`);
  }
  return errors;
}

export function offshiftVessImageTruthChecks(runtime) {
  const errors = [];
  const expected = "images/vess.jpg";
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const absentOffer = scenes.offshift_open.choices.some(choice => choice.next === "offshift_vess");
    state.recovered.vess = true;
    state.dead.push("vess");
    const deadOffer = scenes.offshift_open.choices.some(choice => choice.next === "offshift_vess");
    const rows = [false, true].map(romanced => {
      localStorage.clear();
      resetRunState();
      state.recovered.vess = true;
      state.romance.vess = romanced;
      state.crisisPath = "breath";
      showScene("offshift_open");
      const offered = scenes.offshift_open.choices.find(choice => choice.next === "offshift_vess");
      if (!offered) return { romanced, offered: false };
      makeChoice(offered);
      const rendered = document.getElementById("scene-image").src;
      const before = JSON.stringify(state);
      showScene("offshift_vess", { skipOnEnter: true });
      const stableRender = JSON.stringify(state) === before;
      const saved = persistSave({ silent: true });
      const raw = localStorage.getItem("sunsplitter_save_v3");
      resetRunState();
      const loaded = loadGame();
      return { romanced, offered: true, rendered, stableRender, saved, loaded,
        scene: state.scene, alive: isAlive("vess"),
        mapped: sceneImages.offshift_vess, declared: scenes.offshift_vess.image,
        resolved: resolveSceneImage("offshift_vess", scenes.offshift_vess),
        resumed: document.getElementById("scene-image").src,
        alt: document.getElementById("scene-image").alt,
        exactSave: localStorage.getItem("sunsplitter_save_v3") === raw,
        exits: scenes.offshift_vess.choices.map(choice => choice.next) };
    });
    const unavailable = ["unrecovered", "dead"].map(status => {
      localStorage.clear();
      resetRunState();
      state.recovered.vess = status === "dead";
      if (status === "dead") kill("vess", "image regression fixture");
      showScene("offshift_vess", { skipOnEnter: true });
      const rendered = document.getElementById("scene-image").src;
      const saved = persistSave({ silent: true });
      resetRunState();
      const loaded = loadGame();
      return { status, saved, loaded, rendered,
        resumed: document.getElementById("scene-image").src };
    });
    return { absentOffer, deadOffer, rows, unavailable };
  })()`);
  if (fixture.absentOffer || fixture.deadOffer) errors.push("Off-Shift offered absent/dead Vess");
  for (const row of fixture.rows) {
    if (!row.offered || !row.alive || row.scene !== "offshift_vess" ||
        !row.stableRender || !row.saved || !row.loaded || !row.exactSave) {
      errors.push(`Off-Shift Vess entry/render/resume failed: ${JSON.stringify(row)}`);
    }
    for (const field of ["mapped", "declared", "resolved", "rendered", "resumed"]) {
      if (row[field] !== expected) errors.push(`offshift_vess ${field} must use the official Vess portrait; got ${row[field]}`);
    }
    if (row.alt !== "Portrait of Vess.") errors.push("Off-Shift Vess portrait alternative drifted");
    // SUN-ROMANCE-ARC-03: a partner also gets "Solve it." -> vess_item_two; the three existing exits stay.
    const existingExits = row.exits?.filter(next => next === "faction_split") || [];
    const extraExits = row.exits?.filter(next => next !== "faction_split") || [];
    if (existingExits.length !== 3 || JSON.stringify(extraExits) !== JSON.stringify(row.romanced ? ["vess_item_two"] : [])) {
      errors.push("Off-Shift Vess existing exits changed");
    }
  }
  for (const row of fixture.unavailable) {
    if (!row.saved || !row.loaded || row.rendered !== "images/corridor_variant_2.jpg" ||
        row.resumed !== "images/corridor_variant_2.jpg") {
      errors.push(`Off-Shift portrait asserted unavailable Vess: ${JSON.stringify(row)}`);
    }
  }
  const actualHash = createHash("sha256").update(readFileSync(resolve(ROOT, expected))).digest("hex");
  if (actualHash !== "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf") {
    errors.push(`official Vess portrait bytes drifted: ${actualHash}`);
  }
  return errors;
}

export function vessHairCanonChecks(runtime) {
  const errors = [];
  const boardingText = runtime.evaluate(`(() => {
    resetRunState(); state.recovered.vess = true;
    return String(scenes.vess_boarding.text());
  })()`);

  if (!boardingText.includes("Long white-silver hair")) {
    errors.push("Vess boarding prose does not preserve the locked white-silver hair identity");
  }
  if (/long dark hair|knife at the jawline/i.test(boardingText)) {
    errors.push("Vess boarding prose still renders the retired dark knife-cut hair description");
  }
  return errors;
}

export function arcLivingImageTruthChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    return {
      mapped: sceneImages.arc_living_2,
      resolved: resolveSceneImage("arc_living_2", scenes.arc_living_2),
      text: String(scenes.arc_living_2.text)
    };
  })()`);

  if (fixture.mapped !== "images/sela_ritual.jpg") {
    errors.push(`arc_living_2 maps to ${fixture.mapped || "no image"} instead of the locked yellow-mark plate`);
  }
  if (fixture.resolved !== "images/sela_ritual.jpg") {
    errors.push(`arc_living_2 resolves to ${fixture.resolved || "no image"} instead of the locked yellow-mark plate`);
  }
  if (!fixture.text.includes("yellow circle") || !fixture.text.includes("plate")) {
    errors.push("arc_living_2 no longer contains the authored yellow-mark action matched by its plate");
  }
  return errors;
}

export function remainingArcLivingTruthChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const inspect = ({ dead = [], recoverTomas = true, conflictMark = null } = {}) => {
      resetRunState();
      state.recovered.tomas = recoverTomas;
      state.recovered.jiro = true;
      for (const who of dead) kill(who, "fixture");
      if (conflictMark) mark("conflict", conflictMark);
      return {
        arc1Image: resolveSceneImage("arc_living_1", scenes.arc_living_1),
        arc1Text: String(scenes.arc_living_1.text),
        arc3Image: resolveSceneImage("arc_living_3", scenes.arc_living_3),
        arc3Text: String(scenes.arc_living_3.text),
        arc4Image: resolveSceneImage("arc_living_4", scenes.arc_living_4),
        arc4Text: String(scenes.arc_living_4.text)
      };
    };
    return {
      living: inspect(),
      unrecoveredTomas: inspect({ recoverTomas: false }),
      deadTomas: inspect({ dead: ["tomas"] }),
      deadAmara: inspect({ dead: ["amara"] }),
      deadMira: inspect({ dead: ["mira"] }),
      deadElias: inspect({ dead: ["elias"] }),
      deadMiraAndElias: inspect({ dead: ["mira", "elias"] }),
      heldDeadTomas: inspect({ dead: ["tomas"], conflictMark: "held" }),
      backedDeadElias: inspect({ dead: ["elias"], conflictMark: "backed" })
    };
  })()`);

  if (fixture.living.arc1Image !== "images/hydroponics.jpg" || fixture.deadAmara.arc1Image !== "images/hydroponics.jpg") {
    errors.push("arc_living_1 no longer resolves to its roster-ambiguous hydroponics plate");
  }
  if (!fixture.living.arc1Text.includes("Amara Vale") || fixture.deadAmara.arc1Text.includes("Amara Vale")) {
    errors.push("arc_living_1 text does not follow Amara living/dead state");
  }

  // HITL stage basename wins (MEASURE_LIVE_VS_HITL_88 + OWNER): arc_living_3.jpg over prior conflict plate.
  if (fixture.living.arc3Image !== "images/arc_living_3.jpg") {
    errors.push(`arc_living_3 living roster resolves to ${fixture.living.arc3Image || "no image"} instead of its locked conflict plate`);
  }
  for (const [label, row] of Object.entries({
    unrecoveredTomas: fixture.unrecoveredTomas,
    deadTomas: fixture.deadTomas,
    deadAmara: fixture.deadAmara,
    deadMira: fixture.deadMira
  })) {
    if (row.arc3Image !== "images/corridor_variant_2.jpg") {
      errors.push(`arc_living_3 ${label} state resolves to ${row.arc3Image || "no image"} instead of the roster-safe corridor plate`);
    }
  }
  if (!fixture.living.arc3Text.includes("Mira and Elias argue")) {
    errors.push("arc_living_3 living default dispute lost Mira/Elias presence");
  }
  if (fixture.deadMira.arc3Text.includes("Mira") || !fixture.deadMira.arc3Text.includes("Elias argues")) {
    errors.push("arc_living_3 dead-Mira dispute text is not roster-truthful");
  }
  if (fixture.deadElias.arc3Text.includes("Elias") || !fixture.deadElias.arc3Text.includes("Mira argues")) {
    errors.push("arc_living_3 dead-Elias dispute text is not roster-truthful");
  }
  if (/\b(?:Mira|Elias)\b/.test(fixture.deadMiraAndElias.arc3Text)) {
    errors.push("arc_living_3 names Mira or Elias when both are dead");
  }

  // SUN-PLATE-FACES-06: corridor_pressure_2.jpg is the owner-approved HITL Tomas plate (#71), no longer
  // roster-ambiguous. It renders with Tomas aboard and alive; otherwise the empty corridor fallback.
  if (fixture.living.arc4Image !== "images/corridor_pressure_2.jpg" ||
      fixture.heldDeadTomas.arc4Image !== "images/corridor_variant_3.jpg" ||
      fixture.unrecoveredTomas.arc4Image !== "images/corridor_variant_3.jpg") {
    errors.push("arc_living_4 plate does not follow Tomas: corridor_pressure_2 while he is aboard, empty corridor otherwise");
  }
  if (fixture.heldDeadTomas.arc4Text.includes("Tomas") || fixture.backedDeadElias.arc4Text.includes("Elias")) {
    errors.push("arc_living_4 conflict callbacks do not follow living/dead state");
  }
  return errors;
}

export function warmthMealPresenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const inspect = setup => {
      resetRunState();
      setup();
      const redirect = scenes.warmth_meal.onEnter();
      return {
        redirect: redirect || null,
        consumed: !!state.flags.warmth_meal,
        text: scenes.warmth_meal.text,
        choices: scenes.warmth_meal.choices.map(choice => choice.next)
      };
    };
    return {
      missing: inspect(() => {}),
      dead: inspect(() => {
        state.recovered.tomas = true;
        kill("tomas", "fixture");
      }),
      living: inspect(() => {
        state.recovered.tomas = true;
      })
    };
  })()`);

  for (const [label, result] of [["unrecovered", fixture.missing], ["dead", fixture.dead]]) {
    if (result.redirect !== "act3_spine_next") errors.push(`${label} Tomas does not redirect warmth_meal`);
    if (result.consumed) errors.push(`${label} Tomas consumes the warmth_meal one-shot`);
  }
  if (fixture.living.redirect !== null || !fixture.living.consumed) {
    errors.push("living recovered Tomas no longer enters and consumes warmth_meal");
  }
  if (!fixture.living.text.includes("Tomas serves everyone") || !fixture.living.text.includes("One for the soil")) {
    errors.push("living Tomas warmth_meal prose changed or disappeared");
  }
  if (fixture.living.choices.length !== 2 || fixture.living.choices.some(next => next !== "act3_spine_next")) {
    errors.push("warmth_meal no longer preserves both exits to act3_spine_next");
  }
  return errors;
}

export function cutOutPresenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.affinity.elias = 20;
    const before = {
      recovered: isRecovered("jiro"),
      alive: isAlive("jiro"),
      affinity: state.affinity.jiro,
      text: scenes.cut_out.text
    };
    const choice = scenes.crisis.choices.find(item => item.next === "cut_out");
    makeChoice(choice);
    return {
      before,
      after: {
        scene: state.scene,
        jiroAffinity: state.affinity.jiro,
        amaraAffinity: state.affinity.amara,
        selaAffinity: state.affinity.sela,
        eliasAffinity: state.affinity.elias
      }
    };
  })()`);

  if (fixture.before.recovered || fixture.before.alive) {
    errors.push("early-crisis ET-02 fixture unexpectedly has Jiro present");
  }
  if (/third body|Jiro/i.test(fixture.before.text)) {
    errors.push("cut_out prose implies unrecovered Jiro was present in the lower ring");
  }
  if (fixture.after.jiroAffinity !== fixture.before.affinity) {
    errors.push(`cut_out choice changed unrecovered Jiro affinity ${fixture.before.affinity} -> ${fixture.after.jiroAffinity}`);
  }
  if (fixture.after.scene !== "cut_out" || fixture.after.amaraAffinity !== 10 || fixture.after.selaAffinity !== 10 || fixture.after.eliasAffinity !== 14) {
    errors.push("cut_out presence repair changed the authored route or present-crew affinity effects");
  }
  return errors;
}
