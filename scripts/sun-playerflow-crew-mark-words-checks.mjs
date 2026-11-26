// SUN-CREW-MARK-WORDS-01 (decision 35, pending item 34) — the crew board shows each mark as words.
// #565 stopped printing raw state.marks tags ("dying held", "held only|declined") on the board and
// printed nothing in their place. The board now prints a "Between you:" line from crewMarkWords
// (src/state.js). This check pins, for the headless DOM:
//   1. every mark tag the scenes can write for a crew member has words: the tags are read from the
//      scene source, so a new tag without words fails here instead of going silently missing;
//   2. each tag alone paints its own sentence on the board, and nothing raw: no underscore, no "|",
//      no bracket tag, never the bare tag;
//   3. several tags (the "|" string the engine writes, and the object form older saves may hold)
//      paint one sentence per thread; an unknown tag paints nothing; a dead or unrecovered member
//      gets no line; a recorded romance takes the place of the stay-or-step-back sentence;
//   4. seeded real play (fresh campaign, recovery only through its own scenes): at every screen,
//      every living listed member with a mark gets words, and no board detail shows a raw tag;
//   5. the content notice chip #565 listed as internal-sounding reads as plain words (the export/import
//      and New run chips are SUN-SAVED-RUNS-01's since #594).
// It reads state only; no state key, flag or scene field is added.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = 60;
const MAX_STEPS = 700;
const SEED = 3405;

// Every (who, tag) the scene files and the engine-side helpers can write with mark().
export function writtenMarkTags(rootDir = ROOT) {
  const found = new Set();
  for (const name of readdirSync(resolve(rootDir, "src")).filter(f => f.endsWith(".js"))) {
    const text = readFileSync(resolve(rootDir, "src", name), "utf8");
    for (const m of text.matchAll(/\bmark\(\s*"([a-z]+)"\s*,\s*"([a-z_]+)"\s*\)/g)) found.add(`${m[1]}.${m[2]}`);
    for (const m of text.matchAll(/\bmark:\s*\{([^}]*)\}/g)) {
      for (const pair of m[1].matchAll(/([a-z]+)\s*:\s*"([a-z_]+)"/g)) found.add(`${pair[1]}.${pair[2]}`);
    }
  }
  return [...found].sort().map(row => row.split("."));
}

// A board line a player can read: words, not an id or a flag name.
function rawProblems(text, tag) {
  const out = [];
  if (/_/.test(text)) out.push("underscore");
  if (/\|/.test(text)) out.push("pipe");
  if (/\[[^\]]*\]/.test(text)) out.push("bracket tag");
  if (tag && text.trim().toLowerCase() === tag.replace(/_/g, " ")) out.push("bare tag");
  return out;
}

export function sunPlayerflowCrewMarkWordsChecks() {
  const errors = [];
  const written = writtenMarkTags();
  const runtime = loadGame(ROOT);

  // Parts 1–3: fixtures through the real board renderer.
  const fixture = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const panel = document.getElementById("crew-panel");
    const detailOf = () => {
      const m = String(panel.innerHTML).match(/<div class="crew-detail[^"]*" role="status">([\\s\\S]*?)<\\/div>/);
      return m ? m[1] : "";
    };
    const betweenOf = html => {
      const m = html.match(/<br>Between you: ([^<]*)$/);
      return m ? m[1] : null;
    };
    const fresh = () => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
      state.marks = {};
    };
    const paint = key => {
      closeCrewSheet();
      panel.classList.remove("hidden");
      panel.classList.add("visible");
      const before = JSON.stringify(state);
      renderCrewPanel(key);
      const html = detailOf();
      return { html, between: betweenOf(html), stable: JSON.stringify(state) === before };
    };
    const crewKeys = CREW_ORDER.filter(k => crew[k]);
    const threads = {};
    for (const [k, list] of Object.entries(CREW_MARK_WORDS)) threads[k] = list.map(t => t.map(([tag, words]) => ({ tag, words })));

    const single = [];
    for (const [who, tag] of ${JSON.stringify(written)}) {
      if (!crewKeys.includes(who)) { single.push({ who, tag, notCrew: true }); continue; }
      fresh();
      state.marks[who] = tag;
      const row = paint(who);
      single.push(Object.assign({ who, tag }, row));
    }

    // Every tag at once, in the "|" form the engine writes.
    const combined = [];
    for (const who of crewKeys) {
      const tags = (threads[who] || []).flat().map(t => t.tag);
      if (!tags.length) continue;
      fresh();
      state.marks[who] = tags.join("|");
      combined.push(Object.assign({ who, expect: (threads[who] || []).map(t => t[0].words) }, paint(who)));
    }

    fresh();
    state.marks.sela = { spoken: true, held_only: true };
    const objectForm = paint("sela");

    fresh();
    state.marks.lena = "mystery_tag";
    const unknown = paint("lena");
    fresh();
    state.marks.lena = "mystery_tag|watched_vent";
    const unknownMixed = paint("lena");

    fresh();
    state.marks.mira = "held_only|watched_stop";
    kill("mira", "mark words fixture");
    const dead = paint("mira");
    const deadWords = crewMarkWords("mira");

    fresh();
    state.recovered.vess = false;
    state.marks.vess = "accepted";
    const absentWords = crewMarkWords("vess");
    const absentBoard = paint("vess");

    fresh();
    state.marks.amara = "held_only|plants_matter";
    state.romance.amara = true;
    const romance = paint("amara");
    fresh();
    state.marks.amara = "declined";
    state.romance.amara_tomas = true;
    const sharedRomance = paint("amara");

    fresh();
    state.marks.lena = "watched_vent";
    closeCrewSheet();
    panel.classList.add("hidden");
    panel.classList.remove("visible");
    document.getElementById("btn-crew").setAttribute("aria-expanded", "false");
    toggleCrewPanel();
    const defaultOpen = betweenOf(detailOf());
    toggleCrewPanel();

    return { single, combined, objectForm, unknown, unknownMixed, dead, deadWords, absentWords, absentBoard,
      romance, sharedRomance, defaultOpen, threads };
  })())`));

  const wordsFor = (who, tag) => {
    for (const thread of fixture.threads[who] || []) for (const row of thread) if (row.tag === tag) return row.words;
    return null;
  };
  let pinned = 0;
  for (const row of fixture.single) {
    if (row.notCrew) continue;
    const label = `${row.who}.${row.tag}`;
    const expect = wordsFor(row.who, row.tag);
    if (!expect) { errors.push(`${label}: the scenes write this mark but crewMarkWords has no words for it`); continue; }
    if (!row.stable) errors.push(`${label}: painting the board changed state`);
    if (row.between !== expect) errors.push(`${label}: board shows ${JSON.stringify(row.between)}, expected ${JSON.stringify(expect)}`);
    const raw = rawProblems(row.html.replace(/<[^>]+>/g, " "), row.tag).concat(rawProblems(expect, row.tag));
    if (raw.length) errors.push(`${label}: board detail reads raw (${raw.join(", ")}): ${JSON.stringify(row.html)}`);
    if (/\b(score|morality|moral|good|bad|points?)\b/i.test(expect)) errors.push(`${label}: words read as a score: ${JSON.stringify(expect)}`);
    pinned++;
  }
  // Words with no writer would be dead text; flag them so the map stays honest.
  const writtenKeys = new Set(written.map(([who, tag]) => `${who}.${tag}`));
  for (const [who, threads] of Object.entries(fixture.threads)) {
    for (const thread of threads) for (const { tag } of thread) {
      if (!writtenKeys.has(`${who}.${tag}`)) errors.push(`${who}.${tag}: crewMarkWords has words for a tag no scene writes`);
    }
  }
  for (const row of fixture.combined) {
    if (row.between !== row.expect.join(" ")) errors.push(`${row.who} with every tag: ${JSON.stringify(row.between)} != one sentence per thread ${JSON.stringify(row.expect.join(" "))}`);
    const raw = rawProblems(row.html.replace(/<[^>]+>/g, " "));
    if (raw.length) errors.push(`${row.who} with every tag reads raw (${raw.join(", ")})`);
  }
  const sela = [wordsFor("sela", "spoken"), wordsFor("sela", "held_only")].join(" ");
  if (fixture.objectForm.between !== sela) errors.push(`object-form marks: ${JSON.stringify(fixture.objectForm.between)} != ${JSON.stringify(sela)}`);
  if (fixture.unknown.between !== null || /mystery/.test(fixture.unknown.html)) errors.push(`an unknown tag reached the board: ${JSON.stringify(fixture.unknown.html)}`);
  if (fixture.unknownMixed.between !== wordsFor("lena", "watched_vent") || /mystery|_/.test(fixture.unknownMixed.html)) {
    errors.push(`an unknown tag beside a known one: ${JSON.stringify(fixture.unknownMixed.html)}`);
  }
  if (fixture.dead.between !== null || fixture.deadWords !== "" || !/Condition: Dead/.test(fixture.dead.html)) {
    errors.push(`a dead member's marks were printed: ${JSON.stringify(fixture.dead.html)}`);
  }
  if (fixture.absentWords !== "" || /Between you/.test(fixture.absentBoard.html)) errors.push("an unrecovered member's marks were printed");
  if (fixture.romance.between !== wordsFor("amara", "plants_matter")) {
    errors.push(`romance recorded: stay-or-step-back sentence should yield to the Romance line, got ${JSON.stringify(fixture.romance.between)}`);
  }
  if (fixture.sharedRomance.between !== null) errors.push(`shared Amara–Tomas romance: declined sentence still printed: ${JSON.stringify(fixture.sharedRomance.between)}`);
  if (fixture.defaultOpen !== wordsFor("lena", "watched_vent")) errors.push(`opening Crew paints Lena without her words: ${JSON.stringify(fixture.defaultOpen)}`);

  // Part 4: seeded real play.
  const play = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    persistSave = () => true;
    const choicesEl = document.getElementById("choices");
    if (!choicesEl.__clearsOnInnerHTML) {
      let html = choicesEl.innerHTML;
      Object.defineProperty(choicesEl, "innerHTML", {
        configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; }
      });
      choicesEl.__clearsOnInnerHTML = true;
    }
    const panel = document.getElementById("crew-panel");
    let seed = ${SEED};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const silent = [], raw = [], seen = {};
    let screens = 0, ended = 0, worded = 0;
    for (let r = 0; r < ${RUNS}; r++) {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        screens++;
        for (const k of visibleCrewKeys()) {
          const cur = state.marks[k];
          if (!cur || !isAlive(k)) continue;
          const tags = typeof cur === "string" ? cur.split("|") : Object.keys(cur);
          tags.forEach(t => { seen[k + "." + t] = true; });
          const words = crewMarkWords(k);
          if (words) worded++;
          else if (silent.length < 8) silent.push({ run: r, id, who: k, marks: cur });
          if (/[_|\\[\\]]/.test(words) && raw.length < 8) raw.push({ run: r, id, who: k, words });
        }
        if (step % 25 === 0) {
          // Paint the board for every listed member now and then, as a player would see it.
          panel.classList.remove("hidden");
          panel.classList.add("visible");
          for (const k of visibleCrewKeys()) {
            renderCrewPanel(k);
            const text = String(panel.innerHTML).replace(/<[^>]+>/g, " ");
            if (/_|\\|/.test(text) && raw.length < 8) raw.push({ run: r, id, who: k, board: text.slice(0, 300) });
          }
          closeCrewSheet();
          panel.classList.add("hidden");
          panel.classList.remove("visible");
        }
        if (id === "ending_check" || !scenes[id]) { ended++; break; }
        const scene = scenes[id];
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) break;
        makeChoice(choices[Math.floor(rnd() * choices.length)]);
      }
    }
    return { silent, raw, seen: Object.keys(seen).sort(), screens, ended, worded };
  })())`, 600_000));
  // A mark can be silent only when a recorded romance has taken its place (checked above).
  const silentReal = play.silent.filter(row => {
    const tags = typeof row.marks === "string" ? row.marks.split("|") : Object.keys(row.marks);
    return !tags.every(tag => tag === "held_only" || tag === "declined");
  });
  if (silentReal.length) errors.push(`real play: a living member's marks painted no words: ${JSON.stringify(silentReal.slice(0, 4))}`);
  if (play.raw.length) errors.push(`real play: board shows a raw tag: ${JSON.stringify(play.raw.slice(0, 4))}`);
  if (play.ended < RUNS * 0.9) errors.push(`real play: only ${play.ended}/${RUNS} runs reached the ending`);

  // Part 5: the title chips #565 listed as internal-sounding (its open question 4). SUN-SAVED-RUNS-01
  // (#594) moved the export/import chip into the Saved runs dialog with its own words and paints the
  // New run confirm per slot (S-3's picker replaces it next), so those are #594's and not pinned here.
  // The content notice chip stays on the title in plain words; the export/import pair stays retired.
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const save = readFileSync(resolve(ROOT, "src/engine-save.js"), "utf8");
  const retired = [
    "Import anytime · Export appears when a durable slot exists",
    "Export ready · Import anytime (durable local slot)",
    "Reopens tone notice · does not clear notice acknowledged or save"
  ];
  for (const old of retired) if (html.includes(old) || save.includes(old)) errors.push(`title chip still reads ${JSON.stringify(old)}`);
  const notice = (html.match(/<p id="content-notice-chip"[^>]*>([^<]*)<\/p>/) || [])[1] ?? null;
  const plainNotice = "Shows the content notice again · nothing is reset";
  if (notice !== plainNotice) errors.push(`content notice chip: ${JSON.stringify(notice)} != ${JSON.stringify(plainNotice)}`);

  return { errors, pinned, play };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, pinned, play } = sunPlayerflowCrewMarkWordsChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-crew-mark-words");
    for (const e of errors) console.error("  " + e);
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-crew-mark-words (${pinned} scene-written crew mark tags each paint their own words; ` +
    `${play.ended}/${RUNS} seeded runs, ${play.screens} screens, ${play.worded} worded board reads, no raw tag; ` +
    `${play.seen.length} tags met in play; content notice chip plain)`);
}
