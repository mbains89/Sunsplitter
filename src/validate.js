// Sunsplitter — validate.js
// Version 0.28 — + Off-Shift / pairs / warmth engineFlags
// Scene validation. Runs when ?validate=1 or localStorage.sunsplitter_validate=1.
// Strict scene shape: only text | choices | onEnter | image
// Choice shape: ALLOWED_CHOICE_KEYS (text/next/effects/affinity/flag/lean/requires/trust/alive/aliveAll/aliveAny/mark/remember/tag)
// Also: next-target graph, flag read/write, romance gate consistency, image map hygiene.

(function () {
  const ALLOWED_KEYS = new Set(["text", "choices", "onEnter", "image"]);
  // Exhaustive against current usage + tag (bond/private labels). onChoose removed 0.26.1.
  const ALLOWED_CHOICE_KEYS = new Set([
    "text", "next", "effects", "affinity", "flag", "lean", "requires",
    "trust", "alive", "aliveAll", "aliveAny", "mark", "remember", "tag"
  ]);
  const ROMANCE_IDS = ["lena", "mira", "amara", "sela"];

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
    return choiceList;
  }

  function validate() {
    const errors = [];
    const warnings = [];

    if (typeof scenes === "undefined" || !scenes || typeof scenes !== "object") {
      console.error("[Sunsplitter validate] scenes object missing");
      return { errors: ["scenes missing"], warnings: [], count: 0 };
    }

    const ids = Object.keys(scenes);
    if (ids.length === 0) errors.push("no scenes registered");

    const nextGraph = {}; // id -> Set of next ids
    const writtenFlags = new Set();
    const readFlags = new Set();
    const allNexts = new Set();

    for (const id of ids) {
      const sc = scenes[id];
      if (!sc || typeof sc !== "object") {
        errors.push(`${id}: not an object`);
        continue;
      }

      // Required: text
      const desc = Object.getOwnPropertyDescriptor(sc, "text");
      if (!desc && sc.text === undefined) errors.push(`${id}: missing text`);

      // Illegal keys (strict shape)
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
        // Choice-level shape (same severity as scene ALLOWED_KEYS)
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
        // Flag writes from choice.flag
        if (c.flag && typeof c.flag === "object") {
          Object.keys(c.flag).forEach(fk => writtenFlags.add(fk));
        }
        // Mark writes
        if (c.mark && typeof c.mark === "object") {
          Object.keys(c.mark).forEach(mk => writtenFlags.add("mark:" + mk));
        }
      });

      // Flag/mark reads inside text getters (best-effort static scan)
      try {
        const src = sc.text && sc.text.toString ? sc.text.toString() : "";
        const onSrc = sc.onEnter && sc.onEnter.toString ? sc.onEnter.toString() : "";
        const chSrc = sc.choices && sc.choices.toString ? sc.choices.toString() : "";
        const blob = src + "\n" + onSrc + "\n" + chSrc;
        for (const m of blob.matchAll(/flags\.([a-zA-Z0-9_]+)/g)) readFlags.add(m[1]);
        for (const m of blob.matchAll(/flags\[['\"]([a-zA-Z0-9_]+)['\"]\]/g)) readFlags.add(m[1]);
        for (const m of blob.matchAll(/marks\.([a-zA-Z0-9_]+)/g)) readFlags.add("mark:" + m[1]);
      } catch (_) {}

      // image path if scene.image set
      if (sc.image && typeof sc.image === "string") {
        if (!sc.image.startsWith("images/") && !sc.image.startsWith("./images/")) {
          warnings.push(`${id}: image path "${sc.image}" looks nonstandard`);
        }
      }
    }

    // --- next-target graph: orphans not in any choice.next from static resolve ---
    // Dynamic getters (intimacy/pursuit) may omit options without full state; scan source too.
    // Prefer property descriptors so we do not invoke getters (which need full state).
    let allSource = "";
    try {
      for (const id of ids) {
        const sc = scenes[id];
        const chDesc = Object.getOwnPropertyDescriptor(sc, "choices");
        if (chDesc && chDesc.get) allSource += chDesc.get.toString() + "\n";
        else if (sc.choices && sc.choices.toString) allSource += sc.choices.toString() + "\n";
        const teDesc = Object.getOwnPropertyDescriptor(sc, "text");
        if (teDesc && teDesc.get) allSource += teDesc.get.toString() + "\n";
        if (sc.onEnter && sc.onEnter.toString) allSource += sc.onEnter.toString() + "\n";
      }
    } catch (_) {}
    for (const id of ids) {
      if (id === "wake" || id === "ending_check") continue;
      if (allNexts.has(id)) continue;
      if (allSource.includes('"' + id + '"') || allSource.includes("'" + id + "'")) continue;
      warnings.push(`graph: "${id}" is never referenced as next/onEnter target`);
    }

    // --- sceneImages map ---
    const imagePaths = new Set();
    if (typeof sceneImages === "object" && sceneImages) {
      for (const [sid, path] of Object.entries(sceneImages)) {
        if (typeof path !== "string" || !path.length) {
          errors.push(`sceneImages["${sid}"] empty`);
        } else {
          imagePaths.add(path);
          if (!path.includes("/")) warnings.push(`sceneImages["${sid}"] path has no directory: ${path}`);
        }
        // unused map keys (scene id not registered)
        if (sid !== "ending_check" && !scenes[sid] && !sid.startsWith("ending_")) {
          warnings.push(`sceneImages["${sid}"] has no matching scene id`);
        }
      }
    } else {
      warnings.push("sceneImages map missing");
    }

    // scene.image values not in map (informational)
    for (const id of ids) {
      const sc = scenes[id];
      if (sc && typeof sc.image === "string" && imagePaths.size && !imagePaths.has(sc.image)) {
        // not an error — inline image is fine
      }
    }

    // --- romance gate consistency (default-offer rule) ---
    // intimacy_window should not hard-gate on affinity/trust numerics in source
    if (scenes.intimacy_window) {
      try {
        const src = [
          scenes.intimacy_window.choices && scenes.intimacy_window.choices.toString(),
          scenes.intimacy_window.text && scenes.intimacy_window.text.toString()
        ].filter(Boolean).join("\n");
        if (/affinity\.(mira|amara|sela|lena)\s*\|\|\s*0\)\s*>=\s*\d+/.test(src)) {
          warnings.push("romance: intimacy_window still has numeric affinity gates (expected default-offer)");
        }
        if (/trust\.(mira|amara|sela|lena)\s*\|\|\s*0\)\s*>=\s*\d+/.test(src)) {
          warnings.push("romance: intimacy_window still has numeric trust gates (expected default-offer)");
        }
        // declined mark should appear (string or hasMark)
        if (!/declined/.test(src) && !/hasMark\(/.test(src)) {
          warnings.push("romance: intimacy_window may not check marks.*.declined");
        }
      } catch (_) {}
    }

    // --- flag READ vs WRITE audit ---
    // dead writes: written in choices but never read in getters
    const deadWrites = [...writtenFlags].filter(f => !readFlags.has(f) && !f.startsWith("mark:"));
    // ignore very common engine-consumed flags
    const engineFlags = new Set([
      "crisis", "vault_sacrifice", "mid_arc", "final", "planet", "leadership", "reckon",
      "hydro", "power", "stores", "signal", "past", "cascade_truth", "ship_memory",
      "sun_doctrine", "departure_truth", "ship_interrupt", "ship_interrupt_fired",
      "feedstock", "coolant", "pregnancy_risk", "vault_priority", "vault_voice",
      "abandoned", "tomas", "sela_attention", "priority", "rourke", "mira_favor",
      "patch", "elias_power", "lena_authority", "interrupt_return",
      // 0.24.1 crisis-request currencies (read in concreteRunFacts / later lethals)
      "sela_vault_vow", "lena_regen", "mira_memory_public", "amara_vent_delayed",
      "pursuit_mira_cost", "pursuit_amara_cost", "pursuit_sela_cost", "pursuit_lena_cost",
      "busDowngraded", "reaction_mass_spent", "last_tx_spent", "vess_intimate",
      "vess_course_lost",
      // 0.26 exclusive crises (onEnter-only writes; read later in concreteRunFacts / What remains)
      "breath_word", "breath_answer", "custody_roll", "custody_answer",
      // 0.27 spoken promises
      "prom_amara", "prom_tomas", "prom_elias", "prom_lena", "prom_sela", "prom_mira",
      "prom_deck4_edited", "prom_deck4_buried", "prom_line_other", "prom_line_held",
      // 0.27.2 allusion carriers (one-shot mid-run re-surface)
      "prom_amara_alluded", "prom_tomas_alluded", "prom_elias_alluded",
      "prom_lena_alluded", "prom_sela_alluded", "prom_mira_alluded",
      // 0.28 Off-Shift + pairs + warmth
      "junctionChoice", "lena_notes", "mira_fault_known", "course_briefed",
      "pair_shield", "pair_grudge", "pair_favor",
      "warmth_meal", "warmth_laughter", "warmth_music"
    ]);
    deadWrites.forEach(f => {
      if (!engineFlags.has(f)) warnings.push(`flag WRITE-only (no scene read found): ${f}`);
    });

    // --- Reachability BFS from wake (static next only; getters may hide branches) ---
    const reachable = new Set();
    const queue = ["wake"];
    while (queue.length) {
      const cur = queue.shift();
      if (reachable.has(cur)) continue;
      reachable.add(cur);
      const outs = nextGraph[cur];
      if (outs) for (const n of outs) if (!reachable.has(n) && scenes[n]) queue.push(n);
    }
    // Also mark source-referenced ids as reachable for dynamic getters
    for (const id of ids) {
      if (reachable.has(id)) continue;
      if (allSource.includes('"' + id + '"') || allSource.includes("'" + id + "'")) reachable.add(id);
    }
    const unreachable = ids.filter(id => id !== "ending_check" && !reachable.has(id));
    unreachable.forEach(id => warnings.push(`reachability: "${id}" not reachable from wake (static+source)`));

    // Required scenes
    if (!scenes.ending_check) errors.push("missing required scene ending_check");
    if (!scenes.wake) errors.push("missing required scene wake");
    // 0.25 lethal chain presence
    for (const id of ["act3_lethal_lena_clock", "act3_lethal_tomas_cost", "act3_lethal_elias_order", "act3_lethal_mira_board"]) {
      if (!scenes[id]) errors.push("missing required 0.25 scene " + id);
    }

    // SPINE assert deferred until exclusive crises land (0.26+) — data-driven later

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
