import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

// SUN-PLAYTEST-AMARA-ROMANCE-REPRO-01 — lock the intended trays map.
// Amara-route stays PARKED. This file does not add scenes or prose.
export function playtestAmaraRomanceReproChecks(runtime) {
  const errors = [];
  const intimacy = read("src/scenes-29.js");
  const bond = read("src/scenes-30.js");
  const quiet = read("src/scenes-41.js");
  const promise = read("src/scenes-43.js");
  const stateSrc = read("src/state.js");

  if (!intimacy.includes("Find Amara alone among the trays.") || !intimacy.includes('next: "bond_amara"')) {
    errors.push("intimacy_window lost the Amara trays offer");
  }
  if (!bond.includes("bond_amara:") || !bond.includes('next: "romance_amara_1"')) {
    errors.push("bond_amara lost the yes-path into romance_amara_1");
  }
  if (!bond.includes("romance_amara_1:") || !bond.includes("among the warm trays") || !bond.includes('image: "images/hydroponics.jpg"')) {
    errors.push("romance_amara_1 lost trays copy or hydroponics plate");
  }
  if (!bond.includes("state.romance.amara = true")) {
    errors.push("romance_amara_1 no longer writes romance.amara");
  }
  if (!quiet.includes("quiet_amara:") || !quiet.includes("between the trays") || !quiet.includes('next: "prom_make_amara"')) {
    errors.push("quiet_amara lost trays copy or prom_make_amara exit");
  }
  if (!promise.includes("prom_make_amara:") || !promise.includes("prom_r_amara:") || !promise.includes("She goes back to the trays.")) {
    errors.push("prom_r_amara trays beat missing from promise map");
  }
  if (!promise.includes("state.promises.amara = state.flags.prom_amara ? \"made\" : \"declined\"")) {
    errors.push("prom_r_amara no longer records promises.amara");
  }
  if (!stateSrc.includes("function romanceOpen") || !stateSrc.includes('who === "amara" && state.romance.amara_tomas')) {
    errors.push("romanceOpen lost the Amara / amara_tomas gate");
  }
  if (!stateSrc.includes('romance_amara_1:  "images/hydroponics.jpg"')) {
    errors.push("sceneImages.romance_amara_1 is not the trays plate");
  }

  try {
    const fixture = runtime.evaluate(`(() => {
      const pick = (next) => {
        const scene = scenes[state.scene];
        const list = typeof scene.choices === "function" ? scene.choices() : scene.choices;
        return (list || []).find(c => c && c.next === next);
      };
      const sceneText = () => {
        const scene = scenes[state.scene];
        const raw = typeof scene.text === "function" ? scene.text() : scene.text;
        return String(raw || "");
      };

      localStorage.clear();
      resetRunState();
      showScene("intimacy_window");
      const traysOffer = pick("bond_amara");
      if (!traysOffer) return { step: "intimacy", scene: state.scene, open: romanceOpen("amara") };
      makeChoice(traysOffer);
      if (state.scene !== "bond_amara") return { step: "bond", scene: state.scene };
      const yes = pick("romance_amara_1");
      if (!yes) return { step: "yes", scene: state.scene };
      makeChoice(yes);
      const romance = {
        scene: state.scene,
        flagged: !!state.romance.amara,
        trays: sceneText().includes("trays"),
        plate: scenes.romance_amara_1 && scenes.romance_amara_1.image
      };

      resetRunState();
      showScene("quiet_amara");
      const toMake = pick("prom_make_amara");
      if (!toMake) return { romance, step: "quiet", scene: state.scene };
      makeChoice(toMake);
      if (state.scene !== "prom_make_amara") return { romance, step: "make", scene: state.scene };
      const accept = pick("prom_r_amara");
      if (!accept) return { romance, step: "accept", scene: state.scene };
      makeChoice(accept);
      const promiseBeat = {
        scene: state.scene,
        promise: state.promises.amara,
        trays: sceneText().includes("trays")
      };
      return { romance, promiseBeat };
    })()`);
    if (!fixture.romance || fixture.romance.scene !== "romance_amara_1" || !fixture.romance.flagged) {
      errors.push("Amara trays romance path did not write romance.amara at romance_amara_1");
    }
    if (!fixture.romance || !fixture.romance.trays) {
      errors.push("romance_amara_1 runtime copy lost trays");
    }
    if (!fixture.romance || fixture.romance.plate !== "images/hydroponics.jpg") {
      errors.push("romance_amara_1 runtime plate is not hydroponics.jpg");
    }
    if (!fixture.promiseBeat || fixture.promiseBeat.scene !== "prom_r_amara" || fixture.promiseBeat.promise !== "made") {
      errors.push("prom_r_amara did not record promises.amara=made after the trays promise");
    }
    if (!fixture.promiseBeat || !fixture.promiseBeat.trays) {
      errors.push("prom_r_amara runtime copy lost trays");
    }
  } catch (error) {
    errors.push(`amara romance repro runtime: ${error.message}`);
  }
  return errors;
}
