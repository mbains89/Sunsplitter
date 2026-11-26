// SUN-CREW-CHIP-FIRST-TAP-01 — the first tap on any Crew chip opens that member's sheet.
// The board opens with Lena's facts painted (crewOverviewChecks in verify.mjs requires that
// paint). It is a default, not the player's pick, so a tap on Lena must open her sheet as it does
// for every other name. It used to toggle her off, so only the second tap opened her sheet.
// A chip the player picked still toggles off on the next tap, and opens again on the one after.
// The ticket kept that as the current design, so it is asserted here for Lena and for Mira.
//
// CI has no browser, and the headless DOM has no selectors, so there the chips never get their
// onclick. This check gives #crew-panel a querySelectorAll that returns one object per painted
// chip; the engine binds its own click handler to those objects and the check calls that handler.
// The real-browser version (mouse, touch, keyboard) is scripts/crew-sheet-keyboard-checks.mjs.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  const panel = document.getElementById("crew-panel");
  const sheet = document.getElementById("crew-sheet");
  const toggle = document.getElementById("btn-crew");
  let chips = [];
  panel.querySelectorAll = () => {
    chips = [];
    const re = /<button type="button" class="([^"]*)" data-crew="([^"]+)"[^>]*aria-pressed="(true|false)"/g;
    let match;
    while ((match = re.exec(panel.innerHTML))) {
      const key = match[2];
      chips.push({
        key, classes: match[1].split(" "), pressed: match[3] === "true", onclick: null,
        getAttribute: name => (name === "data-crew" ? key : null)
      });
    }
    return chips;
  };
  const view = () => {
    const open = sheet.classList.contains("visible") && !sheet.classList.contains("hidden");
    return {
      board: panel.classList.contains("visible") && !panel.classList.contains("hidden"),
      listed: chips.map(chip => chip.key),
      selected: chips.filter(chip => chip.classes.includes("selected")).map(chip => chip.key),
      pressed: chips.filter(chip => chip.pressed).map(chip => chip.key),
      dead: chips.filter(chip => chip.classes.includes("dead")).map(chip => chip.key),
      sheet: open ? document.getElementById("crew-sheet-name").textContent : null,
      facts: open ? document.getElementById("crew-sheet-facts").textContent : null
    };
  };
  const tap = key => {
    const chip = chips.find(row => row.key === key);
    if (!chip || typeof chip.onclick !== "function") return { missing: key };
    chip.onclick();
    return view();
  };
  // A fresh open, whatever the board showed before.
  const openBoard = () => {
    closeCrewSheet();
    panel.classList.add("hidden");
    panel.classList.remove("visible");
    toggle.setAttribute("aria-expanded", "false");
    toggleCrewPanel();
    return view();
  };
  // "Back to crew" is onclick="closeCrewSheet()"; Escape goes through the document listeners.
  const leave = { back: () => closeCrewSheet(), escape: () => document.dispatchEvent({ type: "keydown", key: "Escape" }) };
  const firstTap = key => ({ key, name: crew[key].name, opened: openBoard(), first: tap(key) });
  const sequence = (key, how) => {
    const row = firstTap(key);
    leave[how]();
    row.left = view();
    row.second = tap(key);
    row.third = tap(key);
    return row;
  };

  localStorage.clear();
  resetRunState();
  showScene("wake");
  const before = JSON.stringify(state);
  const wakeOpen = openBoard();
  const wake = wakeOpen.listed.map(firstTap);
  const absent = ["tomas", "jiro", "vess"].map(key => ({ key, listed: openBoard().listed.includes(key), tap: tap(key) }));
  const sequences = {};
  for (const how of ["back", "escape"]) for (const key of ["lena", "mira"]) sequences[how + ":" + key] = sequence(key, how);
  // A choice made with the board open repaints it through renderStatus, with nobody selected.
  openBoard();
  renderStatus();
  const repainted = { key: "lena", name: crew.lena.name, opened: view(), first: tap("lena") };
  const reopened = firstTap("lena");
  const stable = JSON.stringify(state) === before;

  state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
  renderStatus();
  const aboard = openBoard().listed.map(firstTap);

  kill("lena", "first-tap fixture");
  kill("rourke", "first-tap fixture");
  renderStatus();
  const deadOpen = openBoard();
  const dead = ["lena", "rourke", "mira"].map(firstTap);
  closeCrewSheet();
  delete panel.querySelectorAll;
  return { wakeOpen, wake, absent, sequences, repainted, reopened, stable, aboard, deadOpen, dead };
})())`));

// One tap, with the tapped member written as "self" so two members can be compared.
const shape = (row, step) => {
  const view = row[step];
  const self = list => list.map(key => (key === row.key ? "self" : key));
  return {
    board: view.board, selected: self(view.selected), pressed: self(view.pressed),
    sheet: view.sheet === row.name ? "self" : view.sheet
  };
};
const OPENED = { board: true, selected: ["self"], pressed: ["self"], sheet: "self" };
const PICKED = { board: true, selected: ["self"], pressed: ["self"], sheet: null };
const NOBODY = { board: true, selected: [], pressed: [], sheet: null };
const assertFirstTap = (row, where) => {
  assert.ok(!row.first.missing, `${where}: ${row.key} has no chip to tap`);
  assert.equal(row.opened.sheet, null, `${where}: opening Crew put a sheet over the board`);
  assert.deepEqual(shape(row, "first"), OPENED, `${where}: the first tap on ${row.key} did not open that sheet`);
};

assert.ok(out.wakeOpen.board && out.wakeOpen.listed.length >= 6, "Crew did not open with the wake roster");
assert.ok(out.wakeOpen.selected.length <= 1, "the board opened with more than one chip painted");
out.wake.forEach(row => assertFirstTap(row, "wake"));
for (const row of out.absent) {
  assert.ok(!row.listed && row.tap.missing === row.key, `${row.key} is not aboard at wake but has a chip`);
}
for (const how of ["back", "escape"]) {
  for (const key of ["lena", "mira"]) {
    const row = out.sequences[`${how}:${key}`];
    assertFirstTap(row, how);
    assert.deepEqual(shape(row, "left"), PICKED, `${how} from the ${key} sheet did not return to the board with ${key} still picked`);
    assert.deepEqual(shape(row, "second"), NOBODY, `after ${how}, a tap on the picked ${key} chip did not toggle it off`);
    assert.deepEqual(shape(row, "third"), OPENED, `after ${how}, the tap after the toggle-off did not open the ${key} sheet again`);
  }
}
assert.deepEqual(out.repainted.opened.selected, [], "a status repaint should leave the board with nobody selected");
assertFirstTap(out.repainted, "after a status repaint");
assertFirstTap(out.reopened, "reopened board");
assert.ok(out.stable, "tapping chips changed run state");

assert.deepEqual(out.aboard.map(row => row.key).filter(key => ["tomas", "jiro", "vess"].includes(key)), ["tomas", "jiro", "vess"],
  "recovered Tomas, Jiro and Vess are not all on the board");
out.aboard.forEach(row => assertFirstTap(row, "all aboard"));

const [deadLena, deadRourke, livingMira] = out.dead;
assert.ok(out.deadOpen.dead.includes("lena") && out.deadOpen.dead.includes("rourke"), "dead fixture did not paint dead chips");
assertFirstTap(livingMira, "with Lena dead");
// A dead member's chip: Lena (the painted default) must answer the first tap as dead Rourke does.
assert.deepEqual(shape(deadLena, "first"), shape(deadRourke, "first"), "dead Lena and dead Rourke answer the first tap differently");
assert.equal(/Condition: Dead/.test(deadLena.first.facts || ""), /Condition: Dead/.test(deadRourke.first.facts || ""),
  "dead Lena and dead Rourke show different conditions on the first tap");

const painted = out.wakeOpen.selected[0] || "nobody";
console.log(`PASS sun-playerflow-crew-chip-first-tap: board opens with ${painted} painted; the first tap opens the sheet for ` +
  `${out.wake.length} of ${out.wake.length} names at wake and ${out.aboard.length} of ${out.aboard.length} with everyone aboard; ` +
  "after Back and Escape a picked chip toggles off, then opens again, for Lena and for Mira; dead Lena matches dead Rourke");
