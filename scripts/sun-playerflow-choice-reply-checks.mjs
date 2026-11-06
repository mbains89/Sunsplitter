// SUN-REPLY-ENGINE-01 (proposed L-057) — a choice's `reply` opens the next screen.
// Exercises the engine with synthetic scenes added to the loaded runtime only (no scene files):
// render order, dead/absent speaker dropped, carried across an onEnter redirect, never in the
// save, dropped on resume and at an ending, and the validator's shape rules.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const story = () => document.getElementById("story").innerHTML;
  const r = {};
  scenes.__reply_from = { text: "From.", choices: [] };
  scenes.__reply_to = { text: "Next scene body.", choices: [{ text: "On.", next: "__reply_to" }] };
  scenes.__reply_redirect = { onEnter: () => "__reply_to", text: "Never shown.", choices: [] };
  const pick = (choice) => { resetRunState(); showScene("__reply_from"); makeChoice(choice); return story(); };

  r.narration = pick({ text: "Go.", next: "__reply_to", reply: "The board takes it without comment." });
  r.speaker = pick({ text: "Go.", next: "__reply_to", reply: { who: "lena", text: "Lena nods once." } });
  r.mixed = (() => { resetRunState(); kill("mira", "fixture"); showScene("__reply_from");
    makeChoice({ text: "Go.", next: "__reply_to", reply: [{ who: "mira", text: "Mira logs it." }, { who: "lena", text: "Lena does not." }] });
    return story(); })();
  r.unrecovered = pick({ text: "Go.", next: "__reply_to", reply: { who: "jiro", text: "Jiro says nothing." } });
  r.redirect = pick({ text: "Go.", next: "__reply_redirect", reply: "Carried." });
  r.consumed = (() => { makeChoice({ text: "On.", next: "__reply_to" }); return story(); })();
  r.noReply = pick({ text: "Go.", next: "__reply_to" });
  r.inSave = (() => { resetRunState(); showScene("__reply_from");
    makeChoice({ text: "Go.", next: "__reply_to", reply: "SAVE-PROBE-LINE" });
    return JSON.stringify(state).includes("SAVE-PROBE-LINE"); })();
  r.resume = (() => { resetRunState(); showScene("__reply_from");
    makeChoice({ text: "Go.", next: "__reply_to", reply: "Shown once." });
    showScene("__reply_to", { resume: true, skipOnEnter: true }); return story(); })();
  r.ending = (() => { resetRunState(); showScene("__reply_from");
    makeChoice({ text: "Go.", next: "ending_check", reply: "Should not leak." });
    showScene("__reply_to"); return story(); })();
  delete scenes.__reply_from; delete scenes.__reply_to; delete scenes.__reply_redirect;
  return r;
})())`));

const first = html => (html.match(/<div class="scene-text">(<p[^>]*>.*?<\/p>)/) || [])[1] || "";
assert.equal(first(out.narration), '<p class="choice-reply">The board takes it without comment.</p>', "narration reply must open the next screen");
assert.ok(out.narration.includes("Next scene body."), "next scene text must follow the reply");
assert.ok(out.speaker.includes('<p class="choice-reply">Lena nods once.</p>'), "living speaker's reply must render");
assert.ok(!out.mixed.includes("Mira logs it.") && out.mixed.includes("Lena does not."), "dead speaker's line must drop, living one stays");
assert.ok(!out.unrecovered.includes("Jiro says nothing."), "unrecovered speaker's line must drop");
assert.ok(out.redirect.includes("Carried.") && !out.redirect.includes("Never shown."), "reply must survive an onEnter redirect");
assert.ok(!out.consumed.includes("choice-reply"), "reply must render once, not on the following screen");
assert.ok(!out.noReply.includes("choice-reply"), "a choice without reply renders no reply");
assert.equal(out.inSave, false, "reply must never be written to state or the save");
assert.ok(!out.resume.includes("Shown once."), "resume re-render must not replay a reply");
assert.ok(!out.ending.includes("Should not leak."), "a reply on a run-ending choice must be dropped");

// Validator shape rules: src/validate.js exposes window.validateSunsplitter (dev tool, ?validate=1).
const v = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  const cases = {
    ok: [{ text: "x", next: "wake", reply: "line" }, { text: "y", next: "wake", reply: { who: "lena", text: "line" } }],
    badWho: [{ text: "x", next: "wake", reply: { who: "nobody", text: "line" } }],
    badKey: [{ text: "x", next: "wake", reply: { who: "lena", text: "line", mood: "warm" } }],
    tooMany: [{ text: "x", next: "wake", reply: ["a", "b", "c", "d"] }],
    empty: [{ text: "x", next: "wake", reply: "  " }]
  };
  const res = {};
  for (const [k, choices] of Object.entries(cases)) {
    scenes.__reply_validate = { text: "v", choices };
    const report = typeof window.validateSunsplitter === "function" ? window.validateSunsplitter() : null;
    const errs = report ? (report.errors || []).filter(e => e.startsWith("__reply_validate")) : null;
    res[k] = errs;
    delete scenes.__reply_validate;
  }
  return res;
})())`));
assert.ok(v.ok !== null, "window.validateSunsplitter must be exposed to the harness");
{
  assert.deepEqual(v.ok, [], "valid reply shapes must pass the validator: " + JSON.stringify(v.ok));
  for (const k of ["badWho", "badKey", "tooMany", "empty"]) assert.ok(v[k].length > 0, `validator must reject reply case ${k}`);
}
console.log("PASS sun-playerflow-choice-reply: renders first, drops dead/absent speakers, survives redirect, renders once, never saved, dropped on resume and at endings" + ", validator shape rules");
