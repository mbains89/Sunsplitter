// Interface at runtime: the Crew disclosure and its read-only stats, accessibility labels, the
// Supplies reserve and band, image residency and background resume, and scroll reset between
// surfaces.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadGame } from "../simulate.mjs";
import { ROOT } from "./shared.mjs";

export function crewOverviewChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const status = html.match(/<section id="status"[\s\S]*?<\/section>/)?.[0] || "";
  if (!/<button id="btn-crew" type="button"[^>]*onclick="toggleCrewPanel\(\)"[^>]*aria-controls="crew-panel"[^>]*aria-expanded="false"/.test(status) ||
      !status.includes('>Crew</span>') || status.includes('>Surv<') ||
      (html.match(/id="btn-crew"/g) || []).length !== 1) {
    errors.push("Crew must be the single native HUD disclosure, replacing Surv and the footer duplicate");
  }
  const fixture = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showScene("wake");
    persistSave({ silent: true });
    const panel = document.getElementById("crew-panel");
    const toggle = document.getElementById("btn-crew");
    const before = JSON.stringify(state);
    const save = localStorage.getItem("sunsplitter_save_v3");
    toggleCrewPanel();
    const parseRoster = html => {
      const living = [];
      const shown = [];
      const re = /class="([^"]*)" data-crew="([^"]+)"/g;
      let match;
      while ((match = re.exec(html))) {
        shown.push(match[2]);
        if (!match[1].split(" ").includes("dead")) living.push(match[2]);
      }
      return { living, shown };
    };
    const snapshot = () => {
      renderStatus();
      const html = panel.innerHTML;
      const roster = parseRoster(html);
      return {
        html,
        count: String(document.getElementById("stat-survivors").textContent),
        living: roster.living.slice(),
        shown: roster.shown.slice(),
        survivors: state.survivors
      };
    };
    const opened = Object.assign({
      html: panel.innerHTML,
      expanded: toggle.getAttribute("aria-expanded"),
      count: document.getElementById("stat-survivors").textContent,
      survivors: state.survivors
    }, parseRoster(panel.innerHTML));
    const wakeRoster = snapshot();
    renderCrewPanel("mira");
    toggleCrewPanel();
    const closed = !panel.classList.contains("visible") && toggle.getAttribute("aria-expanded") === "false";
    const stable = JSON.stringify(state) === before && localStorage.getItem("sunsplitter_save_v3") === save;
    const read = key => {
      panel.classList.remove("hidden");
      panel.classList.add("visible");
      const before = JSON.stringify(state);
      renderCrewPanel(key);
      return { html: panel.innerHTML, stable: JSON.stringify(state) === before };
    };
    kill("rourke", "opening loss fixture");
    const rourke = read("rourke");
    const afterRourke = snapshot();
    state.recovered.vess = true;
    state.trust.vess = 67;
    state.romance.vess = true;
    const vess = read("vess");
    const afterVess = snapshot();
    kill("vess", "<fault> & loss");
    const deadVess = read("vess");
    const afterDeadVess = snapshot();
    state.recovered.tomas = state.recovered.jiro = true;
    state.romance.amara_tomas = true;
    const amara = read("amara"), tomas = read("tomas");
    state.trust.mira = 0;
    const zeroTrust = read("mira");
    state.trust.mira = 100;
    const maxTrust = read("mira");
    state.dying.lena = "<injury> & decline";
    const injuredLena = read("lena");
    kill("lena", "decline fixture");
    panel.classList.add("hidden");
    panel.classList.remove("visible");
    toggleCrewPanel();
    const deadDefault = panel.innerHTML;
    state.recovered.vess = false;
    const absentDetail = read("vess");
    showScreen("title");
    const reset = panel.classList.contains("hidden") && !panel.classList.contains("visible") && toggle.getAttribute("aria-expanded") === "false";
    return {
      opened, wakeRoster, afterRourke, afterVess, afterDeadVess, closed, stable, reset,
      rourke, vess, deadVess, amara, tomas, zeroTrust, maxTrust, injuredLena, deadDefault, absentDetail
    };
  })()`);
  const countMatchesLiving = (row, label, expected) => {
    const living = row.living || [];
    if (String(row.count) !== String(living.length) || (expected != null && String(row.count) !== String(expected))) {
      errors.push(`Crew HUD ${label} count ${JSON.stringify(row.count)} != visible living names ${JSON.stringify(living)}`);
    }
  };
  if (fixture.opened.expanded !== "true" ||
      !fixture.opened.html.includes("Trust: 40/100") || !fixture.opened.html.includes("Romance: None recorded") ||
      !fixture.opened.html.includes("Condition: Alive")) errors.push("HUD Crew does not immediately show Lena's existing stats");
  if (fixture.opened.survivors !== 9) errors.push("mechanical survivors resource must remain 9 at wake");
  countMatchesLiving(fixture.opened, "wake open", 6);
  countMatchesLiving(fixture.wakeRoster, "wake status", 6);
  countMatchesLiving(fixture.afterRourke, "after Rourke death", 5);
  countMatchesLiving(fixture.afterVess, "after Vess recovery", 6);
  countMatchesLiving(fixture.afterDeadVess, "after Vess death", 5);
  if ((fixture.opened.living || []).includes("tomas") || (fixture.opened.shown || []).includes("vess")) {
    errors.push("wake Crew roster leaked unrecovered names into the living count");
  }
  for (const key of ["tomas", "jiro", "vess"]) {
    if (fixture.opened.html.includes('data-crew="' + key + '"')) errors.push(`unrecovered ${key} leaked into Crew overview`);
  }
  const expected = {
    rourke: ["Condition: Dead", "Trust (last recorded): Not recorded", "Romance: None recorded"],
    vess: ["Condition: Alive", "Trust: 67/100", "Romance: Recorded this run"],
    deadVess: ["Condition: Dead", "&lt;fault&gt; &amp; loss", "Trust (last recorded): 67/100", "Romance: Recorded this run", 'data-crew="vess"'],
    amara: ["Romance: Shared Amara–Tomas encounter recorded"],
    tomas: ["Romance: Shared Amara–Tomas encounter recorded"],
    zeroTrust: ["Trust: 0/100"],
    maxTrust: ["Trust: 100/100"],
    injuredLena: ["Condition: Alive — &lt;injury&gt; &amp; decline"]
  };
  for (const [key, fragments] of Object.entries(expected)) {
    if (!fixture[key].stable || fragments.some(fragment => !fixture[key].html.includes(fragment))) {
      errors.push(`Crew ${key} facts missing or render mutated state`);
    }
  }
  if (!fixture.deadDefault.includes("Condition: Dead — decline fixture") ||
      fixture.absentDetail.html.includes("67/100") || !fixture.absentDetail.stable) {
    errors.push("Crew default or unavailable-member detail misrepresents roster state");
  }
  if (!fixture.closed || !fixture.stable || !fixture.reset) errors.push("Crew disclosure mutated state/save or lost close/screen-reset semantics");
  return errors;
}

export function accessibilityRuntimeChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const crewPanel = document.getElementById("crew-panel");
    crewPanel.classList.add("hidden");
    crewPanel.classList.remove("visible");
    const crewToggle = document.getElementById("btn-crew");
    crewToggle.setAttribute("aria-expanded", "false");
    showScene("wake");
    const alternatives = Object.entries(scenes).map(([id, scene]) => {
      const src = resolveSceneImage(id, scene);
      return src ? { id, alt: imageAlternative(src) } : null;
    }).filter(Boolean);
    toggleCrewPanel();
    const sceneAlt = document.getElementById("scene-image").alt;
    const statusAnnouncement = document.getElementById("stat-announcer").textContent;
    const crewExpanded = crewToggle.getAttribute("aria-expanded");
    document.getElementById("ending-title").textContent = "Landfall";
    setEndingArt("images/ending_landfall.jpg");
    const endingAlt = document.getElementById("ending-image").alt;
    showScreen("what-remains");
    const remainsAlt = document.getElementById("what-remains-image").alt;
    return {
      scene: state.scene,
      sceneAlt,
      invalidAlternatives: alternatives.filter(row => !row.alt || row.alt === row.id || row.alt.includes("_")),
      statusAnnouncement,
      crewExpanded,
      endingAlt,
      remainsAlt
    };
  })()`);
  if (!fixture.sceneAlt || fixture.sceneAlt === fixture.scene || fixture.sceneAlt.includes("_")) {
    errors.push(`scene image alternative is not human-readable: ${fixture.sceneAlt || "missing"}`);
  }
  if (fixture.invalidAlternatives.length) {
    errors.push(`scene image alternative failures: ${JSON.stringify(fixture.invalidAlternatives.slice(0, 5))}`);
  }
  if (fixture.statusAnnouncement !== "Ship status: 6 survivors, hull integrity 62%, cohesion 48%, supplies 61%, embryos 100%.") {
    errors.push(`status announcement drifted: ${JSON.stringify(fixture)}`);
  }
  if (fixture.crewExpanded !== "true") errors.push("Crew disclosure did not announce expanded state");
  if (fixture.endingAlt !== "Landfall ending illustration." || fixture.remainsAlt !== "Landfall ending illustration.") {
    errors.push(`ending alternatives are not tied to the player-facing ending: ${JSON.stringify(fixture)}`);
  }
  return errors;
}

export function suppliesReserveChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    const fresh = state.supplies;
    const originalFreshState = freshState;
    let fallback;
    try {
      freshState = undefined;
      state.supplies = 0;
      resetRunState();
      fallback = state.supplies;
    } finally {
      freshState = originalFreshState;
    }

    const saves = [0, 4, 41, 61, 83, 100].map(supplies => {
      localStorage.clear();
      resetRunState();
      state.supplies = supplies;
      showScene("wake");
      const saved = persistSave({ silent: true });
      const raw = localStorage.getItem("sunsplitter_save_v3");
      resetRunState();
      const loaded = loadGame();
      const first = state.supplies;
      const loadedAgain = loadGame();
      showScene("wake", { skipOnEnter: true, resume: true });
      return { supplies, saved, loaded, loadedAgain, first, after: state.supplies,
        exactSave: localStorage.getItem("sunsplitter_save_v3") === raw };
    });

    localStorage.clear();
    resetRunState();
    showScene("dying");
    const paid = scenes.dying.choices.find(choice => choice.next === "rourke_end");
    makeChoice(paid);
    const afterSpend = state.supplies;
    showScene(state.scene, { skipOnEnter: true });
    showScene(state.scene, { skipOnEnter: true });
    const afterRender = state.supplies;
    // Separate affordability fixture: Rourke must still be alive to offer care.
    resetRunState();
    state.supplies = 0;
    // The headless DOM stub does not clear children when innerHTML is replaced.
    document.getElementById("choices").children = [];
    showScene("dying");
    const unpaidButton = gameplayChoiceButtons()[0];
    const unpaidDisabled = unpaidButton.disabled;
    const unpaidActivated = activateGameplayChoice(unpaidButton, {});
    return { fresh, fallback, saves, declared: paid.effects.supplies, afterSpend, afterRender,
      unpaidDisabled, unpaidActivated, unpaidScene: state.scene, unpaidSupplies: state.supplies };
  })()`);
  if (fixture.fresh !== 61 || fixture.fallback !== 61) {
    errors.push(`finite opening Supplies mismatch: fresh=${fixture.fresh}, fallback=${fixture.fallback}`);
  }
  for (const save of fixture.saves) {
    if (!save.saved || !save.loaded || !save.loadedAgain || !save.exactSave ||
        save.first !== save.supplies || save.after !== save.supplies) {
      errors.push(`saved Supplies were changed or could not resume: ${JSON.stringify(save)}`);
    }
  }
  if (fixture.declared !== -2 || fixture.afterSpend !== 59 || fixture.afterRender !== 59) {
    errors.push("opening reserve did not pay the existing cost exactly once, or rendering replenished it");
  }
  if (!fixture.unpaidDisabled || fixture.unpaidActivated || fixture.unpaidScene !== "dying" || fixture.unpaidSupplies !== 0) {
    errors.push("depleted Supplies bypassed the existing affordability gate");
  }
  return errors;
}

export function suppliesBandChecks(simulations) {
  const errors = [];
  const conserving = simulations.find(result => result.policy === "future");
  const generous = simulations.find(result => result.policy === "living");
  if (!conserving?.completed || !generous?.completed) return ["Supplies witnesses must reach real endings"];
  const supplies = [conserving.economy.initial.supplies,
    ...conserving.economy.transactions.flatMap(tx => [tx.before.supplies, tx.after.supplies])];
  const spend = result => result.economy.transactions.reduce((sum, tx) => sum - Math.min(0, tx.actual.supplies), 0);
  if (Math.min(...supplies) <= 50 || Math.max(...supplies) >= 100 || spend(conserving) < 10) {
    errors.push(`conserving fresh run must stay above 50 after real spending, without reaching the cap: min=${Math.min(...supplies)}, max=${Math.max(...supplies)}, spent=${spend(conserving)}`);
  }
  if (generous.resources.supplies >= 50 || spend(generous) <= 20) {
    errors.push("Supplies reserve became effectively unspendable on the generous fresh-run control");
  }
  return errors;
}

export function performanceRuntimeChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const stateDigest = () => JSON.stringify(state);
    const sceneImage = document.getElementById("scene-image");
    let assignments = 0;
    let assignedValue = "";
    Object.defineProperty(sceneImage, "src", {
      configurable: true,
      get() { return assignedValue; },
      set(value) { assignments += 1; assignedValue = String(value); }
    });
    delete sceneImage.__ssManagedSource;
    const firstAssign = setManagedImageSource(sceneImage, "images/wake.jpg");
    const repeatAssign = setManagedImageSource(sceneImage, "images/wake.jpg");
    const replacementAssign = setManagedImageSource(sceneImage, "images/bridge.jpg");
    const clearAssign = setManagedImageSource(sceneImage, "");
    const managedImage = {
      firstAssign,
      repeatAssign,
      replacementAssign,
      clearAssign,
      assignments,
      finalSource: assignedValue,
      managedSource: sceneImage.__ssManagedSource
    };

    setManagedImageSource(sceneImage, "images/wake.jpg");
    sceneImage.alt = "Scene illustration: Wake.";
    document.getElementById("ending-title").textContent = "Landfall";
    setEndingArt("images/ending_landfall.jpg");
    const beforeScreenState = stateDigest();
    showScreen("ending");
    const endingTransition = {
      sceneSource: sceneImage.__ssManagedSource,
      sceneAlt: sceneImage.alt,
      endingSource: document.getElementById("ending-image").__ssManagedSource,
      remainsSource: document.getElementById("what-remains-image").__ssManagedSource,
      stateSame: stateDigest() === beforeScreenState
    };
    showScreen("what-remains");
    const remainsTransition = {
      endingSource: document.getElementById("ending-image").__ssManagedSource,
      remainsSource: document.getElementById("what-remains-image").__ssManagedSource,
      stateSame: stateDigest() === beforeScreenState
    };
    showScreen("title");
    const titleTransition = {
      endingSource: document.getElementById("ending-image").__ssManagedSource,
      remainsSource: document.getElementById("what-remains-image").__ssManagedSource,
      endingAlt: document.getElementById("ending-image").alt,
      remainsAlt: document.getElementById("what-remains-image").alt,
      stateSame: stateDigest() === beforeScreenState
    };

    localStorage.clear();
    resetRunState();
    showScreen("game");
    showScene("wake");
    state.cohesion = 57;
    let saveAttempts = 0;
    let failNextSave = false;
    const originalPersistSave = persistSave;
    persistSave = function performanceProbePersistSave(opts) {
      saveAttempts += 1;
      if (failNextSave) {
        failNextSave = false;
        return false;
      }
      return originalPersistSave(opts);
    };
    window.dispatchEvent({ type: "pageshow", persisted: true });
    window.dispatchEvent({ type: "pagehide", persisted: true });
    const firstRaw = localStorage.getItem("sunsplitter_save_v3");
    document.visibilityState = "hidden";
    document.dispatchEvent({ type: "visibilitychange" });
    document.dispatchEvent({ type: "freeze" });
    const dedupedAttempts = saveAttempts;
    const dedupedRaw = localStorage.getItem("sunsplitter_save_v3");

    window.dispatchEvent({ type: "pageshow", persisted: true });
    state.cohesion = 58;
    failNextSave = true;
    window.dispatchEvent({ type: "pagehide", persisted: true });
    document.dispatchEvent({ type: "freeze" });
    const retriedRaw = localStorage.getItem("sunsplitter_save_v3");
    const retryAttempts = saveAttempts;

    window.dispatchEvent({ type: "pageshow", persisted: true });
    resetRunState();
    state.scene = "ending_check";
    state.cohesion = 18;
    persistSave = originalPersistSave;
    persistSave({ silent: true });
    const completedRaw = localStorage.getItem("sunsplitter_save_v3");
    resolveEnding();
    playAgain();
    window.dispatchEvent({ type: "pagehide", persisted: true });
    document.visibilityState = "hidden";
    document.dispatchEvent({ type: "visibilitychange" });
    document.dispatchEvent({ type: "freeze" });
    const protectedRaw = localStorage.getItem("sunsplitter_save_v3");
    makeChoice({ next: "wake", effects: { cohesion: 1 } });
    const committedRaw = localStorage.getItem("sunsplitter_save_v3");
    const committed = JSON.parse(committedRaw);
    document.visibilityState = "visible";
    document.dispatchEvent({ type: "visibilitychange" });

    return {
      managedImage,
      endingTransition,
      remainsTransition,
      titleTransition,
      lifecycle: {
        firstSaved: JSON.parse(firstRaw).cohesion === 57,
        dedupedAttempts,
        dedupedBytes: dedupedRaw === firstRaw,
        retryAttempts,
        retrySaved: JSON.parse(retriedRaw).cohesion === 58,
        completedProtected: protectedRaw === completedRaw,
        firstChoiceReplaced: committedRaw !== completedRaw,
        committedScene: committed.scene,
        committedCohesion: committed.cohesion
      }
    };
  })()`);

  const image = fixture.managedImage;
  if (!image.firstAssign || image.repeatAssign || !image.replacementAssign || !image.clearAssign ||
      image.assignments !== 3 || image.finalSource || image.managedSource) {
    errors.push(`managed image source did not dedupe/replace/release exactly: ${JSON.stringify(image)}`);
  }
  const ending = fixture.endingTransition;
  if (ending.sceneSource || ending.sceneAlt || !ending.endingSource || ending.remainsSource || !ending.stateSame) {
    errors.push(`ending transition did not release scene art while preserving ending art/state: ${JSON.stringify(ending)}`);
  }
  const remains = fixture.remainsTransition;
  if (remains.endingSource || !remains.remainsSource || !remains.stateSame) {
    errors.push(`What Remains did not move the one ending-art reference without changing state: ${JSON.stringify(remains)}`);
  }
  const title = fixture.titleTransition;
  if (title.endingSource || title.remainsSource || title.endingAlt || title.remainsAlt || !title.stateSame) {
    errors.push(`title transition retained hidden ending art or changed state: ${JSON.stringify(title)}`);
  }
  const lifecycle = fixture.lifecycle;
  if (!lifecycle.firstSaved || lifecycle.dedupedAttempts !== 1 || !lifecycle.dedupedBytes) {
    errors.push(`background lifecycle signals did not coalesce around one verified save: ${JSON.stringify(lifecycle)}`);
  }
  if (lifecycle.retryAttempts !== 3 || !lifecycle.retrySaved) {
    errors.push(`failed lifecycle save did not retry on the next signal: ${JSON.stringify(lifecycle)}`);
  }
  if (!lifecycle.completedProtected || !lifecycle.firstChoiceReplaced || lifecycle.committedScene !== "wake" || lifecycle.committedCohesion !== 49) {
    errors.push(`Play Again completed-slot custody failed across background/first choice: ${JSON.stringify(lifecycle)}`);
  }
  return errors;
}

export function screenTransitionScrollChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const main = document.getElementById("main");
    main.scrollTop = 231;
    showScreen("title");
    const titleTop = main.scrollTop;
    main.scrollTop = 177;
    showScreen("ending");
    const endingTop = main.scrollTop;
    main.scrollTop = 93;
    showScreen("what-remains");
    const whatRemainsTop = main.scrollTop;
    const crew = document.getElementById("crew-panel");
    const wrap = document.getElementById("scene-image-wrap");
    crew.classList.add("hidden");
    wrap.classList.add("visible");
    wrap.classList.remove("minimized");
    window.__ssImagePinned = true;
    toggleCrewPanel();
    return {
      titleTop,
      endingTop,
      whatRemainsTop,
      crewVisible: crew.classList.contains("visible"),
      imageMinimized: wrap.classList.contains("minimized"),
      imagePinned: window.__ssImagePinned
    };
  })()`);
  if (fixture.titleTop !== 0 || fixture.endingTop !== 0 || fixture.whatRemainsTop !== 0) {
    errors.push(`phone surface inherited stale scroll: ${JSON.stringify(fixture)}`);
  }
  if (!fixture.crewVisible || !fixture.imageMinimized || fixture.imagePinned) {
    errors.push(`Crew did not release scene-image space on a short phone: ${JSON.stringify(fixture)}`);
  }
  return errors;
}
