import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// SUN-V035-ART-R2-PLAYTEST-CLOSE-01. Cluster closeout for the PLAYTEST_SUN
// art/event mismatches already retargeted by PRs 133–141. Proof only: no
// story edits, no new plates, no ART-R2 campaign.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const ART_R2_PLAYTEST_CLOSE_SCENES = {
  romance_lena_1: {
    expected: "images/observation_bridge_alt_2.jpg",
    forbidden: ["images/shower_lena.jpg", "images/romance_lena_1.jpg"],
    textNeedle: "observation blister",
    leftover: { id: "lena_shower", image: "images/shower_lena.jpg" }
  },
  romance_amara_1: {
    expected: "images/hydroponics.jpg",
    forbidden: ["images/shower_amara.jpg", "images/romance_amara_1.jpg"],
    textNeedle: "warm trays",
    leftover: { id: "amara_rear", image: "images/rear_amara.jpg" }
  },
  romance_mira_1: {
    expected: "images/quiet_mira.jpg",
    forbidden: ["images/shower_mira.jpg", "images/romance_mira_1.jpg"],
    textNeedle: "against the console",
    leftover: { id: "mira_shower", image: "images/shower_mira.jpg" }
  },
  act2_tether_hand_elias: {
    expected: "images/tether_ride.jpg",
    forbidden: ["images/self_risk.jpg"],
    textNeedle: "Elias suits up",
    deadFallback: "images/corridor_pressure_3.jpg"
  },
  act3_lethal_elias_order: {
    expected: "images/work_elias.jpg",
    forbidden: ["images/bond_elias.jpg", "images/quiet_elias.jpg"],
    textNeedle: "Station B-four",
    leftover: { id: "bond_elias", image: "images/bond_elias.jpg" },
    deadFallback: "images/corridor_pressure_3.jpg"
  },
  act3_lethal_elias_sealant: {
    expected: "images/work_elias.jpg",
    forbidden: ["images/bond_elias.jpg", "images/quiet_elias.jpg", "images/elias.jpg"],
    textNeedle: "cartridges",
    leftover: { id: "bond_elias", image: "images/bond_elias.jpg" },
    deadFallback: "images/corridor_pressure_3.jpg"
  }
};

const LOCKED_HASHES = {
  "images/observation_bridge_alt_2.jpg": "bd39f540276e44b9c5c8d26da9f7e7fe7b8f5e19d6e15861ca4de07485bb8a55",
  "images/hydroponics.jpg": "00ab1cb40167e3b2882e2c1ebe02964898c52e7aa04ab8fb94f8beecb99a8960",
  "images/quiet_mira.jpg": "27518fd30d22c578eca8fb2b3a775ca6a77c6b4da4486fb0b2a5a39d81d0cf3c",
  "images/tether_ride.jpg": "7961187200068efe1938de5a110d0a30f673be212e8aaf0694e0650e3a506c34",
  "images/work_elias.jpg": "9dfa81959aba082c192c1a9d0ea3c24383dc7695da0ccbe74bc1c3025af63ff2",
  "images/vess.jpg": "a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf",
  "images/shower_lena.jpg": "cd0981c0d0e8b31f589658a77591aa73996547707567016d0f6a2a4f119cd097",
  "images/shower_amara.jpg": "588ba8e67d7c1c6f44e38f26da7f25f15a412283c65ffed55831b54065e827f9",
  "images/shower_mira.jpg": "003145b704f5df06cde8c2b586229b951c820059b92efc8dd2b76d750817ec13",
  "images/self_risk.jpg": "427fb4c5a72239451d213dcf7d6e80bef15da646a4b5e6000ddb54ffeb9de8a7",
  "images/bond_elias.jpg": "084655c278e2c398843a26885eceeab517117b0da8656a7ccb57029e514d1db8",
  "images/rear_amara.jpg": "eb2161471ea17a5472a030fae8450d6f832317d69e2cc9b0e43756aaaffd51d1"
};

const IMAGES_TREE = "de4c3687cf4c89309d3422505dba4b45a32adc7e";
const FACE_REVEAL = [
  "images/romance_lena_1.jpg",
  "images/romance_mira_1.jpg",
  "images/romance_amara_1.jpg"
];

function git(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
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
  const sceneSources = {
    romance_lena_1: readFileSync(resolve(ROOT, "src/scenes-03.js"), "utf8"),
    romance_amara_1: readFileSync(resolve(ROOT, "src/scenes-30.js"), "utf8"),
    romance_mira_1: readFileSync(resolve(ROOT, "src/scenes-30.js"), "utf8"),
    act2_tether_hand_elias: readFileSync(resolve(ROOT, "src/scenes-11.js"), "utf8"),
    act3_lethal_elias_order: readFileSync(resolve(ROOT, "src/scenes-23.js"), "utf8"),
    act3_lethal_elias_sealant: readFileSync(resolve(ROOT, "src/scenes-23.js"), "utf8")
  };

  for (const [id, spec] of Object.entries(ART_R2_PLAYTEST_CLOSE_SCENES)) {
    if (!new RegExp(`${id}:\\s+"${spec.expected}"`).test(stateSource)) {
      errors.push(`state.js map for ${id} is not ${spec.expected}`);
    }
    if (!sceneSources[id].includes(`image: "${spec.expected}"`)) {
      errors.push(`${id} scene declaration is not ${spec.expected}`);
    }
    if (!sceneSources[id].includes(spec.textNeedle)) {
      errors.push(`${id} lost event-setting text ${JSON.stringify(spec.textNeedle)}`);
    }
    for (const forbidden of spec.forbidden) {
      const livingAssign = new RegExp(`${id}[\\s\\S]{0,400}image:\\s*"${forbidden.replace(/\./g, "\\.")}"`);
      if (livingAssign.test(sceneSources[id])) {
        errors.push(`${id} declaration still assigns forbidden ${forbidden}`);
      }
    }
  }

  if (!engineSource.includes('return isAlive("elias") ? "images/work_elias.jpg" : "images/corridor_pressure_3.jpg"')) {
    errors.push("engine no longer resolves living Elias lethal/sealant to work_elias.jpg");
  }
  if (!engineSource.includes('return isAlive(id.slice("act2_tether_hand_".length)) ? "images/tether_ride.jpg" : "images/corridor_pressure_3.jpg"')) {
    errors.push("engine no longer resolves living tether-hand riders to tether_ride.jpg");
  }
  for (const plate of FACE_REVEAL) {
    if (stateSource.includes(`"${plate}"`) || engineSource.includes(`"${plate}"`)) {
      errors.push(`runtime still wires face-revealing plate ${plate}`);
    }
  }
  try {
    const imagesTree = git(["rev-parse", "HEAD:images"]);
    if (imagesTree !== IMAGES_TREE) errors.push(`images tree drifted to ${imagesTree}; expected ${IMAGES_TREE}`);
  } catch (error) {
    errors.push(`images tree unavailable: ${error.message}`);
  }
  for (const [image, expected] of Object.entries(LOCKED_HASHES)) {
    const actual = sha256(image);
    if (actual !== expected) errors.push(`locked closeout plate drifted: ${image} sha256=${actual}`);
  }
  return errors;
}

function runtimeErrors(runtime) {
  const specJson = JSON.stringify(ART_R2_PLAYTEST_CLOSE_SCENES);
  return runtime.evaluate(`(() => {
    const specs = ${specJson};
    const errors = [];
    resetRunState();
    const before = JSON.stringify(state);
    for (const [id, spec] of Object.entries(specs)) {
      const mapped = sceneImages[id];
      const declared = scenes[id] && scenes[id].image;
      const resolved = resolveSceneImage(id, scenes[id]);
      const livingText = typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;
      for (const [field, value] of Object.entries({ mapped, declared, resolved })) {
        if (spec.forbidden.includes(value)) errors.push(id + " " + field + " still uses forbidden " + value);
        if (value !== spec.expected) errors.push(id + " " + field + " is " + (value || "missing") + "; expected " + spec.expected);
      }
      if (!String(livingText || "").includes(spec.textNeedle)) {
        errors.push(id + " living text lost " + JSON.stringify(spec.textNeedle));
      }
      if (spec.leftover) {
        const leftoverMapped = sceneImages[spec.leftover.id];
        const leftoverDeclared = scenes[spec.leftover.id] && scenes[spec.leftover.id].image;
        const leftoverResolved = resolveSceneImage(spec.leftover.id, scenes[spec.leftover.id]);
        for (const [field, value] of Object.entries({ leftoverMapped, leftoverDeclared, leftoverResolved })) {
          if (value !== spec.leftover.image) {
            errors.push(spec.leftover.id + " " + field + " is " + (value || "missing") + "; expected " + spec.leftover.image);
          }
        }
      }
    }
    if (JSON.stringify(state) !== before) errors.push("ART-R2 playtest-close resolve wrote run state");
    for (const [id, spec] of Object.entries(specs)) {
      if (!spec.deadFallback) continue;
      resetRunState();
      state.dead.push("elias");
      const beforeDead = JSON.stringify(state);
      const resolved = resolveSceneImage(id, scenes[id]);
      if (JSON.stringify(state) !== beforeDead) errors.push("dead Elias " + id + " resolve wrote run state");
      if (isAlive("elias")) errors.push("dead Elias fixture still reports living for " + id);
      if (resolved !== spec.deadFallback) errors.push("dead Elias " + id + " resolved to " + (resolved || "missing") + "; expected " + spec.deadFallback);
      if (resolved === spec.expected || spec.forbidden.includes(resolved)) {
        errors.push("dead Elias " + id + " still shows a living Elias plate");
      }
    }
    return errors;
  })()`);
}

export function artR2PlaytestCloseChecks(runtime) {
  const errors = sourceErrors();
  if (errors.length) return errors;
  return runtimeErrors(runtime);
}
