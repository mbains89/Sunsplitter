// SUN-CODEX-007 — lifecycle restoration must respect the active screen.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;
function check(label, action) {
  try {
    action();
    passed++;
    console.log(`ok ${label}`);
  } catch (error) {
    failed++;
    console.log(`not-ok ${label}: ${error.message}`);
  }
}

const restores = {
  pageshow: 'window.dispatchEvent({ type: "pageshow", persisted: false });',
  visibilitychange: 'document.dispatchEvent({ type: "visibilitychange" });',
  resume: 'document.dispatchEvent({ type: "resume" });'
};
for (const screen of ["tone", "title", "cinematic", "ending", "what-remains"]) {
  for (const [event, restore] of Object.entries(restores)) {
    check(`${screen} ${event} keeps gameplay art hidden`, () => {
      const runtime = loadGame(root, { includeValidator: false });
      runtime.evaluate(`showScreen(${JSON.stringify(screen)});`);
      const before = runtime.evaluate("JSON.stringify(state)");
      runtime.evaluate(restore);
      const { document } = runtime.browser;
      assert.equal(document.getElementById("scene-image-wrap").classList.contains("visible"), false,
        "gameplay art became visible while gameplay was hidden");
      assert.equal(document.getElementById("scene-image").src, "", "inactive gameplay image was rebound");
      assert.equal(runtime.evaluate("JSON.stringify(state)"), before, "restore changed run state");
    });
  }
}

for (const mode of ["empty", "suspended", "crew-close"]) {
  check(`active gameplay ${mode} restores its scene art`, () => {
    const runtime = loadGame(root, { includeValidator: false });
    runtime.evaluate('showScreen("game"); showScene("wake");');
    const expected = runtime.browser.document.getElementById("scene-image").src;
    assert.ok(expected, "wake must have scene art");
    const before = runtime.evaluate("JSON.stringify(state)");
    if (mode === "suspended") {
      runtime.evaluate('window.dispatchEvent({ type: "pagehide", persisted: true });');
    } else {
      runtime.evaluate('setManagedImageSource(document.getElementById("scene-image"), "");');
      if (mode === "crew-close") {
        runtime.evaluate('document.getElementById("scene-image-wrap").classList.add("minimized"); restoreScenePlateAfterCrewClose();');
      }
    }
    runtime.evaluate('window.dispatchEvent({ type: "pageshow", persisted: true });');
    const { document } = runtime.browser;
    assert.equal(document.getElementById("scene-image").src, expected);
    assert.equal(document.getElementById("scene-image-wrap").classList.contains("visible"), true);
    if (mode === "crew-close") assert.equal(document.getElementById("scene-image-wrap").classList.contains("minimized"), false);
    assert.equal(runtime.evaluate("JSON.stringify(state)"), before, "restore changed run state");
  });
}

console.log(`SUMMARY scene-art-restore pass=${passed} fail=${failed} total=${passed + failed}`);
process.exitCode = failed ? 1 : 0;
