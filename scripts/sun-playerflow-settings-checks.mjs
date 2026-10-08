// SUN-TESTS-PLAYERFLOW-01 — tone acknowledgement persists; restart clears run state.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sunPlayerflowSettingsChecks() {
  const errors = [];
  const writer = loadGame(ROOT);
  const ack = writer.evaluate(`(() => {
    localStorage.clear();
    if (typeof acknowledgeTone !== "function") return { missing: true };
    acknowledgeTone();
    return { key: localStorage.getItem("sunsplitter_tone_ack_v1"), raw: localStorage.getItem("sunsplitter_tone_ack_v1") };
  })()`);
  if (!ack || ack.missing) return ["acknowledgeTone missing — settings persist flow cannot run"];
  const reader = loadGame(ROOT);
  const persisted = reader.evaluate(`(() => {
    localStorage.clear();
    localStorage.setItem("sunsplitter_tone_ack_v1", ${JSON.stringify(ack.raw)});
    return typeof hasAcknowledgedTone === "function" && hasAcknowledgedTone();
  })()`);
  if (!persisted) errors.push("tone ack did not persist into a fresh VM");

  const restarted = reader.evaluate(`(() => {
    resetRunState();
    state.scene = "hydroponics";
    state.supplies = 3;
    if (!state.dead.includes("mira")) state.dead.push("mira");
    state.deathCause.mira = "playerflow fixture";
    const started = beginFreshCampaign({ persist: true });
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    return {
      started,
      scene: state.scene,
      supplies: state.supplies,
      miraDead: state.dead.includes("mira"),
      tone: localStorage.getItem("sunsplitter_tone_ack_v1")
    };
  })()`);
  if (!restarted || !restarted.started) errors.push("beginFreshCampaign did not restart: " + JSON.stringify(restarted));
  if (!restarted || restarted.scene !== "wake") errors.push("restart did not clear scene to wake: " + JSON.stringify(restarted));
  if (!restarted || restarted.supplies === 3) errors.push("restart kept the fixture supplies debit: " + JSON.stringify(restarted));
  if (!restarted || restarted.miraDead) errors.push("restart kept fixture death: " + JSON.stringify(restarted));
  if (!restarted || restarted.tone !== ack.raw) errors.push("restart cleared tone setting: " + JSON.stringify(restarted));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowSettingsChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-settings", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-settings (tone ack survived a fresh VM and a restart; run state cleared)");
}
