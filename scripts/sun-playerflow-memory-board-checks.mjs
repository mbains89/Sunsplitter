// SUN-MEMORY-BOARD-01 (L-054; owner rulings 2026-11-25 D1(a) D2(a) D3(a) D8(a) D9(a)) — the memory board.
//
// Headless (always, CI included):
//  1. Post-run only: no board control in the game screen, status bar, meta bar, crew panel,
//     cinematic (pause) or ending markup; the board cannot open while a run, a cinematic or the
//     ending screen is on screen; showing any in-run screen hides it, and the bars stay hidden
//     while it is shown. The entries are hidden while the store holds no finished run.
//  2. Seven ending tiles at every fill; dim tiles hold no text and no children; reached tiles in
//     first-reached order, then the dim ones.
//  3. A branch is named only after some run has taken it: every fork's labels, one branch at a
//     time; a hard-call person no run has faced is never named.
//  4. Each fork row has exactly one unnamed marker while any branch is untaken, none once all are.
//  5. The last run's ending tile is lit and marked "This run" (from What Remains) or "Last run"
//     (from the title); the lit branches are the last run's.
//  6. "Forget this ship" is offered only from the title, asks first, and clears only the memory
//     key: every save, setting and the tone acknowledgement are byte-identical after it.
//  7. Seeded real-play runs: the ending screen's markup and text, and What Remains' text, are
//     unchanged by opening and closing the board; the board prints no cause of death (ruling 21,
//     "a death prints once") and no number.
//  8. Escape closes the board and returns focus to the button that opened it; the confirm takes
//     focus on Cancel, traps Tab (SUN-TUTORIAL-DIALOG-01 handling), and Escape cancels it.
//  9. Layout rules that keep #main from scrolling sideways (minmax(0, 1fr) tracks, wrapping labels).
// Browser (when Playwright resolves; it is not installed in CI): no horizontal scroll at 360×640
// and 1280×800 with a full store, and the confirm's focus trap and Escape in real Chromium.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = readFileSync(resolve(ROOT, "index.html"), "utf8");
const CSS = readFileSync(resolve(ROOT, "css/memory-board.css"), "utf8");
const KEY = "sunsplitter_ship_memory_v1";
const REAL_RUNS = Number(process.env.MEMORY_BOARD_RUNS) || 16;
const SEED = 47;

const ENDINGS = {
  yellow_circle: "The Yellow Circle", landfall: "Landfall", living_ship: "The Living Ship", quiet_ship: "The Quiet Ship",
  still_burning: "Still Burning", fracture: "Fracture", long_dark: "The Long Dark"
};
const FORK_LABELS = {
  crisis: { breath: "The biofilm", custody: "The thermal-spine overload" },
  vault: { future: "The restart package kept", living: "Habitation kept", split: "Both degraded" },
  tether: { slow: "The slow catch", hard: "The hard catch" },
  final: { hold: "The course held", comfort: "Speed and comfort", transmission: "A final transmission", endure: "One day at a time" }
};
const LETHAL_FIRST = { lena: "Lena", tomas: "Tomas", elias: "Elias", mira: "Mira" };
const LETHAL_OUTCOME = { lived: "came back", lost: "did not come back" };
const ROW_ORDER = ["crisis", "vault", "tether", "lethal", "final"];
const OTHER_KEYS = {
  sunsplitter_save_v3: "{\"scene\":\"act2_hub\",\"v\":3}",
  sunsplitter_save_v3_staging: "{\"staging\":1}",
  sunsplitter_save_v3_backup: "{\"backup\":1}",
  sunsplitter_save_v2: "{\"legacy\":1}",
  sunsplitter_save_v3_slot2: "{\"slot\":2}",
  sunsplitter_save_v3_slot2_staging: "{\"slot\":2,\"staging\":1}",
  sunsplitter_save_v3_slot2_backup: "{\"slot\":2,\"backup\":1}",
  sunsplitter_save_v3_slot3: "{\"slot\":3}",
  sunsplitter_save_v3_slot3_staging: "{\"slot\":3,\"staging\":1}",
  sunsplitter_save_v3_slot3_backup: "{\"slot\":3,\"backup\":1}",
  sunsplitter_save_current_v1: "2",
  sunsplitter_tone_ack_v1: "1",
  sunsplitter_show_costs_v1: "1",
  sunsplitter_text_pace_v1: "instant",
  sunsplitter_tutorial_seen_v1: "1",
  sunsplitter_cover_nudity_v1: "1",
  sunsplitter_validate: "0"
};

function memory(fill) {
  return Object.assign({ v: 1, runs: 1, endings: {}, lost: {}, plates: [],
    forks: { crisis: {}, vault: {}, tether: {}, lethal: {}, final: {} }, last: null, prints: [], trail: [] }, fill);
}

function fullMemory() {
  return memory({
    runs: 40,
    endings: { long_dark: 9, fracture: 7, quiet_ship: 6, still_burning: 6, living_ship: 5, landfall: 4, yellow_circle: 3 },
    lost: { rourke: 40, lena: 12 },
    forks: {
      crisis: { breath: 20, custody: 20 }, vault: { future: 15, living: 15, split: 10 }, tether: { slow: 20, hard: 20 },
      lethal: { lena: { lived: 5, lost: 5 }, tomas: { lived: 3, lost: 3 }, elias: { lived: 4, lost: 4 }, mira: { lived: 2, lost: 2 } },
      final: { hold: 10, comfort: 10, transmission: 10, endure: 10 }
    },
    last: { ending: "yellow_circle", lost: ["rourke", "lena"],
      forks: { crisis: "custody", vault: "split", tether: "hard", lethal: { lena: "lost", tomas: "lived" }, final: "endure" } }
  });
}

// Inner markup of the element carrying id="<id>", matched to its own closing tag.
function elementMarkup(id) {
  const open = new RegExp(`<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(HTML);
  assert.ok(open, `index.html has no #${id}`);
  const tag = open[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  for (let m; (m = re.exec(HTML));) {
    depth += m[1] ? -1 : 1;
    if (!depth) return HTML.slice(open.index + open[0].length, m.index);
  }
  throw new Error(`#${id} never closes in index.html`);
}

function staticChecks(errors) {
  for (const id of ["game-screen", "status", "meta", "crew-panel", "crew-sheet", "tutorial-overlay", "cinematic-screen", "ending-screen", "tone-screen"]) {
    if (/memory-board|openMemoryBoard|memory-screen|MemoryForget/i.test(elementMarkup(id))) errors.push(`#${id} markup carries a memory board control`);
  }
  // The ending screen keeps exactly the markup it had before the What Remains entry.
  const ending = elementMarkup("ending-screen");
  const ids = [...ending.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const clicks = [...ending.matchAll(/\bonclick="([^"]+)"/g)].map(m => m[1]);
  if (JSON.stringify(ids) !== JSON.stringify(["ending-image-wrap", "ending-image", "ending-title", "ending-text", "ending-next-hint", "btn-what-remains"])) {
    errors.push(`#ending-screen element ids changed: ${ids.join(", ")}`);
  }
  if (JSON.stringify(clicks) !== JSON.stringify(["showWhatRemains()", "playAgain()"])) errors.push(`#ending-screen actions changed: ${clicks.join(", ")}`);
  const remains = elementMarkup("what-remains-screen");
  if (!/id="btn-memory-board-remains"[^>]*onclick="openMemoryBoard\('what-remains'\)"/.test(remains)) errors.push("What Remains has no Memory board entry");
  if (remains.indexOf("btn-memory-board-remains") < remains.indexOf('id="what-remains-crew"')) errors.push("What Remains entry is not after the crew paragraphs");
  const titleActions = /<div class="title-actions">[\s\S]*?<input id="save-import-file"/.exec(HTML);
  if (!titleActions || !/id="btn-memory-board"[^>]*onclick="openMemoryBoard\('title'\)"/.test(titleActions[0])) errors.push("title actions have no Memory board entry");
  const screen = elementMarkup("memory-screen");
  if (!/id="memory-forget-confirm"[^>]*role="dialog"[^>]*aria-modal="true"/.test(screen)) errors.push("Forget confirm is not an aria-modal dialog inside the board");
  if (!screen.includes("Forget every ending, fork and picture this ship remembers? Saved runs and settings are kept.")) errors.push("Forget confirm text changed");
  if (/\d/.test(screen.replace(/<[^>]*>/g, ""))) errors.push("board markup prints a number");
  // Layout: two tracks that may shrink, labels that may break, nothing wider than the column.
  if (!/\.memory-endings\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/.test(CSS)) errors.push("ending tiles are not two minmax(0, 1fr) tracks");
  if (!/\.memory-ending\s*\{[^}]*min-width:\s*0[^}]*overflow-wrap:\s*anywhere/.test(CSS)) errors.push("ending tiles may not shrink or break");
  if (!/\.memory-branches\s*\{[^}]*flex-wrap:\s*wrap/.test(CSS)) errors.push("fork branches do not wrap");
  if (!/\.memory-branch\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/.test(CSS)) errors.push("fork branches may overflow the row");
  if (!/#memory-screen\s*\{[^}]*max-width:\s*560px/.test(CSS)) errors.push("board column has no max-width");
  if (!HTML.includes('<link rel="stylesheet" href="css/memory-board.css">')) errors.push("memory-board.css not linked");
}

// Engine with a focus model and stub elements that can be emptied.
function boot() {
  const runtime = loadGame(ROOT);
  runtime.evaluate(`(() => {
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    proto.replaceChildren = function () { this.children = []; this.textContent = ""; };
    proto.contains = function (node) { return node === this; };
    persistSave = () => true;
    globalThis.__classes = el => new Set([...String(el.className || "").split(/\\s+/).filter(Boolean), ...el.classList.values]);
    globalThis.__text = el => [el.textContent || "", ...(el.children || []).map(c => __text(c))].join(" ").replace(/\\s+/g, " ").trim();
    globalThis.__visible = id => !document.getElementById(id).classList.contains("hidden");
    globalThis.__board = () => {
      const endings = document.getElementById("memory-endings").children.map(tile => ({
        classes: [...__classes(tile)], text: __text(tile), children: tile.children.length, label: tile.getAttribute("aria-label"),
        title: (tile.children.find(c => __classes(c).has("memory-ending-title")) || {}).textContent || "",
        tag: (tile.children.find(c => __classes(c).has("memory-this-run")) || {}).textContent || ""
      }));
      const forks = document.getElementById("memory-forks").children.map(row => {
        const list = row.children.find(c => __classes(c).has("memory-branches"));
        return {
          fork: row.getAttribute("data-fork"),
          label: (row.children.find(c => __classes(c).has("memory-fork-label")) || {}).textContent,
          branches: list.children.map(item => ({ classes: [...__classes(item)], text: item.textContent, label: item.getAttribute("aria-label"), full: __text(item) }))
        };
      });
      return { endings, forks, text: __text(document.getElementById("memory-endings")) + " " + __text(document.getElementById("memory-forks")),
        back: document.getElementById("memory-back").textContent, forget: __visible("memory-forget") };
    };
    globalThis.__press = (key, shiftKey = false) => {
      const event = { key, shiftKey, target: document.activeElement, defaultPrevented: false, repeat: false,
        altKey: false, ctrlKey: false, metaKey: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, stopImmediatePropagation() {} };
      if (!handleModalDialogKeydown(event)) handleMemoryBoardKeydown(event);
      return event.defaultPrevented;
    };
  })()`);
  return runtime;
}

function setMemory(runtime, value) {
  runtime.evaluate(`localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(value))})`);
}

function openFromTitle(runtime, value) {
  if (value) setMemory(runtime, value);
  return runtime.evaluate(`JSON.stringify((() => { showTitleScreen(); const opened = openMemoryBoard("title"); return { opened, board: __board() }; })())`);
}

function checkTiles(board, value, origin, where, errors) {
  const reached = Object.keys(value.endings);
  if (board.endings.length !== 7) errors.push(`${where}: ${board.endings.length} ending tiles, not 7`);
  board.endings.forEach((tile, i) => {
    if (i < reached.length) {
      if (!tile.classes.includes("is-lit") || tile.title !== ENDINGS[reached[i]]) errors.push(`${where}: tile ${i} is not the lit "${ENDINGS[reached[i]]}" (${tile.title})`);
    } else {
      if (!tile.classes.includes("is-dim") || tile.text !== "" || tile.children !== 0) errors.push(`${where}: dim tile ${i} holds text or children (${JSON.stringify(tile.text)})`);
      if (tile.label !== "An ending not yet reached") errors.push(`${where}: dim tile ${i} label ${tile.label}`);
    }
  });
  const marked = board.endings.filter(tile => tile.tag);
  const runLabel = origin === "title" ? "Last run" : "This run";
  if (value.last) {
    if (marked.length !== 1 || marked[0].tag !== runLabel || marked[0].title !== ENDINGS[value.last.ending] || !marked[0].classes.includes("is-lit") || !marked[0].classes.includes("is-this-run")) {
      errors.push(`${where}: "${runLabel}" is not on the lit ${value.last.ending} tile: ${JSON.stringify(marked)}`);
    }
  }
}

// Every fork: what is named, what is lit, and the one marker.
function checkForks(board, value, origin, where, errors) {
  const runWord = origin === "title" ? "last run" : "this run";
  if (JSON.stringify(board.forks.map(row => row.fork)) !== JSON.stringify(ROW_ORDER)) errors.push(`${where}: fork rows ${board.forks.map(row => row.fork)}`);
  for (const row of board.forks) {
    const all = [];
    const taken = new Set();
    const lit = new Set();
    if (row.fork === "lethal") {
      for (const [who, first] of Object.entries(LETHAL_FIRST)) {
        for (const [outcome, words] of Object.entries(LETHAL_OUTCOME)) {
          const label = `${first} — ${words}`;
          all.push(label);
          if (value.forks.lethal[who] && value.forks.lethal[who][outcome]) taken.add(label);
          if (value.last && value.last.forks.lethal && value.last.forks.lethal[who] === outcome) { taken.add(label); lit.add(label); }
        }
        const faced = value.forks.lethal[who] || (value.last && value.last.forks.lethal && value.last.forks.lethal[who]);
        if (!faced && row.branches.some(b => b.full.includes(first))) errors.push(`${where}: ${first} named though no run faced the call`);
      }
    } else {
      for (const [branch, label] of Object.entries(FORK_LABELS[row.fork])) {
        all.push(label);
        if (value.forks[row.fork][branch]) taken.add(label);
        if (value.last && value.last.forks[row.fork] === branch) { taken.add(label); lit.add(label); }
      }
    }
    const named = row.branches.filter(b => !b.classes.includes("memory-marker") && !b.classes.includes("is-none")).map(b => b.text);
    for (const label of all) {
      if (!taken.has(label) && named.includes(label)) errors.push(`${where}: ${row.fork} names untaken "${label}"`);
      if (taken.has(label) && named.filter(text => text === label).length !== 1) errors.push(`${where}: ${row.fork} does not name taken "${label}" once`);
    }
    if (named.some(text => !all.includes(text))) errors.push(`${where}: ${row.fork} names an unknown branch ${JSON.stringify(named)}`);
    const litNow = row.branches.filter(b => b.classes.includes("is-lit")).map(b => b.text);
    if (JSON.stringify(litNow.sort()) !== JSON.stringify([...lit].sort())) errors.push(`${where}: ${row.fork} lit ${JSON.stringify(litNow)} expected ${JSON.stringify([...lit])}`);
    for (const b of row.branches.filter(b => b.classes.includes("is-lit"))) {
      if (!b.full.endsWith(`, ${runWord}`)) errors.push(`${where}: ${row.fork} lit branch lacks its "${runWord}" note`);
    }
    const none = row.branches.filter(b => b.classes.includes("is-none"));
    if (lit.size ? none.length : none.length !== 1 || none[0].text !== `Not reached ${runWord}`) errors.push(`${where}: ${row.fork} "Not reached ${runWord}" wrong (${lit.size} lit, ${none.length} none)`);
    const markers = row.branches.filter(b => b.classes.includes("memory-marker"));
    const untaken = all.length - taken.size;
    if (markers.length !== (untaken ? 1 : 0)) errors.push(`${where}: ${row.fork} has ${markers.length} markers with ${untaken} untaken branches`);
    for (const m of markers) {
      if (m.label !== "Something else was possible here" || m.text !== "" || m.full !== "◌") errors.push(`${where}: ${row.fork} marker is not unnamed: ${JSON.stringify(m)}`);
    }
  }
  if (/\d/.test(board.text)) errors.push(`${where}: board prints a number: ${board.text}`);
}

function checkBoard(runtime, value, origin, where, errors) {
  const result = JSON.parse(openFromTitle(runtime, value));
  if (!result.opened) { errors.push(`${where}: board did not open`); return null; }
  checkTiles(result.board, value, origin, where, errors);
  checkForks(result.board, value, origin, where, errors);
  return result.board;
}

function surfaceChecks(errors) {
  const runtime = boot();
  // Empty store: no entry, no board.
  const empty = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    localStorage.removeItem(${JSON.stringify(KEY)});
    showTitleScreen();
    const titleHidden = !__visible("btn-memory-board");
    const opened = openMemoryBoard("title");
    return { titleHidden, opened, shown: __visible("memory-screen") };
  })())`));
  if (!empty.titleHidden || empty.opened || empty.shown) errors.push(`empty store: entry or board shown ${JSON.stringify(empty)}`);
  // In-run and in-cinematic: the board never opens, and every in-run screen hides it.
  setMemory(runtime, fullMemory());
  const inRun = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const out = {};
    beginFreshCampaign({ persist: false });
    showScreen("game");
    showScene("wake");
    out.game = [openMemoryBoard("title"), openMemoryBoard("what-remains"), openMemoryBoard("game"), __visible("memory-screen")];
    showCinematic("intro");
    out.cinematic = [openMemoryBoard("title"), __visible("memory-screen")];
    showScreen("ending");
    out.ending = [openMemoryBoard("title"), openMemoryBoard("what-remains"), __visible("memory-screen")];
    showTitleScreen();
    out.fromTitle = openMemoryBoard("title");
    out.barsWhileOpen = ["status", "meta", "crew-panel", "game-screen", "title-screen"].filter(__visible);
    showScreen("game");
    out.afterGame = __visible("memory-screen");
    showTitleScreen(); openMemoryBoard("title"); showCinematic("intro");
    out.afterCinematic = __visible("memory-screen");
    return out;
  })())`));
  if (inRun.game.some(Boolean)) errors.push(`board opened during a run: ${inRun.game}`);
  if (inRun.cinematic.some(Boolean)) errors.push(`board opened during a cinematic: ${inRun.cinematic}`);
  if (inRun.ending.some(Boolean)) errors.push(`board opened from the ending screen: ${inRun.ending}`);
  if (!inRun.fromTitle) errors.push("board did not open from the title");
  if (inRun.barsWhileOpen.length) errors.push(`visible behind the board: ${inRun.barsWhileOpen}`);
  if (inRun.afterGame || inRun.afterCinematic) errors.push("an in-run screen left the board showing");

  // Tiles and forks across fills.
  let boards = 0;
  const full = fullMemory();
  for (const origin of ["title"]) {
    checkBoard(runtime, full, origin, "full", errors); boards++;
    const all = JSON.parse(openFromTitle(runtime, full)).board;
    if (all.forks.some(row => row.branches.some(b => b.classes.includes("memory-marker")))) errors.push("full store still shows a marker");
  }
  const one = memory({ endings: { landfall: 1 }, forks: { crisis: { breath: 1 }, vault: { living: 1 }, tether: { slow: 1 }, lethal: { lena: { lived: 1 } }, final: { hold: 1 } },
    last: { ending: "landfall", lost: ["rourke"], forks: { crisis: "breath", vault: "living", tether: "slow", lethal: { lena: "lived" }, final: "hold" } } });
  checkBoard(runtime, one, "title", "one run", errors); boards++;
  const reachedOrder = memory({ runs: 3, endings: { fracture: 1, long_dark: 1, quiet_ship: 1 }, forks: { crisis: {}, vault: { future: 3 }, tether: {}, lethal: {}, final: { endure: 3 } },
    last: { ending: "long_dark", lost: [], forks: { vault: "future", final: "endure" } } });
  checkBoard(runtime, reachedOrder, "title", "first-reached order, forks not reached", errors); boards++;
  // One branch at a time: only that branch is named, the rest of the fork stays unnamed.
  for (const [fork, labels] of Object.entries(FORK_LABELS)) {
    for (const branch of Object.keys(labels)) {
      for (const asLast of [true, false]) {
        const forks = { crisis: {}, vault: {}, tether: {}, lethal: {}, final: {} };
        forks[fork][branch] = 1;
        const value = memory({ runs: 2, endings: { long_dark: 2 }, forks,
          last: { ending: "long_dark", lost: [], forks: asLast ? { [fork]: branch } : {} } });
        checkBoard(runtime, value, "title", `${fork}=${branch}${asLast ? " (last run)" : " (earlier run)"}`, errors); boards++;
      }
    }
  }
  for (const who of Object.keys(LETHAL_FIRST)) {
    for (const outcome of Object.keys(LETHAL_OUTCOME)) {
      for (const asLast of [true, false]) {
        const forks = { crisis: {}, vault: {}, tether: {}, lethal: { [who]: { [outcome]: 1 } }, final: {} };
        const value = memory({ runs: 2, endings: { fracture: 2 }, forks,
          last: { ending: "fracture", lost: [], forks: asLast ? { lethal: { [who]: outcome } } : {} } });
        checkBoard(runtime, value, "title", `lethal ${who}=${outcome}${asLast ? " (last run)" : " (earlier run)"}`, errors); boards++;
      }
    }
  }

  // Forget this ship: only from the title, behind a confirm, and only the memory key.
  const forget = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const others = ${JSON.stringify(OTHER_KEYS)};
    for (const [k, v] of Object.entries(others)) localStorage.setItem(k, v);
    const memoryValue = ${JSON.stringify(JSON.stringify(full))};
    localStorage.setItem(${JSON.stringify(KEY)}, memoryValue);
    const out = {};
    // Not offered from What Remains.
    showScreen("what-remains");
    out.remainsOpened = openMemoryBoard("what-remains");
    out.remainsForget = __visible("memory-forget");
    out.remainsBack = document.getElementById("memory-back").textContent;
    out.remainsConfirm = showMemoryForgetConfirm();
    closeMemoryBoard();
    // From the title: Cancel keeps everything.
    showTitleScreen();
    openMemoryBoard("title");
    out.titleForget = __visible("memory-forget");
    document.getElementById("memory-forget").focus();
    out.confirmShown = showMemoryForgetConfirm();
    out.confirmFocus = document.activeElement && document.activeElement.id;
    cancelMemoryForget();
    out.afterCancel = [localStorage.getItem(${JSON.stringify(KEY)}) === memoryValue, __visible("memory-forget-confirm"), document.activeElement && document.activeElement.id];
    showMemoryForgetConfirm();
    out.cleared = confirmMemoryForget();
    out.key = localStorage.getItem(${JSON.stringify(KEY)});
    out.others = Object.entries(others).filter(([k, v]) => localStorage.getItem(k) !== v).map(([k]) => k);
    out.runs = shipMemoryRead().runs;
    out.title = [__visible("title-screen"), __visible("memory-screen"), __visible("btn-memory-board")];
    out.status = document.getElementById("title-save-status").textContent;
    return out;
  })())`));
  if (!forget.remainsOpened || forget.remainsForget || forget.remainsConfirm) errors.push(`Forget offered from What Remains: ${JSON.stringify(forget)}`);
  if (forget.remainsBack !== "Return to what remains") errors.push(`What Remains back label: ${forget.remainsBack}`);
  if (!forget.titleForget || !forget.confirmShown) errors.push("Forget not offered from the title");
  if (forget.confirmFocus !== "memory-forget-cancel") errors.push(`confirm opened with focus on ${forget.confirmFocus}`);
  if (!forget.afterCancel[0] || forget.afterCancel[1] || forget.afterCancel[2] !== "memory-forget") errors.push(`Cancel did not keep the memory and return focus: ${forget.afterCancel}`);
  if (!forget.cleared || forget.key !== null || forget.runs !== 0) errors.push(`Forget did not clear the memory key: ${JSON.stringify(forget)}`);
  if (forget.others.length) errors.push(`Forget touched other keys: ${forget.others}`);
  if (!forget.title[0] || forget.title[1] || forget.title[2]) errors.push(`after Forget: title/board/entry ${forget.title}`);

  // Escape and focus return; the confirm's trap.
  setMemory(runtime, fullMemory());
  const keys = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const out = {};
    const dialog = document.getElementById("memory-forget-confirm");
    const controls = [document.getElementById("memory-forget-cancel"), document.getElementById("memory-forget-ok")];
    controls.forEach(el => { el.tagName = "BUTTON"; });
    dialog.querySelectorAll = () => controls;
    dialog.contains = node => node === dialog || controls.includes(node);
    showTitleScreen();
    document.getElementById("btn-memory-board").focus();
    openMemoryBoard("title");
    out.openFocus = document.activeElement.id;
    __press("Escape");
    out.titleEscape = [__visible("title-screen"), __visible("memory-screen"), document.activeElement.id];
    showScreen("what-remains");
    document.getElementById("btn-memory-board-remains").focus();
    openMemoryBoard("what-remains");
    __press("Escape");
    out.remainsEscape = [__visible("what-remains-screen"), __visible("memory-screen"), document.activeElement.id];
    showTitleScreen();
    openMemoryBoard("title");
    document.getElementById("memory-forget").focus();
    showMemoryForgetConfirm();
    const trail = [document.activeElement.id];
    for (const [key, shift] of [["Tab", false], ["Tab", false], ["Tab", true], ["Tab", true]]) {
      const taken = __press(key, shift);
      if (!taken) { const i = controls.indexOf(document.activeElement); document.activeElement = controls[i + (shift ? -1 : 1)] || document.getElementById("memory-back"); }
      trail.push(document.activeElement.id);
    }
    out.trap = trail;
    __press("Escape");
    out.confirmEscape = [__visible("memory-forget-confirm"), __visible("memory-screen"), document.activeElement.id, localStorage.getItem(${JSON.stringify(KEY)}) !== null];
    __press("Escape");
    out.secondEscape = [__visible("title-screen"), document.activeElement.id];
    return out;
  })())`));
  if (keys.openFocus !== "memory-heading") errors.push(`board opened with focus on ${keys.openFocus}`);
  if (!keys.titleEscape[0] || keys.titleEscape[1] || keys.titleEscape[2] !== "btn-memory-board") errors.push(`Escape from the title board: ${keys.titleEscape}`);
  if (!keys.remainsEscape[0] || keys.remainsEscape[1] || keys.remainsEscape[2] !== "btn-memory-board-remains") errors.push(`Escape from the What Remains board: ${keys.remainsEscape}`);
  if (JSON.stringify(keys.trap) !== JSON.stringify(["memory-forget-cancel", "memory-forget-ok", "memory-forget-cancel", "memory-forget-ok", "memory-forget-cancel"])) errors.push(`confirm focus trap: ${keys.trap}`);
  if (keys.confirmEscape[0] || !keys.confirmEscape[1] || keys.confirmEscape[2] !== "memory-forget" || !keys.confirmEscape[3]) errors.push(`Escape on the confirm: ${keys.confirmEscape}`);
  if (!keys.secondEscape[0] || keys.secondEscape[1] !== "btn-memory-board") errors.push(`second Escape: ${keys.secondEscape}`);
  return boards;
}

// Seeded real-play runs (no-repeat-lap runner pattern): the board reads this run, prints no cause
// of death, and leaves the ending and What Remains exactly as they were.
function realRunChecks(errors) {
  const runtime = boot();
  const result = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const choicesEl = document.getElementById("choices");
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    let seed = ${SEED};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const screenOf = id => { const el = document.getElementById(id); return JSON.stringify([el.className, [...el.classList.values]]); };
    const endingDom = () => JSON.stringify(["ending-screen", "ending-image-wrap", "ending-title", "ending-text", "ending-next-hint", "btn-what-remains"]
      .map(id => { const el = document.getElementById(id); return [id, el.textContent, el.children.length, [...el.classList.values].filter(c => c !== "hidden")]; }));
    const out = [];
    localStorage.removeItem(${JSON.stringify(KEY)});
    for (let r = 0; r < ${REAL_RUNS}; r++) {
      beginFreshCampaign({ persist: false });
      let outcome = "capped";
      for (let step = 0; step < 700; step++) {
        if (state.scene === "ending_check") { outcome = "ended"; break; }
        const scene = scenes[state.scene];
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) { outcome = "stuck"; break; }
        makeChoice(choices[Math.floor(rnd() * choices.length)]);
      }
      if (outcome !== "ended") { out.push({ outcome }); continue; }
      if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
      showScreen("ending");
      const ending = endingDom();
      showWhatRemains();
      const remains = [document.getElementById("what-remains-text").textContent, document.getElementById("what-remains-crew").textContent];
      const entry = __visible("btn-memory-board-remains");
      document.getElementById("btn-memory-board-remains").focus();
      const opened = openMemoryBoard("what-remains");
      const board = __board();
      const last = shipMemoryRead().last;
      __press("Escape");
      const back = [__visible("what-remains-screen"), document.activeElement.id];
      const remainsAfter = [document.getElementById("what-remains-text").textContent, document.getElementById("what-remains-crew").textContent];
      showScreen("ending");
      out.push({ outcome, entry, opened, board, last, back,
        endingTitle: document.getElementById("ending-title").textContent,
        endingSame: endingDom() === ending, remainsSame: JSON.stringify(remains) === JSON.stringify(remainsAfter),
        causes: Object.values(state.deathCause || {}).filter(Boolean), dead: [...state.dead] });
    }
    return out;
  })())`, 600_000));
  let ended = 0;
  let withDeaths = 0;
  let hardCalls = 0;
  result.forEach((run, i) => {
    if (run.outcome !== "ended") { errors.push(`real run ${i} did not end: ${run.outcome}`); return; }
    ended++;
    if (run.causes.length) withDeaths++;
    if (run.last && run.last.forks.lethal) hardCalls++;
    const where = `real run ${i} (${run.endingTitle})`;
    if (!run.entry || !run.opened) errors.push(`${where}: What Remains entry missing or board did not open`);
    const tile = run.board.endings.find(t => t.tag);
    if (!tile || tile.tag !== "This run" || tile.title !== run.endingTitle) errors.push(`${where}: "This run" tile is ${JSON.stringify(tile)}`);
    if (run.board.forget) errors.push(`${where}: Forget offered from What Remains`);
    for (const row of run.board.forks) {
      const lit = row.branches.filter(b => b.classes.includes("is-lit")).map(b => b.text);
      if (row.fork === "lethal") {
        const want = Object.entries((run.last.forks.lethal) || {}).map(([who, o]) => `${LETHAL_FIRST[who]} — ${LETHAL_OUTCOME[o]}`);
        if (JSON.stringify(lit.sort()) !== JSON.stringify(want.sort())) errors.push(`${where}: hard calls lit ${lit} expected ${want}`);
        for (const [who, o] of Object.entries(run.last.forks.lethal || {})) {
          if (o === "lived" && run.dead.includes(who)) errors.push(`${where}: ${who} reads came back but is dead`);
        }
      } else {
        const want = run.last.forks[row.fork] ? [FORK_LABELS[row.fork][run.last.forks[row.fork]]] : [];
        if (JSON.stringify(lit) !== JSON.stringify(want)) errors.push(`${where}: ${row.fork} lit ${lit} expected ${want}`);
      }
    }
    for (const cause of run.causes) if (run.board.text.toLowerCase().includes(String(cause).toLowerCase())) errors.push(`${where}: board prints the cause "${cause}"`);
    if (/\b(?:dead|died|death|killed)\b/i.test(run.board.text)) errors.push(`${where}: board words a death: ${run.board.text}`);
    if (/\d/.test(run.board.text)) errors.push(`${where}: board prints a number`);
    if (!run.endingSame) errors.push(`${where}: ending screen changed after the board`);
    if (!run.remainsSame) errors.push(`${where}: What Remains text changed after the board`);
    if (!run.back[0] || run.back[1] !== "btn-memory-board-remains") errors.push(`${where}: Escape did not return to What Remains: ${run.back}`);
  });
  if (result.length && result.filter(r => r.outcome === "ended").length) {
    const lastRun = result[result.length - 1];
    if (lastRun.board && lastRun.board.endings.length !== 7) errors.push("real runs: board does not hold seven tiles");
  }
  return { ended, withDeaths, hardCalls, runs: result.length };
}

async function browserChecks(errors) {
  let chromium;
  try { ({ chromium } = createRequire(import.meta.url)("playwright")); }
  catch (error) { return "NOT_AVAILABLE (playwright not installed; static layout rules checked instead)"; }
  const browser = await chromium.launch();
  const notes = [];
  try {
    for (const [width, height] of [[360, 640], [1280, 800]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript(([key, value]) => {
        localStorage.setItem("sunsplitter_tone_ack_v1", "1");
        localStorage.setItem(key, value);
      }, [KEY, JSON.stringify(fullMemory())]);
      await page.goto(pathToFileURL(resolve(ROOT, "index.html")).href);
      await page.click("#btn-memory-board");
      const sizes = await page.evaluate(() => {
        const main = document.getElementById("main");
        return { doc: [document.documentElement.scrollWidth, document.documentElement.clientWidth], docV: [document.documentElement.scrollHeight, document.documentElement.clientHeight], main: [main.scrollWidth, main.clientWidth],
          widest: Math.max(...[...document.querySelectorAll("#memory-screen *")].map(el => el.getBoundingClientRect().right)), focus: document.activeElement.id };
      });
      if (sizes.doc[0] > sizes.doc[1] || sizes.main[0] > sizes.main[1] || sizes.widest > width) errors.push(`${width}×${height}: horizontal scroll ${JSON.stringify(sizes)}`);
      if (sizes.docV[0] > sizes.docV[1]) errors.push(`${width}×${height}: root taller than the window (hidden text escapes #main) ${JSON.stringify(sizes.docV)}`);
      await page.click("#memory-forget");
      const trail = [await page.evaluate(() => document.activeElement.id)];
      for (const key of ["Tab", "Tab", "Shift+Tab", "Shift+Tab"]) { await page.keyboard.press(key); trail.push(await page.evaluate(() => document.activeElement.id)); }
      if (JSON.stringify(trail) !== JSON.stringify(["memory-forget-cancel", "memory-forget-ok", "memory-forget-cancel", "memory-forget-ok", "memory-forget-cancel"])) errors.push(`${width}×${height}: confirm trap ${trail}`);
      const inert = await page.evaluate(() => document.querySelector(".memory-actions").inert);
      if (!inert) errors.push(`${width}×${height}: board behind the confirm is not inert`);
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      const after = await page.evaluate(() => [document.activeElement.id, !document.getElementById("title-screen").classList.contains("hidden")]);
      if (after[0] !== "btn-memory-board" || !after[1]) errors.push(`${width}×${height}: Escape path ended at ${after}`);
      notes.push(`${width}×${height} scrollWidth ${sizes.main[0]}/${sizes.main[1]}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return `real Chromium ${notes.join(", ")}, confirm trap and Escape`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const started = Date.now();
  const errors = [];
  staticChecks(errors);
  const boards = surfaceChecks(errors);
  const real = realRunChecks(errors);
  let browser;
  try { browser = await browserChecks(errors); }
  catch (error) { browser = "threw"; errors.push(`browser pass threw: ${String(error && error.message).split("\n")[0]}`); }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (errors.length) {
    console.error(`FAIL sun-playerflow-memory-board (${seconds}s)`);
    errors.slice(0, 40).forEach(error => console.error(" - " + error));
    if (errors.length > 40) console.error(` - ... ${errors.length - 40} more`);
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-memory-board (absent from game/bars/cinematic/ending; ${boards} boards: 7 tiles, dim tiles empty, ` +
    `branches named only once taken, one marker per fork, This/Last run lit; Forget clears only ${KEY}; ` +
    `${real.ended}/${real.runs} seeded runs (${real.withDeaths} with deaths, ${real.hardCalls} with hard calls): ending and What Remains unchanged, no cause of death; ` +
    `Escape and focus return, confirm trap; browser: ${browser}; ${seconds}s)`);
}
