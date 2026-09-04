// Sunsplitter — validate.js
// Version 0.29 — + Cascade Allusive flag domains
// Scene validation. Runs when ?validate=1 or localStorage.sunsplitter_validate=1.
// Strict scene shape: only text | choices | onEnter | image
// Choice shape: ALLOWED_CHOICE_KEYS (text/next/effects/affinity/flag/lean/requires/trust/alive/aliveAll/aliveAny/mark/remember/tag)
// Also: next-target graph, flag read/write, romance gate consistency, image map hygiene.

(function () {
  const ALLOWED_KEYS = new Set(["text", "choices", "onEnter", "image"]);
  const ALLOWED_CHOICE_KEYS = new Set([
    "text", "next", "effects", "affinity", "flag", "lean", "requires",
    "trust", "alive", "aliveAll", "aliveAny", "mark", "remember", "tag"
  ]);
  const ROMANCE_IDS = ["lena", "mira", "amara", "sela", "vess"];
  const ROMANCE_ID_PATTERN = ROMANCE_IDS.join("|");
  const LOCKED_FLAG_VALUES = {
    manifest: new Set(["read", "declined"]),
    changeorders: new Set(["logged", "buried"])
  };

  function shouldRun() {
    try {
      if (typeof location !== "undefined" && /[?&]validate=1\b/.test(location.search)) return true;
      if (typeof localStorage !== "undefined" && localStorage.getItem("sunsplitter_validate") === "1") return true;
    } catch (_) {}
    return false;
  }

  function collectChoiceLists(sc, id, warnings) {
    let choiceList = [];
    try {
      const raw = sc.choices;
      if (typeof raw === "function") choiceList = raw.call(sc) || [];
      else if (Array.isArray(raw)) choiceList = raw;
      else if (raw != null) warnings.push(`${id}: choices is not array/function`);
    } catch (e) {
      warnings.push(`${id}: choices getter threw (${e.message})`);
    }
    if (!Array.isArray(choiceList)) {
      warnings.push(`${id}: choices did not resolve to array`);
      return [];
    }
    const authored = livingCastOriginals.get(sc)?.choices;
    if (authored) {
      try {
        const raw = authored.get ? authored.get.call(sc) : authored.value;
        const original = typeof raw === "function" ? raw.call(sc) : raw;
        if (Array.isArray(original)) choiceList = [...new Set([...choiceList, ...original])];
      } catch (e) {
        warnings.push(`${id}: authored choices getter threw (${e.message})`);
      }
    }
    return choiceList;
  }

  function propertySource(object, key) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    const source = d => d?.get ? d.get.toString() : String(d?.value || "");
    return source(descriptor) + "\n" + source(livingCastOriginals.get(object)?.[key]);
  }

  function validate() {
    const errors = [];
    const warnings = [];

    if (typeof ROMANCEABLE !== "undefined") {
      const runtimeIds = [...ROMANCEABLE].sort();
      const validatorIds = [...ROMANCE_IDS].sort();
      if (JSON.stringify(runtimeIds) !== JSON.stringify(validatorIds)) {
        errors.push(`romance validator IDs ${validatorIds.join(",")} != runtime IDs ${runtimeIds.join(",")}`);
      }
    }

    if (typeof scenes === "undefined" || !scenes || typeof scenes !== "object") {
      console.error("[Sunsplitter validate] scenes object missing");
      return { errors: ["scenes missing"], warnings: [], count: 0 };
    }

    const ids = Object.keys(scenes);
    if (ids.length === 0) errors.push("no scenes registered");

    const nextGraph = {};
    const writtenFlags = new Set();
    const readFlags = new Set();
    const allNexts = new Set();

    for (const id of ids) {
      const sc = scenes[id];
      if (!sc || typeof sc !== "object") {
        errors.push(`${id}: not an object`);
        continue;
      }

      const desc = Object.getOwnPropertyDescriptor(sc, "text");
      if (!desc && sc.text === undefined) errors.push(`${id}: missing text`);

      for (const k of Object.keys(sc)) {
        if (!ALLOWED_KEYS.has(k)) {
          errors.push(`${id}: illegal key "${k}" (allowed: text, choices, onEnter, image)`);
        }
      }

      const choiceList = collectChoiceLists(sc, id, warnings);
      nextGraph[id] = new Set();

      choiceList.forEach((c, i) => {
        if (!c || typeof c !== "object") {
          errors.push(`${id}: choice[${i}] not an object`);
          return;
        }
        for (const ck of Object.keys(c)) {
          if (!ALLOWED_CHOICE_KEYS.has(ck)) {
            errors.push(`${id}: choice[${i}] illegal key "${ck}" (allowed: ${[...ALLOWED_CHOICE_KEYS].join(", ")})`);
          }
        }
        if (!c.text) warnings.push(`${id}: choice[${i}] missing text`);
        if (!c.next) {
          errors.push(`${id}: choice[${i}] missing next`);
          return;
        }
        nextGraph[id].add(c.next);
        allNexts.add(c.next);
        if (c.next !== "ending_check" && !scenes[c.next]) {
          errors.push(`${id}: choice[${i}] next "${c.next}" does not exist`);
        }
        if (c.flag && typeof c.flag === "object") {
          Object.keys(c.flag).forEach(fk => {
            writtenFlags.add(fk);
            const domain = LOCKED_FLAG_VALUES[fk];
            if (domain && !domain.has(c.flag[fk])) {
              errors.push(`${id}: choice[${i}] invalid ${fk} value ${JSON.stringify(c.flag[fk])}`);
            }
          });
        }
        if (c.mark && typeof c.mark === "object") {
          Object.keys(c.mark).forEach(mk => writtenFlags.add("mark:" + mk));
        }
      });

      try {
        const src = propertySource(sc, "text");
        const onSrc = propertySource(sc, "onEnter");
        const chSrc = propertySource(sc, "choices");
        const blob = src + "\n" + onSrc + "\n" + chSrc;
        for (const m of blob.matchAll(/flags\.([a-zA-Z0-9_]+)/g)) readFlags.add(m[1]);
        for (const m of blob.matchAll(/flags\[['\"]([a-zA-Z0-9_]+)['\"]\]/g)) readFlags.add(m[1]);
        for (const m of blob.matchAll(/marks\.([a-zA-Z0-9_]+)/g)) readFlags.add("mark:" + m[1]);
      } catch (_) {}

      if (sc.image && typeof sc.image === "string") {
        if (!sc.image.startsWith("images/") && !sc.image.startsWith("./images/")) {
          warnings.push(`${id}: image path "${sc.image}" looks nonstandard`);
        }
      }
    }

    let allSource = "";
    try {
      for (const id of ids) {
        const sc = scenes[id];
        for (const key of ["choices", "text", "onEnter"]) allSource += propertySource(sc, key) + "\n";
      }
    } catch (_) {}
    for (const id of ids) {
      if (id === "wake" || id === "ending_check") continue;
      if (allNexts.has(id)) continue;
      if (allSource.includes('"' + id + '"') || allSource.includes("'" + id + "'")) continue;
      warnings.push(`graph: "${id}" is never referenced as next/onEnter target`);
    }

    const imagePaths = new Set();
    if (typeof sceneImages === "object" && sceneImages) {
      for (const [sid, path] of Object.entries(sceneImages)) {
        if (typeof path !== "string" || !path.length) {
          errors.push(`sceneImages["${sid}"] empty`);
        } else {
          imagePaths.add(path);
          if (!path.includes("/")) warnings.push(`sceneImages["${sid}"] path has no directory: ${path}`);
        }
        if (sid !== "ending_check" && !scenes[sid] && !sid.startsWith("ending_")) {
          warnings.push(`sceneImages["${sid}"] has no matching scene id`);
        }
      }
    } else {
      warnings.push("sceneImages map missing");
    }

    for (const id of ids) {
      const sc = scenes[id];
      if (sc && typeof sc.image === "string" && imagePaths.size && !imagePaths.has(sc.image)) {
      }
    }

    if (scenes.intimacy_window) {
      try {
        const src = [
          propertySource(scenes.intimacy_window, "choices"),
          propertySource(scenes.intimacy_window, "text")
        ].filter(Boolean).join("\n");
        const affinityGate = new RegExp(`affinity\\.(${ROMANCE_ID_PATTERN})\\s*\\|\\|\\s*0\\)\\s*>=\\s*\\d+`);
        const trustGate = new RegExp(`trust\\.(${ROMANCE_ID_PATTERN})\\s*\\|\\|\\s*0\\)\\s*>=\\s*\\d+`);
        if (affinityGate.test(src)) {
          warnings.push("romance: intimacy_window still has numeric affinity gates (expected default-offer)");
        }
        if (trustGate.test(src)) {
          warnings.push("romance: intimacy_window still has numeric trust gates (expected default-offer)");
        }
        if (!/declined/.test(src) && !/hasMark\(/.test(src)) {
          warnings.push("romance: intimacy_window may not check marks.*.declined");
        }
      } catch (_) {}
    }

    const deadWrites = [...writtenFlags].filter(f => !readFlags.has(f) && !f.startsWith("mark:"));
    const engineFlags = new Set([
      "crisis", "vault_sacrifice", "mid_arc", "final", "planet", "leadership", "reckon",
      "hydro", "power", "stores", "signal", "past", "cascade_truth", "ship_memory",
      "sun_doctrine", "departure_truth", "ship_interrupt", "ship_interrupt_fired",
      "feedstock", "coolant", "pregnancy_risk", "vault_priority", "vault_voice",
      "abandoned", "tomas", "sela_attention", "priority", "rourke", "mira_favor",
      "patch", "elias_power", "lena_authority", "interrupt_return",
      "sela_vault_vow", "lena_regen", "mira_memory_public", "amara_vent_delayed",
      "pursuit_mira_cost", "pursuit_amara_cost", "pursuit_sela_cost", "pursuit_lena_cost",
      "busDowngraded", "reaction_mass_spent", "last_tx_spent", "vess_intimate",
      "breath_word", "breath_answer", "custody_roll", "custody_answer",
      "prom_amara", "prom_tomas", "prom_elias", "prom_lena", "prom_sela", "prom_mira",
      "prom_deck4_edited", "prom_deck4_buried", "prom_line_other", "prom_line_held",
      "prom_amara_alluded", "prom_tomas_alluded", "prom_elias_alluded",
      "prom_lena_alluded", "prom_sela_alluded", "prom_mira_alluded",
      "junctionChoice", "lena_notes", "mira_fault_known", "course_briefed",
      "pair_shield", "pair_grudge", "pair_favor",
      "warmth_meal", "warmth_laughter", "warmth_music",
      "manifest", "changeorders"
    ]);
    deadWrites.forEach(f => {
      if (!engineFlags.has(f)) warnings.push(`flag WRITE-only (no scene read found): ${f}`);
    });

    const reachable = new Set();
    const queue = ["wake"];
    while (queue.length) {
      const cur = queue.shift();
      if (reachable.has(cur)) continue;
      reachable.add(cur);
      const outs = nextGraph[cur];
      if (outs) for (const n of outs) if (!reachable.has(n) && scenes[n]) queue.push(n);
    }
    for (const id of ids) {
      if (reachable.has(id)) continue;
      if (allSource.includes('"' + id + '"') || allSource.includes("'" + id + "'")) reachable.add(id);
    }
    const unreachable = ids.filter(id => id !== "ending_check" && !reachable.has(id));
    unreachable.forEach(id => warnings.push(`reachability: "${id}" not reachable from wake (static+source)`));

    if (!scenes.ending_check) errors.push("missing required scene ending_check");
    if (!scenes.wake) errors.push("missing required scene wake");
    for (const id of ["act3_lethal_lena_clock", "act3_lethal_tomas_cost", "act3_lethal_elias_order", "act3_lethal_mira_board"]) {
      if (!scenes[id]) errors.push("missing required 0.25 scene " + id);
    }

    const summary = `[Sunsplitter validate] ${ids.length} scenes — ${errors.length} error(s), ${warnings.length} warning(s)`;
    if (errors.length) console.error(summary, errors);
    else if (warnings.length) console.warn(summary, warnings);
    else console.log(summary + " — clean");

    return {
      errors,
      warnings,
      count: ids.length,
      flags: { written: [...writtenFlags].sort(), read: [...readFlags].sort(), deadWrites },
      graph: Object.fromEntries(Object.entries(nextGraph).map(([k, v]) => [k, [...v]]))
    };
  }

  if (typeof window !== "undefined") {
    window.validateSunsplitter = validate;
  }

  function boot() {
    if (!shouldRun()) return;
    try {
      validate();
    } catch (e) {
      console.error("[Sunsplitter validate] crashed", e);
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})();

// SUN-PLAYTEST-CREW-CHARACTER-SCREEN-01 — full-screen sheet over existing crew chips.
// Loaded after engine.js. Does not invent stats or generate art.
const OFFICIAL_BODYSUIT = {
  lena: "images/bodysuit_lena.jpg",
  elias: "images/bodysuit_elias.jpg",
  mira: "images/bodysuit_mira.jpg",
  tomas: "images/bodysuit_tomas.jpg",
  amara: "images/bodysuit_amara.jpg",
  jiro: "images/bodysuit_jiro.jpg",
  sela: "images/bodysuit_sela.jpg",
  vess: "images/bodysuit_vess.jpg",
  rourke: "images/bodysuit_rourke.jpg"
};

function officialBodysuitSrc(key) {
  return OFFICIAL_BODYSUIT[key] || "";
}

function closeCrewSheet() {
  const sheet = document.getElementById("crew-sheet");
  if (!sheet) return;
  sheet.classList.add("hidden");
  sheet.classList.remove("visible");
  const img = document.getElementById("crew-sheet-image");
  if (img && typeof setManagedImageSource === "function") setManagedImageSource(img, "");
  else if (img && typeof img.removeAttribute === "function") img.removeAttribute("src");
  if (img) img.alt = "";
}

function openCrewSheet(key) {
  const sheet = document.getElementById("crew-sheet");
  if (!sheet || typeof crew === "undefined" || !crew[key]) {
    closeCrewSheet();
    return;
  }
  const c = crew[key];
  const dead = typeof isAlive === "function" ? !isAlive(key) : false;
  const role = c.role && c.role !== "None" ? c.role : "No rank";
  const trust = state.trust && state.trust[key];
  const affinity = state.affinity && state.affinity[key];
  const trustText = Number.isFinite(trust) ? (trust + "/100") : "Not recorded";
  const affinityText = Number.isFinite(affinity) ? (affinity + "/100") : "Not recorded";
  const romance = [];
  if (state.romance && state.romance[key]) romance.push("Recorded this run");
  if ((key === "amara" || key === "tomas") && state.romance && state.romance.amara_tomas) {
    romance.push("Shared Amara-Tomas encounter recorded");
  }
  const cause = dead ? ((state.deathCause && state.deathCause[key]) || "gone")
    : (state.dying && state.dying[key]);
  const condition = (dead ? "Dead" : "Alive") + (cause ? " - " + cause : "");
  const lean = (typeof crewLean === "object" && crewLean[key]) ? crewLean[key] : "";
  const nameEl = document.getElementById("crew-sheet-name");
  const roleEl = document.getElementById("crew-sheet-role");
  const factsEl = document.getElementById("crew-sheet-facts");
  const bioEl = document.getElementById("crew-sheet-bio");
  if (nameEl) nameEl.textContent = c.name;
  if (roleEl) roleEl.textContent = role + (lean ? " | lean " + lean : "");
  const factLines = [
    "Condition: " + condition,
    (dead ? "Trust (last recorded)" : "Trust") + ": " + trustText,
    "Affinity: " + affinityText,
    "Romance: " + (romance.join("; ") || "None recorded")
  ];
  if (!dead && state.marks && state.marks[key]) factLines.push("Marks: " + String(state.marks[key]).replace(/_/g, " "));
  if (factsEl) factsEl.textContent = factLines.join("\n");
  if (bioEl) bioEl.textContent = c.bio || "";
  const img = document.getElementById("crew-sheet-image");
  const wrap = document.getElementById("crew-sheet-portrait-wrap");
  const src = officialBodysuitSrc(key);
  if (src) {
    if (img && typeof setManagedImageSource === "function") setManagedImageSource(img, src);
    else if (img) img.src = src;
    if (img) img.alt = "Official bodysuit portrait of " + (c.first || c.name) + ".";
    if (wrap) wrap.classList.add("visible");
  } else {
    if (img && typeof setManagedImageSource === "function") setManagedImageSource(img, "");
    if (img) img.alt = "";
    if (wrap) wrap.classList.remove("visible");
  }
  sheet.classList.remove("hidden");
  sheet.classList.add("visible");
}

(function wireCrewCharacterSheet() {
  if (typeof renderCrewPanel === "function") {
    const previous = renderCrewPanel;
    renderCrewPanel = function(selectedKey) {
      previous(selectedKey);
      if (selectedKey && typeof crew !== "undefined" && crew[selectedKey]) openCrewSheet(selectedKey);
      else closeCrewSheet();
    };
  }
  if (typeof toggleCrewPanel === "function") {
    const previous = toggleCrewPanel;
    toggleCrewPanel = function() {
      previous();
      const panel = document.getElementById("crew-panel");
      if (!panel || !panel.classList.contains("visible")) closeCrewSheet();
    };
  }
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  document.addEventListener("keydown", event => {
    if (!event || event.key !== "Escape") return;
    const sheet = document.getElementById("crew-sheet");
    if (!sheet || !sheet.classList.contains("visible")) return;
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
    closeCrewSheet();
    const panel = document.getElementById("crew-panel");
    if (panel) {
      panel.classList.add("visible");
      panel.classList.remove("hidden");
    }
    const toggle = document.getElementById("btn-crew");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  });
})();

// SUN-PLAYTEST-ART-DOUBLECLICK-01 — documented minimize/expand (desktop dblclick stays in engine).
function toggleSceneArtSize() {
  const wrap = document.getElementById("scene-image-wrap");
  if (!wrap || !wrap.classList.contains("visible")) return false;
  wrap.classList.toggle("minimized");
  window.__ssImagePinned = true;
  return wrap.classList.contains("minimized");
}

// SUN-PLAYTEST-INTRO-BACK-ART-01 — Back on all 3 intro slides + in-tree slide art.
// Loaded after engine.js. Does not invent plates or opening prose.
const INTRO_SLIDE_ART = [
  "images/cascade_records.jpg",
  "images/ship_exterior_2.jpg",
  "images/arc_living_conflict.jpg"
];
const INTRO_SLIDE_ALT = [
  "Records of Earth's cascade.",
  "The Sunsplitter colonization ark.",
  "The living already arguing what to save."
];

function introSlideArt(index) {
  return INTRO_SLIDE_ART[index] || INTRO_SLIDE_ART[0];
}

function retreatCinematic() {
  if (!currentCinematic) return false;
  if (currentCinematic.index > 0) {
    currentCinematic.index -= 1;
    renderCinematicFrame(true);
    return true;
  }
  if (currentCinematic.kind === "intro") {
    cancelCinematic();
    showTitleScreen();
    return true;
  }
  return false;
}

(function overlayIntroBackArt() {
  if (typeof renderCinematicFrame !== "function" || typeof showCinematic !== "function") return;
  const previousRender = renderCinematicFrame;
  renderCinematicFrame = function(resetScroll) {
    previousRender(resetScroll);
    if (!currentCinematic) return;
    const back = document.getElementById("cinematic-back");
    if (back) {
      back.classList.toggle("hidden", currentCinematic.kind !== "intro");
      back.textContent = currentCinematic.kind === "intro" && currentCinematic.index === 0 ? "Back to title" : "Back";
    }
    if (currentCinematic.kind === "intro") {
      const img = document.getElementById("cinematic-image");
      setManagedImageSource(img, introSlideArt(currentCinematic.index));
      if (img) img.alt = INTRO_SLIDE_ALT[currentCinematic.index] || "";
    }
  };
  const previousShow = showCinematic;
  showCinematic = function(kind) {
    previousShow(kind);
    if (kind === "intro") renderCinematicFrame(false);
  };
})();
