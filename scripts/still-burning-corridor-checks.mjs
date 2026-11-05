// SUN-STILL-BURNING-CORRIDOR-01 — runtime proof that course_briefed pays corridor days.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MONTHS_HOLD = "Fourteen months. No guarantee.";
const MONTHS_TRUTH = "Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.";
const COMFORT = "You abandoned the destination for warmth and slightly less hunger.";
const TRANSMISSION = "A final transmission went out. The ship went quieter afterward.";
const NO_DESTINATION = "There is no grand destination. Only the work of the next cycle.";
const LOCKED = "The course remains locked";

function citesCorridor(text) {
  const value = String(text);
  return (value.includes("181") && value.includes("184"))
    || (value.includes("one hundred eighty-one") && value.includes("one hundred eighty-four"));
}

function claimsLandfallOrGuaranteedArrival(text) {
  return /landfall|have landed|has landed|already arrived|arrival is guaranteed|guaranteed arrival|will arrive/i.test(String(text));
}

function addsEmbryoDigit(text) {
  return /\d+(?:\.\d+)?\s*%/.test(String(text)) || /embryo\D{0,40}\d/i.test(String(text));
}

function sampleStillBurning(runtime) {
  return runtime.evaluate(`(() => {
    const call = (crisis, shape, final, planet) => buildStillBurningText(crisis, shape, final, planet);
    const read = (briefed) => {
      resetRunState();
      if (briefed === undefined) delete state.flags.course_briefed;
      else state.flags.course_briefed = briefed;
      const texts = {
        hold: call(null, "split", "hold", null),
        comfort: call(null, "split", "comfort", null),
        transmission: call(null, "split", "transmission", null),
        endure: call(null, "split", "endure", null),
        livingHold: call("vent", "living", "hold", "committed"),
        futureHold: call(null, "future", "hold", "committed")
      };
      showScene("reckon_truth");
      return {
        texts,
        rendered: document.getElementById("story").innerHTML,
        getter: String(scenes.reckon_truth.text)
      };
    };
    const first = { briefed: read(true), unbriefed: read(false), absent: read(undefined) };
    const second = { briefed: read(true), unbriefed: read(false), absent: read(undefined) };
    resetRunState();
    return {
      readyState: document.readyState,
      wired: !!buildStillBurningText.__ssCorridorWired,
      first,
      second
    };
  })()`);
}

export function stillBurningCorridorChecks(runtime) {
  const errors = [];
  if (!runtime || typeof runtime.evaluate !== "function") {
    errors.push("corridor check requires the loadGame runtime");
    return errors;
  }
  let fixture;
  try {
    fixture = sampleStillBurning(runtime);
  } catch (error) {
    errors.push(error.stack || error.message);
    return errors;
  }
  if (fixture.readyState !== "complete") errors.push(`harness readyState is ${fixture.readyState}, not complete`);
  if (fixture.wired) errors.push("buildStillBurningText is the scenes-26 string replace, not the shipped function");
  if (fixture.first.briefed.texts.hold !== fixture.second.briefed.texts.hold) {
    errors.push("briefed hold text changed between two calls");
  }
  if (fixture.first.unbriefed.texts.hold !== fixture.second.unbriefed.texts.hold) {
    errors.push("unbriefed hold text changed between two calls");
  }

  const briefed = fixture.first.briefed;
  const unbriefed = fixture.first.unbriefed;
  const absent = fixture.first.absent;
  for (const [label, text] of Object.entries(briefed.texts)) {
    if (addsEmbryoDigit(text)) errors.push(`${label} adds an embryo count or percentage`);
    if (label === "hold" || label === "livingHold" || label === "futureHold") {
      if (!citesCorridor(text)) errors.push(`${label} does not cite day 181 and day 184`);
      if (text.includes("Fourteen months")) errors.push(`${label} still says Fourteen months`);
      if (claimsLandfallOrGuaranteedArrival(text)) errors.push(`${label} claims landfall or a guaranteed arrival`);
      if (!text.includes(LOCKED)) errors.push(`${label} dropped the locked course`);
    }
  }
  if (!unbriefed.texts.hold.includes(MONTHS_HOLD)) errors.push("unbriefed hold lost Fourteen months. No guarantee.");
  if (citesCorridor(unbriefed.texts.hold)) errors.push("unbriefed hold cites the day 181-184 corridor");
  if (!absent.texts.hold.includes(MONTHS_HOLD) || citesCorridor(absent.texts.hold)) {
    errors.push("missing course_briefed does not keep the months hold line");
  }
  for (const key of ["comfort", "transmission", "endure"]) {
    if (briefed.texts[key] !== unbriefed.texts[key] || briefed.texts[key] !== absent.texts[key]) {
      errors.push(`${key} Still Burning sentence changed with course_briefed`);
    }
    if (briefed.texts[key].includes(LOCKED) || citesCorridor(briefed.texts[key])) {
      errors.push(`${key} asserts a locked course or corridor`);
    }
  }
  if (!briefed.texts.comfort.includes(COMFORT)) errors.push("comfort sentence changed");
  if (!briefed.texts.transmission.includes(TRANSMISSION)) errors.push("transmission sentence changed");
  if (!briefed.texts.endure.includes(NO_DESTINATION)) errors.push("no-destination sentence changed");
  if (!briefed.texts.livingHold.includes("The embryo counts are wounded. The room is not.")) {
    errors.push("living hold dropped the existing embryo sentence");
  }
  if (!briefed.rendered.includes("181") || !briefed.rendered.includes("184") || briefed.rendered.includes("Fourteen months")) {
    errors.push("rendered reckon_truth did not cite the verified corridor");
  }
  if (claimsLandfallOrGuaranteedArrival(briefed.rendered) || addsEmbryoDigit(briefed.rendered)) {
    errors.push("rendered reckon_truth claims landfall, a guaranteed arrival, or an embryo digit");
  }
  if (!unbriefed.rendered.includes(MONTHS_TRUTH) || citesCorridor(unbriefed.rendered)) {
    errors.push("unbriefed reckon_truth lost the fourteen-month line or gained a corridor citation");
  }
  if (!briefed.getter.includes("181") || briefed.getter.includes("Fourteen months")) {
    errors.push("reckon_truth getter diverges from the briefed corridor line");
  }
  if (!unbriefed.getter.includes(MONTHS_TRUTH)) errors.push("reckon_truth getter lost the unbriefed months line");
  return errors;
}

export function briefedHoldText(runtime) {
  return runtime.evaluate(`(() => {
    resetRunState();
    state.flags.course_briefed = true;
    const text = buildStillBurningText(null, "split", "hold", null);
    resetRunState();
    return text;
  })()`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runtime = loadGame(ROOT);
  let failed = false;
  const holds = [];
  for (let run = 1; run <= 2; run += 1) {
    const errors = stillBurningCorridorChecks(runtime);
    const hold = briefedHoldText(runtime);
    holds.push(hold);
    console.log(`run ${run} briefedHold=${JSON.stringify(hold)}`);
    if (errors.length) {
      failed = true;
      console.error(`FAIL still-burning corridor run ${run}`, errors);
    } else {
      console.log(`PASS still-burning corridor run ${run}`);
    }
  }
  if (holds[0] !== holds[1]) {
    failed = true;
    console.error("FAIL briefed hold text differed across runs");
  }
  if (failed) process.exit(1);
}
