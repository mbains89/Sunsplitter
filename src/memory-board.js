// Sunsplitter — memory-board.js
// SUN-MEMORY-BOARD-01 (L-054; owner rulings 2026-11-25 D1(a) D2(a) D3(a) D8(a) D9(a)): the memory
// board. A post-run screen reached from What Remains and, once a run has ended, from the title. It
// is never on the game screen, the status bar, the meta bar or any other in-run surface (L-047).
//
// It shows what the ship memory store (src/ship-memory.js) holds and nothing else:
// - the seven endings as tiles: reached ones lit with their title, the one the last run reached
//   marked, the rest dim and empty (no text, so an unreached ending is never named);
// - the five great forks: the branch the last run took (lit), branches earlier runs took (dim),
//   and one unnamed marker while any branch of that fork has never been taken (D9(a));
// - "Forget this ship", only when opened from the title, behind a confirm (D8(a)).
// A branch is named only once some run has taken it. No count, date or cause of death is printed.
//
// renderMemoryBoard() is the one function here that reads the store (the isolation check pins it).

const MEMORY_BOARD_ENDING_TITLES = {
  yellow_circle: "The Yellow Circle",
  landfall: "Landfall",
  living_ship: "The Living Ship",
  quiet_ship: "The Quiet Ship",
  still_burning: "Still Burning",
  fracture: "Fracture",
  long_dark: "The Long Dark"
};
const MEMORY_BOARD_ENDING_COUNT = 7;
// Row label, then each branch's label in the store's branch order. D1(a): the crisis is the Act 3
// one, named by its event as What Remains names it (SUN-RECAP-HONESTY-01). D2(a): the tether
// fork is the catch.
const MEMORY_BOARD_FORKS = [
  { fork: "crisis", label: "The crisis", branches: { breath: "The biofilm", custody: "The thermal-spine overload" } },
  { fork: "vault", label: "The vault", branches: { future: "The restart package kept", living: "Habitation kept", split: "Both degraded" } },
  { fork: "tether", label: "The tether", branches: { slow: "The slow catch", hard: "The hard catch" } },
  { fork: "lethal", label: "The hard calls" },
  { fork: "final", label: "The last order", branches: { hold: "The course held", comfort: "Speed and comfort", transmission: "A last transmission", endure: "One day at a time" } }
];
// D3(a): a hard call reads "came back" or "did not come back". Fixed order; a person no run has
// faced is never named.
const MEMORY_BOARD_LETHAL_ORDER = ["lena", "tomas", "elias", "mira"];
const MEMORY_BOARD_LETHAL_FIRST = { lena: "Lena", tomas: "Tomas", elias: "Elias", mira: "Mira" };
const MEMORY_BOARD_LETHAL_OUTCOMES = { lived: "came back", lost: "did not come back" };
const MEMORY_BOARD_MARKER_LABEL = "Something else was possible here";
const MEMORY_BOARD_DIM_ENDING_LABEL = "An ending not yet reached";
const MEMORY_BOARD_RUN_LABEL = { title: "Last run", "what-remains": "This run" };
const MEMORY_BOARD_BACK_LABEL = { title: "Back to title", "what-remains": "Return to what remains" };
const MEMORY_BOARD_OPENERS = { title: "btn-memory-board", "what-remains": "btn-memory-board-remains" };

let memoryBoardOrigin = "title";
let memoryBoardConfirmBackground = [];

function memoryBoardElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function memoryBoardClear(el) {
  if (!el) return;
  if (typeof el.replaceChildren === "function") el.replaceChildren();
  else el.textContent = "";
}

function memoryBoardOriginVisible(origin) {
  const el = document.getElementById(origin === "what-remains" ? "what-remains-screen" : "title-screen");
  return !!(el && !el.classList.contains("hidden"));
}

// Read the store, set the two entry buttons, and build the board for `origin` ("title" or
// "what-remains"). Returns true when the ship remembers a finished run.
function renderMemoryBoard(origin) {
  const memory = shipMemoryRead();
  const last = memory.last;
  const remembers = memory.runs >= 1 && !!last;
  for (const id of Object.values(MEMORY_BOARD_OPENERS)) {
    const button = document.getElementById(id);
    if (button) button.classList.toggle("hidden", !remembers);
  }
  const where = origin === "what-remains" ? "what-remains" : "title";
  const runLabel = MEMORY_BOARD_RUN_LABEL[where];

  const endingsEl = document.getElementById("memory-endings");
  if (endingsEl) {
    memoryBoardClear(endingsEl);
    // Reached endings in first-reached order, then the dim ones, so a tile's place names nothing.
    const reached = Object.keys(memory.endings).filter(id => MEMORY_BOARD_ENDING_TITLES[id]);
    for (const id of reached) {
      const tile = memoryBoardElement("li", "memory-ending is-lit");
      tile.appendChild(memoryBoardElement("span", "memory-ending-title", MEMORY_BOARD_ENDING_TITLES[id]));
      if (remembers && last.ending === id) {
        tile.classList.add("is-this-run");
        tile.appendChild(memoryBoardElement("span", "memory-this-run", runLabel));
      }
      endingsEl.appendChild(tile);
    }
    for (let i = reached.length; i < MEMORY_BOARD_ENDING_COUNT; i++) {
      const tile = memoryBoardElement("li", "memory-ending is-dim");
      tile.setAttribute("aria-label", MEMORY_BOARD_DIM_ENDING_LABEL);
      endingsEl.appendChild(tile);
    }
  }

  const forksEl = document.getElementById("memory-forks");
  if (forksEl) {
    memoryBoardClear(forksEl);
    const lastForks = (remembers && last.forks) || {};
    for (const spec of MEMORY_BOARD_FORKS) {
      const row = memoryBoardElement("li", "memory-fork");
      row.setAttribute("data-fork", spec.fork);
      row.appendChild(memoryBoardElement("h3", "memory-fork-label", spec.label));
      const list = memoryBoardElement("ul", "memory-branches");
      const lit = [];
      const earlier = [];
      let untaken = false;
      if (spec.fork === "lethal") {
        const taken = memory.forks.lethal || {};
        const thisRun = lastForks.lethal || {};
        for (const who of MEMORY_BOARD_LETHAL_ORDER) {
          for (const outcome of Object.keys(MEMORY_BOARD_LETHAL_OUTCOMES)) {
            const label = `${MEMORY_BOARD_LETHAL_FIRST[who]} — ${MEMORY_BOARD_LETHAL_OUTCOMES[outcome]}`;
            if (thisRun[who] === outcome) lit.push(label);
            else if (taken[who] && taken[who][outcome]) earlier.push(label);
            else untaken = true;
          }
        }
      } else {
        const taken = memory.forks[spec.fork] || {};
        for (const branch of Object.keys(spec.branches)) {
          if (lastForks[spec.fork] === branch) lit.push(spec.branches[branch]);
          else if (taken[branch]) earlier.push(spec.branches[branch]);
          else untaken = true;
        }
      }
      if (!lit.length) list.appendChild(memoryBoardElement("li", "memory-branch is-none", `Not reached ${runLabel.toLowerCase()}`));
      for (const label of lit) {
        const item = memoryBoardElement("li", "memory-branch is-lit", label);
        item.appendChild(memoryBoardElement("span", "sr-only", `, ${runLabel.toLowerCase()}`));
        list.appendChild(item);
      }
      for (const label of earlier) list.appendChild(memoryBoardElement("li", "memory-branch is-dim", label));
      if (untaken) {
        const marker = memoryBoardElement("li", "memory-branch memory-marker");
        marker.setAttribute("aria-label", MEMORY_BOARD_MARKER_LABEL);
        const glyph = memoryBoardElement("span", "", "◌");
        glyph.setAttribute("aria-hidden", "true");
        marker.appendChild(glyph);
        list.appendChild(marker);
      }
      row.appendChild(list);
      forksEl.appendChild(row);
    }
  }

  const back = document.getElementById("memory-back");
  if (back) back.textContent = MEMORY_BOARD_BACK_LABEL[where];
  // D8(a): the reset is offered only from the title, outside any run.
  const forget = document.getElementById("memory-forget");
  if (forget) forget.classList.toggle("hidden", where !== "title" || !remembers);
  return remembers;
}

// Opened only from a post-run surface that is on screen: the title or What Remains.
function openMemoryBoard(origin) {
  if (origin !== "title" && origin !== "what-remains") return false;
  if (!memoryBoardOriginVisible(origin)) return false;
  hideMemoryForgetConfirm(false);
  if (!renderMemoryBoard(origin)) return false;
  memoryBoardOrigin = origin;
  showScreen("memory");
  return true;
}

function closeMemoryBoard() {
  const screen = document.getElementById("memory-screen");
  if (!screen || screen.classList.contains("hidden")) return false;
  hideMemoryForgetConfirm(false);
  const origin = memoryBoardOrigin;
  if (origin === "what-remains") showScreen("what-remains");
  else if (typeof showTitleScreen === "function") showTitleScreen();
  else showScreen("title");
  const opener = document.getElementById(MEMORY_BOARD_OPENERS[origin]);
  if (opener && !opener.classList.contains("hidden") && typeof opener.focus === "function") opener.focus();
  return true;
}

function showMemoryForgetConfirm() {
  const panel = document.getElementById("memory-forget-confirm");
  const screen = document.getElementById("memory-screen");
  if (!panel || !screen || screen.classList.contains("hidden") || memoryBoardOrigin !== "title") return false;
  // The rest of the board sits behind the dialog until it closes.
  memoryBoardConfirmBackground = Array.from(screen.children || [])
    .filter(el => el !== panel).map(el => [el, !!el.inert]);
  memoryBoardConfirmBackground.forEach(([el]) => { el.inert = true; });
  panel.classList.remove("hidden");
  panel.classList.add("visible");
  if (typeof focusModalDialog === "function") focusModalDialog("memory-forget-confirm");
  return true;
}

function hideMemoryForgetConfirm(restoreFocus = true) {
  const panel = document.getElementById("memory-forget-confirm");
  if (!panel) return;
  const wasOpen = panel.classList.contains("visible");
  panel.classList.add("hidden");
  panel.classList.remove("visible");
  memoryBoardConfirmBackground.forEach(([el, inert]) => { el.inert = inert; });
  memoryBoardConfirmBackground = [];
  if (!wasOpen) return;
  if (restoreFocus && typeof restoreModalDialogFocus === "function") restoreModalDialogFocus("memory-forget-confirm");
  else if (typeof modalDialogOpeners === "object") delete modalDialogOpeners["memory-forget-confirm"];
}

function cancelMemoryForget() {
  hideMemoryForgetConfirm(true);
  return false;
}

// Clears the memory key only, then returns to the title, where the board's entry is now hidden.
function confirmMemoryForget() {
  hideMemoryForgetConfirm(false);
  if (typeof shipMemoryForget === "function") shipMemoryForget();
  memoryBoardOrigin = "title";
  closeMemoryBoard();
  const status = document.getElementById("title-save-status");
  if (status) {
    status.classList.remove("error");
    status.textContent = "The ship has forgotten. Your saved run is untouched.";
  }
  return true;
}

// Reuse the title dialogs' keyboard handling (SUN-TUTORIAL-DIALOG-01): Tab stays inside the
// confirm, Escape cancels it, and focus starts on Cancel and returns to "Forget this ship".
(function wireMemoryBoardDialog() {
  if (typeof MODAL_DIALOG_PRIMARY === "object") MODAL_DIALOG_PRIMARY["memory-forget-confirm"] = "memory-forget-cancel";
  if (typeof MODAL_DIALOG_CANCEL === "object") MODAL_DIALOG_CANCEL["memory-forget-confirm"] = () => cancelMemoryForget();
})();

// The entry buttons follow the store whenever the title or What Remains is shown. Leaving the
// board for any other screen also closes its confirm.
(function wireMemoryBoardScreens() {
  if (typeof showScreen !== "function") return;
  const previousShow = showScreen;
  showScreen = function(id) {
    if (id !== "memory") hideMemoryForgetConfirm(false);
    previousShow(id);
    if (id === "title" || id === "what-remains") renderMemoryBoard(id);
  };
})();

// Escape on the board goes back where it was opened from. An open confirm takes Escape first.
function handleMemoryBoardKeydown(event) {
  if (!event || event.key !== "Escape" || event.defaultPrevented || event.repeat) return false;
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  const screen = document.getElementById("memory-screen");
  if (!screen || screen.classList.contains("hidden")) return false;
  if (typeof openModalDialogElement === "function" && openModalDialogElement()) return false;
  if (typeof event.preventDefault === "function") event.preventDefault();
  return closeMemoryBoard();
}
(function wireMemoryBoardKeyboard() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  document.addEventListener("keydown", handleMemoryBoardKeydown);
})();
