import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// SUN-PLAYTEST-ART-EVENT-AUDIT-01. Audit table + one in-tree retarget +
// Grok brief stubs. No new image bytes. No ART-R2 binary campaign.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_TREE = "de4c3687cf4c89309d3422505dba4b45a32adc7e";
const AUDIT_PATH = "artifacts/SUN_PLAYTEST_ART_EVENT_AUDIT_01.md";
const BRIEFS_PATH = "artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md";
const PLAN_PATH = "artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md";
const ROADMAP_PATH = "artifacts/ROADMAP.md";
const STYLE_BIBLE_PATH = "artifacts/SUN_ART_STYLE_BIBLE.md";
const STANDING_RULE_NEEDLES = [
  "Unique plate per event beat — never official portrait as stand-in.",
  "Identity refs: official face + bodysuit",
  "Style bible paragraph",
  "Full event prose / beat verb",
  "Body + facial language",
  "Ban neutral portrait pose",
  "PASS/HOLD/REJECT"
];
const IDENTITY_LOCK_NEEDLES = [
  "### Portrait identity-lock (standing)",
  "official **bodysuit portrait path**",
  "same face geometry, age, skin, hairline, eye shape, scars/marks",
  "No beautify, no age shift, no ethnicity swap",
  "Bodysuit silhouette matches that reference unless this beat explicitly changes clothes",
  "Must appear:",
  "Must not:",
  '"generic crew."',
  "thumbnail size",
  "Sole face reference path:"
];
const PLAN_NEEDLES = [
  "Not a version mint",
  "Does not open 0.36",
  "Art–event match",
  "SUN-ART-BODY-REFERENCE-01",
  "Style bible lock",
  "grok.com",
  "SUN_ART_STYLE_BIBLE.md",
  "Grok plate batch",
  "Crew count + flex name buttons + full-screen crew character sheet",
  "Art double-click minimize restore",
  "Title white-space + rotating ship background",
  "Intro slides back button + intro art",
  "Tutorial covers 5 top fields",
  "Amara romance trigger repro",
  "Crew conflict events",
  "Light commander creation",
  "Ending cinematic art",
  "LANDED ON VERSION LANE",
  "Last certified remains `0.28.1d`",
  "NO-PUBLISH",
  "a91a26d"
];
const BODY_REF_IDS = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
const BODY_REF_NEEDLES = [
  "SUN-ART-BODY-REFERENCE-01",
  "No commander body plate",
  "body_ref_<id>_front.jpg",
  "body_ref_<id>_back.jpg",
  "vess.jpg` only",
  "underwear"
];
const ROADMAP_NEEDLES = [
  "### Playtest response (post-0.35, pre-0.36)",
  "SUN_PLAYTEST_RESPONSE_PLAN.md",
  "SUN-ART-BODY-REFERENCE-01",
  "SUN_ART_STYLE_BIBLE.md",
  "Do not mint or open 0.36"
];
const STYLE_BIBLE_NEEDLES = [
  "## Medium",
  "## Lighting",
  "## Palette",
  "## Lens",
  "## Sharpness / grain",
  "## Ban list",
  "## How to attach style anchors (grok.com)",
  "784×1168",
  "Do not generate plates in Cursor"
];
const GROK_STUBS = [
  "romance_lena_1", "romance_mira_1", "romance_amara_1",
  "pursuit_lena", "pursuit_amara", "prom_make_lena_ag",
  "bond_tomas", "hold_bolts_again", "warmth_meal", "vess_boarding",
  "past_leak", "ending_landfall",
  "cinematic_intro_1", "cinematic_intro_2", "cinematic_intro_3"
];
const FACE_REVEAL = [
  "images/romance_lena_1.jpg",
  "images/romance_mira_1.jpg",
  "images/romance_amara_1.jpg"
];
const LOCKED_HASHES = {
  "images/quiet_mira.jpg": "27518fd30d22c578eca8fb2b3a775ca6a77c6b4da4486fb0b2a5a39d81d0cf3c",
  "images/mira.jpg": "92eb569e8aec269c43c175d0082c22f27bc0a385f588f28aaa4d515790ac0bf2",
  "images/hydroponics.jpg": "00ab1cb40167e3b2882e2c1ebe02964898c52e7aa04ab8fb94f8beecb99a8960",
  "images/observation_bridge_alt_2.jpg": "bd39f540276e44b9c5c8d26da9f7e7fe7b8f5e19d6e15861ca4de07485bb8a55",
  "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf",
  "images/vess_boarding.jpg": "f39f2f2609742d41a371abf039bbee29a67ad803111c952c22676b3a34401a5a",
  "images/corridor_variant.jpg": "720c6c345c63725818971f42a880a9a2baffebcfbb94e574f7391746403823f9"
};

function git(args) {
  const result = spawnSync("git", args, {
    cwd: ROOT, encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" }
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || args.join(" "));
  return result.stdout.trim();
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(resolve(ROOT, relativePath))).digest("hex");
}

function sourceErrors() {
  const errors = [];
  const stateSource = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  const engineSource = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const bondSource = readFileSync(resolve(ROOT, "src/scenes-30.js"), "utf8");
  const livingCastSource = readFileSync(resolve(ROOT, "src/scenes-55.js"), "utf8");
  const audit = readFileSync(resolve(ROOT, AUDIT_PATH), "utf8");
  const briefs = readFileSync(resolve(ROOT, BRIEFS_PATH), "utf8");
  const plan = readFileSync(resolve(ROOT, PLAN_PATH), "utf8");
  const roadmap = readFileSync(resolve(ROOT, ROADMAP_PATH), "utf8");
  const styleBible = readFileSync(resolve(ROOT, STYLE_BIBLE_PATH), "utf8");

  if (!/bond_mira:\s+"images\/quiet_mira\.jpg"/.test(stateSource)) {
    errors.push("state.js bond_mira is not quiet_mira.jpg");
  }
  if (stateSource.includes('bond_mira:        "images/mira.jpg"')) {
    errors.push("state.js bond_mira still on official portrait stand-in");
  }
  if (!bondSource.includes('image: "images/quiet_mira.jpg"')) {
    errors.push("bond_mira scene declaration is not quiet_mira.jpg");
  }
  if (!bondSource.includes("Mira is alone with the drive schematic")) {
    errors.push("bond_mira lost drive-schematic event text");
  }
  if (!/romance_mira_1:[\s\S]*?image: "images\/quiet_mira\.jpg"/.test(bondSource)) {
    errors.push("romance_mira_1 living stand-in must stay quiet_mira.jpg until Grok PASS");
  }
  if (!/romance_amara_1:[\s\S]*?image: "images\/hydroponics\.jpg"/.test(bondSource)) {
    errors.push("romance_amara_1 living stand-in must stay hydroponics.jpg until Grok PASS");
  }
  if (!stateSource.includes('romance_lena_1:      "images/observation_bridge_alt_2.jpg"')) {
    errors.push("romance_lena_1 map drifted off blister stand-in");
  }
  if (!stateSource.includes('vess_boarding:        "images/vess_boarding.jpg"')) {
    errors.push("vess_boarding unwired; discarded-plate campaign is forbidden on this ticket");
  }
  if (!livingCastSource.includes('requireLivingCast(`bond_${who}`, [who], "intimacy_window", { entryOnly: true })')) {
    errors.push("bond_* living-cast entryOnly contract drifted");
  }
  if (!livingCastSource.includes('requireLivingCast("warmth_meal", ["tomas"], "act3_spine_next")')) {
    errors.push("warmth_meal Tomas living-cast drifted");
  }
  if (!engineSource.includes('setManagedImageSource(img, "images/onboarding_background.jpg")')) {
    errors.push("intro cinematic bookend plate drifted");
  }
  if (!engineSource.includes('art = "images/ending_landfall.jpg"')) {
    errors.push("Landfall ending art selection drifted");
  }
  for (const plate of FACE_REVEAL) {
    if (stateSource.includes(`"${plate}"`) || engineSource.includes(`"${plate}"`) || bondSource.includes(`image: "${plate}"`)) {
      errors.push(`runtime still wires face-revealing plate ${plate}`);
    }
  }

  for (const needle of STANDING_RULE_NEEDLES) {
    if (!audit.includes(needle)) errors.push(`audit missing standing-rule needle: ${needle}`);
    if (!briefs.includes(needle)) errors.push(`briefs template missing standing-rule needle: ${needle}`);
  }
  const AUDIT_IDENTITY_LOCK_NEEDLES = IDENTITY_LOCK_NEEDLES.filter((needle) => (
    needle !== "Must appear:" && needle !== "Must not:" && needle !== "Sole face reference path:"
  ));
  for (const needle of AUDIT_IDENTITY_LOCK_NEEDLES) {
    if (!audit.includes(needle)) errors.push(`audit missing identity-lock needle: ${needle}`);
    if (!briefs.includes(needle)) errors.push(`briefs template missing identity-lock needle: ${needle}`);
  }
  if (!audit.includes("SUN_PLAYTEST_RESPONSE_PLAN.md")) {
    errors.push("audit missing playtest-response plan pointer");
  }
  for (const needle of PLAN_NEEDLES) {
    if (!plan.includes(needle)) errors.push(`playtest response plan missing needle: ${needle}`);
  }
  for (const needle of ROADMAP_NEEDLES) {
    if (!roadmap.includes(needle)) errors.push(`ROADMAP missing playtest-response needle: ${needle}`);
  }
  for (const needle of STYLE_BIBLE_NEEDLES) {
    if (!styleBible.includes(needle)) errors.push(`style bible missing needle: ${needle}`);
  }
  if (!plan.includes("body_ref front/back pack comes **after** that style lock")) {
    errors.push("plan missing style-lock-before-body_ref rule");
  }
  if (!audit.includes("SUN_ART_STYLE_BIBLE.md")) {
    errors.push("audit missing style-bible pointer");
  }
  for (const needle of BODY_REF_NEEDLES) {
    if (!audit.includes(needle) && !plan.includes(needle)) {
      errors.push(`audit/plan missing body-ref pack needle: ${needle}`);
    }
  }
  for (const id of BODY_REF_IDS) {
    for (const side of ["front", "back"]) {
      const planned = `images/body_ref_${id}_${side}.jpg`;
      if (!plan.includes(planned)) errors.push(`plan missing living-cast body_ref path: ${planned}`);
    }
    if (new RegExp(`images/body_ref_${id}\\.jpg`).test(plan)) {
      errors.push(`plan still uses singular body_ref_${id}.jpg; front and back required`);
    }
  }
  if (!audit.includes("Pack note: SUN-ART-BODY-REFERENCE-01")) {
    errors.push("audit missing SUN-ART-BODY-REFERENCE-01 pack note");
  }
  if (!plan.includes("## SUN-ART-BODY-REFERENCE-01 — living cast IDs")) {
    errors.push("plan missing living-cast body_ref ID table");
  }
  if (plan.includes("body_ref_rourke") || audit.includes("body_ref_commander") || plan.includes("body_ref_commander")) {
    errors.push("body_ref pack must not include Commander or Rourke");
  }
  if (stateSource.includes("body_ref_") || engineSource.includes("body_ref_") || bondSource.includes("body_ref_")) {
    errors.push("runtime wired a body_ref path; packing note forbids scene wiring");
  }
  for (const name of readdirSync(resolve(ROOT, "images"))) {
    if (name.startsWith("body_ref_")) errors.push(`images tree contains ${name}; this ticket must not generate body_ref bytes`);
  }
  const stubBlocks = briefs.split("## Stub: ").slice(1);
  if (stubBlocks.length !== GROK_STUBS.length) {
    errors.push(`expected ${GROK_STUBS.length} Grok stubs, found ${stubBlocks.length}`);
  }
  for (const id of GROK_STUBS) {
    const heading = `## Stub: ${id}`;
    if (!briefs.includes(heading)) errors.push(`missing Grok stub ${id}`);
  }
  for (const [index, block] of stubBlocks.entries()) {
    for (const needle of STANDING_RULE_NEEDLES) {
      if (!block.includes(needle)) {
        errors.push(`stub ${GROK_STUBS[index] || index} missing standing-rule needle: ${needle}`);
      }
    }
    if (!block.includes("body_ref front/back: NOT_APPROVED") && !block.includes("body_ref front/back: **NOT_APPROVED**")) {
      // stubs use "body_ref front/back: NOT_APPROVED"
      if (!/body_ref front\/back:\s*NOT_APPROVED/.test(block)) {
        errors.push(`stub ${GROK_STUBS[index] || index} missing body_ref NOT_APPROVED slot`);
      }
    }
    if (!block.includes("**Body + facial language**")) {
      errors.push(`stub ${GROK_STUBS[index] || index} missing body + facial language section`);
    }
    if (!block.includes("**Full event prose")) {
      errors.push(`stub ${GROK_STUBS[index] || index} missing full event prose`);
    }
    for (const needle of IDENTITY_LOCK_NEEDLES) {
      if (!block.includes(needle)) {
        errors.push(`stub ${GROK_STUBS[index] || index} missing identity-lock needle: ${needle}`);
      }
    }
    if (!/Sole face reference path:\s*none|images\/bodysuit_/.test(block)) {
      errors.push(`stub ${GROK_STUBS[index] || index} missing bodysuit sole-face path or explicit none`);
    }
  }
  if (!audit.includes("| `bond_mira`") || !audit.includes("**RETARGET_IN_TREE**")) {
    errors.push("audit table missing bond_mira RETARGET_IN_TREE row");
  }
  if (!audit.includes("| `prom_r_amara`") || !audit.includes("**ALREADY_OK**")) {
    errors.push("audit table missing prom_r_amara ALREADY_OK row");
  }
  if (!audit.includes("Amara romance non-trigger")) {
    errors.push("audit missing parked Amara romance-gate finding");
  }
  if (briefs.includes("## Stub: bond_mira") || briefs.includes("## Stub: prom_r_amara")) {
    errors.push("Grok stubs must not include RETARGET/ALREADY_OK rows");
  }

  try {
    const imagesTree = git(["rev-parse", "HEAD:images"]);
    if (imagesTree !== IMAGES_TREE) errors.push(`images tree drifted to ${imagesTree}; expected ${IMAGES_TREE}`);
  } catch (error) {
    errors.push(`images tree unavailable: ${error.message}`);
  }
  for (const [image, expected] of Object.entries(LOCKED_HASHES)) {
    const actual = sha256(image);
    if (actual !== expected) errors.push(`locked audit plate drifted: ${image} sha256=${actual}`);
  }
  return errors;
}

function runtimeErrors(runtime) {
  return runtime.evaluate(`(() => {
    const errors = [];
    const expectedBond = "images/quiet_mira.jpg";
    const deadFallback = "images/corridor_variant.jpg";
    const prior = {
      romance_lena_1: "images/observation_bridge_alt_2.jpg",
      romance_amara_1: "images/hydroponics.jpg",
      romance_mira_1: "images/quiet_mira.jpg",
      vess_boarding: "images/vess_boarding.jpg",
      warmth_meal: "images/hydroponics.jpg",
      past_leak: "images/elias.jpg",
      bond_tomas: "images/bond_tomas.jpg",
      hold_bolts_again: "images/vault.jpg",
      pursuit_lena: "images/lingerie_lena.jpg",
      pursuit_amara: "images/lingerie_amara.jpg",
      prom_make_lena_ag: "images/afterglow_lena.jpg",
      prom_r_amara: "images/quiet_amara.jpg"
    };
    resetRunState();
    state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
    const before = JSON.stringify(state);
    const mapped = sceneImages.bond_mira;
    const declared = scenes.bond_mira && scenes.bond_mira.image;
    const resolved = resolveSceneImage("bond_mira", scenes.bond_mira);
    for (const [field, value] of Object.entries({ mapped, declared, resolved })) {
      if (value !== expectedBond) errors.push("bond_mira " + field + " is " + (value || "missing") + "; expected " + expectedBond);
      if (value === "images/mira.jpg") errors.push("bond_mira " + field + " still uses official portrait stand-in");
    }
    for (const [id, image] of Object.entries(prior)) {
      const got = resolveSceneImage(id, scenes[id]);
      if (got !== image) errors.push(id + " resolved " + (got || "missing") + "; expected living stand-in " + image);
      if (Object.prototype.hasOwnProperty.call(sceneImages, id) && sceneImages[id] !== image) {
        errors.push(id + " map is " + (sceneImages[id] || "missing") + "; expected " + image);
      }
    }
    if (JSON.stringify(state) !== before) errors.push("audit resolve wrote run state");

    resetRunState();
    state.dead.push("mira");
    const beforeDead = JSON.stringify(state);
    const deadResolved = resolveSceneImage("bond_mira", scenes.bond_mira);
    if (JSON.stringify(state) !== beforeDead) errors.push("dead Mira bond_mira resolve wrote run state");
    if (isAlive("mira")) errors.push("dead Mira fixture still reports living Mira");
    if (deadResolved !== deadFallback) errors.push("dead Mira bond_mira resolved to " + (deadResolved || "missing") + "; expected " + deadFallback);
    if (deadResolved === expectedBond || deadResolved === "images/mira.jpg") {
      errors.push("dead Mira bond_mira still shows a living Mira plate");
    }

    resetRunState();
    const beforeResume = JSON.stringify(state);
    state.scene = "bond_mira";
    const saved = snapshotState();
    saved.sceneEntered = true;
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
    if (!resumeGame() || state.scene !== "bond_mira") errors.push("bond_mira Continue failed to restore scene");
    const first = document.getElementById("scene-image").src;
    if (first !== expectedBond) errors.push("bond_mira Continue image is " + (first || "missing"));
    if (JSON.stringify(state) === beforeResume) errors.push("bond_mira Continue did not load saved scene state");
    const afterFirst = JSON.stringify(state);
    if (!resumeGame() || JSON.stringify(state) !== afterFirst) errors.push("bond_mira second Continue mutated state");
    if (document.getElementById("scene-image").src !== first) errors.push("bond_mira second Continue mutated image");

    resetRunState();
    showCinematic("intro");
    if (!currentCinematic || currentCinematic.frames.length !== 3) errors.push("intro cinematic is not three slides");
    const introPlates = ["images/cascade_records.jpg", "images/ship_exterior_2.jpg", "images/arc_living_conflict.jpg"];
    for (let i = 0; i < 3; i++) {
      const got = document.getElementById("cinematic-image").__ssManagedSource;
      if (got !== introPlates[i]) errors.push("intro slide " + (i + 1) + " art is " + (got || "missing") + "; expected " + introPlates[i]);
      if (i < 2) advanceCinematic();
    }
    finishCinematic();
    resetRunState();
    return errors;
  })()`);
}

export function playtestArtEventAuditChecks(runtime) {
  const errors = sourceErrors();
  if (errors.length) return errors;
  return runtimeErrors(runtime);
}
