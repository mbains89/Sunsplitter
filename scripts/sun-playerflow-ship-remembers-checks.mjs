// SUN-SHIP-REMEMBERS-01 (L-054, ROADMAP §14A Wave 2 workstream 5) — the ship remembers.
// On a later run a few fixed lines acknowledge the last ending: one under the title contract (every
// ending reached overrides it), one on the tone screen (seen through "Revisit content notice"), and one
// paragraph in the wake of a fresh run. Drives the real engine through simulate.loadGame.
//   A  the line tables: one title and one wake line per ending, plus the all-seven and tone lines;
//      no line names a crew member or prints a number.
//   B  an empty store shows no line on the title, the tone screen or the wake.
//   C  per ending as last.ending: the title line follows it; the tone line shows on revisit; the wake
//      line shows on the fresh run's wake (behind the intro and on the first look after it) and
//      Play again; it is gone after the first choice. All seven reached: the title override.
//   D  the wake line is absent on Continue (a save parked on the wake), Load in a run, and Continue
//      after an import.
//   E  the seven forced endings: ending title, text, cinematic frames, What Remains text and crew
//      are byte-identical with the store empty and full; no line appears on those screens.
//   F  paced reveal: the wake line is one more paragraph; Read on reaches it before the choices.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_ship_memory_v1";
const ENDING_IDS = ["yellow_circle", "landfall", "living_ship", "quiet_ship", "still_burning", "fracture", "long_dark"];
// The setups of sun-playerflow-endings-checks.mjs, tightened so each reaches its own title (checked).
const FORCED_ENDINGS = [
  { title: "The Quiet Ship", apply: "state.survivors = 3; state.cohesion = 10; state.flags.final = 'endure';" },
  { title: "Landfall", apply: "state.survivors = 8; state.cohesion = 70; state.embryos = 80; state.integrity = 50; state.flags.crisis = 'custody'; state.flags.vault_sacrifice = 'future'; state.flags.final = 'hold'; state.flags.leadership = 'together';" },
  { title: "The Living Ship", apply: "state.survivors = 7; state.cohesion = 40; state.flags.vault_sacrifice = 'living'; state.flags.final = 'endure';" },
  { title: "Still Burning", apply: "state.survivors = 7; state.cohesion = 60; state.integrity = 40; state.flags.leadership = 'together'; state.flags.final = 'endure'; state.flags.vault_sacrifice = 'split';" },
  { title: "Fracture", apply: "state.survivors = 6; state.cohesion = 12; state.flags.leadership = 'watch'; state.flags.final = 'endure';" },
  { title: "The Long Dark", apply: "state.survivors = 6; state.cohesion = 36; state.integrity = 28; state.flags.final = 'endure'; state.flags.vault_sacrifice = 'split';" },
  { title: "The Yellow Circle", apply: "state.survivors = 7; state.cohesion = 55; state.flags.final = 'endure'; state.marks.sela = 'spoken'; state.flags.sela_attention = 'present'; state.flags.vault_sacrifice = 'living';" }
];

function memoryWith(lastEnding, endings) {
  return {
    v: 1, runs: Object.values(endings).reduce((a, b) => a + b, 0),
    endings, lost: { rourke: 1, lena: 1 }, plates: ["vault"],
    forks: { crisis: { breath: 1 }, vault: {}, tether: {}, lethal: {}, final: { endure: 1 } },
    last: { ending: lastEnding, lost: ["rourke", "lena"], forks: { crisis: "breath", final: "endure" } },
    prints: ["0000000a"], trail: []
  };
}

const FULL = memoryWith("yellow_circle", Object.fromEntries(ENDING_IDS.map(id => [id, 1])));

// Shared helpers inside the runtime: storage, the wake's rendered line, a fresh run through the title.
const PRELUDE = `
  window.confirm = () => true;
  const KEY = ${JSON.stringify(KEY)};
  const setMemory = value => value === null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, JSON.stringify(value));
  const story = () => document.getElementById("story").innerHTML;
  const wakeLines = () => (story().match(/<p class="ship-remembers">[^<]*<\\/p>/g) || []).map(p => p.slice(26, -4));
  const line = id => { const el = document.getElementById(id); return { text: el.textContent, hidden: el.classList.contains("hidden") }; };
  const titleNow = () => { showTitleScreen(); return line("title-remembers"); };
  const toneNow = () => { revisitTone(); const out = line("tone-remembers"); acknowledgeTone(); return out; };
  // Begin / New run as the title runs it: the overwrite confirm, then the Commander panel.
  const visible = id => document.getElementById(id).classList.contains("visible");
  const freshRun = () => {
    let started = startGame();
    if (!started && visible("new-run-confirm")) started = confirmNewRun();
    if (!started) started = advancePastCommanderCreate();
    const behind = wakeLines();
    const intro = !!currentCinematic;
    if (currentCinematic) finishCinematic();
    return { behind, intro, first: wakeLines(), scene: state.scene };
  };
`;

function run(runtime, body) {
  return runtime.evaluate(`(() => { ${PRELUDE} ${body} })()`);
}

export function sunPlayerflowShipRemembersChecks() {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };
  const runtime = loadGame(ROOT);

  // A — tables.
  const tables = JSON.parse(run(runtime, `return JSON.stringify({
    title: SHIP_REMEMBERS_TITLE, all: SHIP_REMEMBERS_TITLE_ALL, tone: SHIP_REMEMBERS_TONE, wake: SHIP_REMEMBERS_WAKE,
    names: Object.values(crew).flatMap(c => [c.name, c.first, ...c.name.split(/\\s+/)]),
    endingIds: SHIP_MEMORY_ENDING_IDS
  });`));
  check(JSON.stringify([...tables.endingIds].sort()) === JSON.stringify([...ENDING_IDS].sort()), `A: ending ids moved: ${tables.endingIds}`);
  const allLines = [tables.all, tables.tone];
  for (const id of ENDING_IDS) {
    check(typeof tables.title[id] === "string" && tables.title[id], `A: no title line for ${id}`);
    check(typeof tables.wake[id] === "string" && tables.wake[id], `A: no wake line for ${id}`);
    allLines.push(tables.title[id], tables.wake[id]);
  }
  for (const id of ENDING_IDS) check(!/\bthis room\b/i.test(tables.wake[id]), `A: wake line ${id} repeats the wake's closing "this room"`);
  check(Object.keys(tables.title).length === 7 && Object.keys(tables.wake).length === 7, "A: a table holds a line for something other than the seven endings");
  check(new Set(allLines).size === allLines.length, "A: two surfaces share a line");
  const names = [...new Set(tables.names.map(n => n.replace(/[^A-Za-z]/g, "")).filter(n => n.length > 2 && n !== "Brother"))];
  for (const text of allLines) {
    for (const name of names) check(!new RegExp(`\\b${name}\\b`, "i").test(text), `A: line names ${name}: "${text}"`);
    check(!/\d/.test(text), `A: line prints a number: "${text}"`);
    check(!/[<>&]/.test(text), `A: line carries markup: "${text}"`);
    check(!/\b(endings?|runs? through|saved?|play(?:ed|through)?|game|choices?|score)\b/i.test(text), `A: line talks about the game, not the ship: "${text}"`);
  }

  // B — empty store.
  const empty = JSON.parse(run(runtime, `
    localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
    return JSON.stringify({ title: titleNow(), tone: toneNow(), wake: freshRun() });`));
  check(empty.title.hidden && empty.title.text === "", `B: empty store shows a title line: ${JSON.stringify(empty.title)}`);
  check(empty.tone.hidden && empty.tone.text === "", `B: empty store shows a tone line: ${JSON.stringify(empty.tone)}`);
  check(empty.wake.scene === "wake" && !empty.wake.behind.length && !empty.wake.first.length, `B: empty store shows a wake line: ${JSON.stringify(empty.wake)}`);
  // A corrupt store reads as empty.
  const corrupt = JSON.parse(run(runtime, `
    localStorage.clear(); localStorage.setItem(KEY, "{\\"v\\":1,\\"runs\\":3,\\"endings\\":{");
    return JSON.stringify({ title: titleNow(), wake: freshRun().first });`));
  check(corrupt.title.hidden && !corrupt.wake.length, `B: a corrupt store shows a line: ${JSON.stringify(corrupt)}`);

  // C — per ending, then all seven.
  for (const id of ENDING_IDS) {
    const got = JSON.parse(run(runtime, `
      localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
      setMemory(${JSON.stringify(memoryWith(id, { [id]: 1 }))});
      const title = titleNow();
      const tone = toneNow();
      const fresh = freshRun();
      const choice = scenes.wake.choices.find(c => !c.alive || isAlive(c.alive));
      makeChoice(choice);
      const afterChoice = { scene: state.scene, lines: wakeLines() };
      // Back on the wake by no fresh start (a re-render of the scene) still shows nothing.
      showScene("wake", { skipOnEnter: true, resume: true });
      const rerender = wakeLines();
      playAgain();
      if (currentCinematic) finishCinematic();
      const again = wakeLines();
      return JSON.stringify({ title, tone, fresh, afterChoice, rerender, again });`));
    check(!got.title.hidden && got.title.text === tables.title[id], `C ${id}: title line ${JSON.stringify(got.title)}, expected "${tables.title[id]}"`);
    check(!got.tone.hidden && got.tone.text === tables.tone, `C ${id}: tone line on revisit ${JSON.stringify(got.tone)}`);
    check(got.fresh.intro && got.fresh.scene === "wake", `C ${id}: Begin did not play the intro into the wake: ${JSON.stringify(got.fresh)}`);
    check(JSON.stringify(got.fresh.behind) === JSON.stringify([tables.wake[id]]), `C ${id}: wake behind the intro ${JSON.stringify(got.fresh.behind)}`);
    check(JSON.stringify(got.fresh.first) === JSON.stringify([tables.wake[id]]), `C ${id}: wake on the first look ${JSON.stringify(got.fresh.first)}`);
    check(got.afterChoice.scene !== "wake" && !got.afterChoice.lines.length, `C ${id}: a line after the first choice ${JSON.stringify(got.afterChoice)}`);
    check(!got.rerender.length, `C ${id}: the wake re-rendered after the first choice still shows a line`);
    check(JSON.stringify(got.again) === JSON.stringify([tables.wake[id]]), `C ${id}: Play again's fresh wake ${JSON.stringify(got.again)}`);
  }
  const all = JSON.parse(run(runtime, `
    localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
    setMemory(${JSON.stringify(memoryWith("fracture", Object.fromEntries(ENDING_IDS.map(id => [id, 1]))))});
    const title = titleNow();
    const wake = freshRun().first;
    const six = ${JSON.stringify(memoryWith("fracture", Object.fromEntries(ENDING_IDS.slice(1).map(id => [id, 1]))))};
    setMemory(six);
    return JSON.stringify({ title, wake, six: titleNow() });`));
  check(all.title.text === tables.all && !all.title.hidden, `C all seven: title ${JSON.stringify(all.title)}`);
  check(JSON.stringify(all.wake) === JSON.stringify([tables.wake.fracture]), `C all seven: the wake still follows last.ending ${JSON.stringify(all.wake)}`);
  check(all.six.text === tables.title.fracture, `C six of seven: title ${JSON.stringify(all.six)}`);

  // D — Continue, Load and import are not fresh runs.
  const resumed = JSON.parse(run(runtime, `
    localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
    setMemory(${JSON.stringify(FULL)});
    const fresh = freshRun().first;                         // durable save parked on the wake
    showTitleScreen();
    const cont = (resumeGame(), { scene: state.scene, lines: wakeLines() });
    const load = (loadGame(), { scene: state.scene, lines: wakeLines() });
    const exported = buildSaveExport();
    const text = typeof exported === "string" ? exported : (exported && (exported.text || exported.json)) || JSON.stringify(exported);
    localStorage.removeItem(SAVE_KEY);
    showTitleScreen();
    const imported = importSaveText(text);
    const afterImport = (resumeGame(), { scene: state.scene, lines: wakeLines() });
    return JSON.stringify({ fresh, cont, load, imported, afterImport });`));
  check(resumed.fresh.length === 1, `D: the fresh run before Continue showed no line ${JSON.stringify(resumed.fresh)}`);
  check(resumed.cont.scene === "wake" && !resumed.cont.lines.length, `D: Continue on the wake ${JSON.stringify(resumed.cont)}`);
  check(resumed.load.scene === "wake" && !resumed.load.lines.length, `D: Load on the wake ${JSON.stringify(resumed.load)}`);
  check(resumed.imported === true, `D: the import fixture was not accepted (${JSON.stringify(resumed.imported)})`);
  check(resumed.afterImport.scene === "wake" && !resumed.afterImport.lines.length, `D: Continue after import ${JSON.stringify(resumed.afterImport)}`);

  // E — the seven forced endings, store empty and full.
  const lineTexts = allLines;
  const reached = new Set();
  for (const setup of FORCED_ENDINGS) {
    const screens = {};
    for (const mode of ["empty", "full"]) {
      const fresh = loadGame(ROOT);
      screens[mode] = JSON.parse(run(fresh, `
        localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
        setMemory(${mode === "full" ? JSON.stringify(FULL) : "null"});
        resetRunState();
        ${setup.apply}
        showScene("ending_check");
        const frames = currentCinematic ? currentCinematic.frames.slice() : null;
        const cinematic = [document.getElementById("cinematic-heading").textContent, document.getElementById("cinematic-text").textContent];
        if (currentCinematic) finishCinematic();
        const ending = [document.getElementById("ending-title").textContent, document.getElementById("ending-text").textContent,
          document.getElementById("ending-screen").innerHTML];
        showWhatRemains();
        const remains = [document.getElementById("what-remains-text").textContent, document.getElementById("what-remains-crew").textContent,
          document.getElementById("what-remains-screen").innerHTML];
        return JSON.stringify({ frames, cinematic, ending, remains });`));
    }
    const { empty: a, full: b } = screens;
    check(a.ending[0] === setup.title, `E: setup for ${setup.title} reached ${a.ending[0]}`);
    reached.add(a.ending[0]);
    check(JSON.stringify(a) === JSON.stringify(b), `E ${setup.title}: ending, cinematic or What Remains differs with the store full`);
    const shown = JSON.stringify(b);
    for (const text of lineTexts) check(!shown.includes(text), `E ${setup.title}: a ship-remembers line on the ending screens: "${text}"`);
  }
  check(reached.size === 7, `E: forced endings reached ${reached.size} of 7: ${[...reached].join(", ")}`);

  // F — paced reveal: the wake line is one more paragraph and Read on reaches it before the choices.
  const paced = JSON.parse(run(runtime, `
    const storyEl = document.getElementById("story");
    let cacheHtml = null; let nodes = [];
    storyEl.querySelectorAll = selector => {
      if (selector !== ".scene-text > p") return [];
      if (storyEl.innerHTML !== cacheHtml) {
        cacheHtml = storyEl.innerHTML;
        nodes = (cacheHtml.match(/<p[^>]*>[\\s\\S]*?<\\/p>/g) || []).map(markup => {
          const p = document.createElement("p");
          p.innerHTML = markup.replace(/^<p[^>]*>/, "").slice(0, -4);
          p.textContent = p.innerHTML.replace(/<[^>]+>/g, " ");
          return p;
        });
      }
      return nodes;
    };
    localStorage.clear(); localStorage.setItem("sunsplitter_tone_ack_v1", "1");
    setTextPace("paced");
    const measure = memory => {
      setMemory(memory);
      freshRun();
      const blocks = sceneReveal ? sceneReveal.blocks.length : 0;
      const pendingAtStart = document.getElementById("choices").classList.contains("reveal-pending");
      let taps = 0;
      while (sceneReveal && taps < 20) { advanceSceneReveal("pointer"); taps++; }
      const last = nodes[nodes.length - 1];
      return { blocks, pendingAtStart, taps, lastText: last ? last.textContent : "", lastHidden: last ? last.classList.contains("reveal-hidden") : null,
        pendingAtEnd: document.getElementById("choices").classList.contains("reveal-pending") };
    };
    const without = measure(null);
    const withLine = measure(${JSON.stringify(FULL)});
    return JSON.stringify({ without, withLine });`));
  check(paced.without.blocks >= 2 && paced.without.pendingAtStart, `F: the wake was not paced without memory ${JSON.stringify(paced.without)}`);
  check(paced.withLine.blocks === paced.without.blocks + 1, `F: the wake line is not one more paragraph ${JSON.stringify(paced)}`);
  check(paced.withLine.taps === paced.without.taps + 1, `F: Read on taps did not grow by one ${JSON.stringify(paced)}`);
  check(paced.withLine.lastText === tables.wake.yellow_circle && paced.withLine.lastHidden === false && !paced.withLine.pendingAtEnd,
    `F: the wake line was not revealed last, before the choices ${JSON.stringify(paced.withLine)}`);

  return { errors, lines: allLines.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, lines } = sunPlayerflowShipRemembersChecks();
  if (errors.length) {
    console.error(`FAIL sun-playerflow-ship-remembers (${errors.length})`);
    errors.slice(0, 40).forEach(error => console.error(" - " + error));
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-ship-remembers (${lines} lines, no crew name or number; empty and corrupt store silent; ` +
    `title follows last.ending with the all-seven override; tone on revisit; wake on a fresh run and its first look, ` +
    `not after the first choice, Continue, Load or import; seven forced endings and What Remains byte-identical; wake line paced as one more paragraph)`);
}
