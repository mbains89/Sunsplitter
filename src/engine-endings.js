// Sunsplitter — engine-endings.js
// Endings: resolveEnding picks the ending, the build*Text functions write each one, and
// showWhatRemains, buildEndingFooter and setEndingArt put the ending screen together.
// Moved out of src/engine.js unchanged (SUN-CLEAN-ENGINE-ENDINGS-01, L-043). A plain script that
// index.html loads before engine.js, so everything here exists before engine.js runs.
// It uses three names from engine.js, all when called: currentEndingArt, crewFirstName and
// syncEndingArtForScreen.

// L-024 Option B: ending resolution never invents a result for an untested promise.
// Only an authored promise-test scene may change "made" to "kept" or "broken".
function forceResolvePromises() {
  if (!state.promises) return;
}

// SUN-RECAP-HONESTY-01: only a private memory is cited (lastPrivateMemory in state.js).
function lastEndingMemory() {
  const untestedHolders = Object.keys(state.promises || {}).filter(who => state.promises[who] === "made");
  return lastPrivateMemory(memory => {
    const lower = memory.toLowerCase();
    return untestedHolders.some(who => {
      const holder = crewFirstName(who).toLowerCase();
      return lower.includes("promis") && lower.includes(holder);
    });
  });
}

function resolveEnding() {
  forceResolvePromises();
  const s = state.survivors;
  const c = state.cohesion;
  const emb = state.embryos;
  const integ = state.integrity;
  const sup = state.supplies;
  const deadNames = namedDead();
  const crisis = state.flags.crisis;
  const final = state.flags.final;
  const planet = state.flags.planet;
  const leadership = state.flags.leadership;
  const reckon = state.flags.reckon;
  const vaultSac = state.flags.vault_sacrifice;
  const preg = state.flags.pregnancy_risk;
  const fav = favoritism();
  const shape = ideologyShape();
  const futureVoices = voicesFor("future");
  const livingVoices = voicesFor("living");

  let title = "";
  let text = "";
  let art = null;

  // --- Rare: The Yellow Circle ---
  // Reachable: no vent, Sela spoken + not ignored, living shape, cohesion/survivors,
  // Tomas not broken by player choice, final is endure/hold/comfort
  if (canYellowCircle()) {
    title = "The Yellow Circle";
    art = "images/sela.jpg";
    text = buildYellowCircleText(vaultSac);
  }
  // Landfall — high bar, action-driven. Early planet commitment is not a substitute for the final hold order.
  else if (
    s >= 6 &&
    c >= 50 &&
    emb >= 65 &&
    integ >= 35 &&
    crisis !== "vent" &&
    vaultSac !== "living" &&
    final === "hold" &&
    (leadership === "together" || reckon === "public" || reckon === "memory" || shape === "future")
  ) {
    title = "Landfall";
    art = "images/ending_landfall.jpg";
    text = buildLandfallText(shape, planet, final);
  }
  // Living Ship — chose living at the hard vault moment (action-driven; embryos truth in text)
  else if (vaultSac === "living" && s >= 5 && c >= 30) {
    title = "The Living Ship";
    art = "images/ending_ship.jpg";
    text = buildLivingShipText(futureVoices, livingVoices, preg, emb, final);
  }
  // Quiet Ship — collapse
  else if (s <= 4 || (emb < 25 && c < 30) || (integ < 15 && s <= 5)) {
    title = "The Quiet Ship";
    art = "images/ending_ship.jpg";
    text = buildQuietShipText(deadNames, shape, final);
  }
  // Still Burning — held together
  else if (c >= 48 && s >= 5 && integ >= 22 && (leadership === "together" || reckon === "public" || reckon === "memory" || state.flags.mid_arc === "living")) {
    title = "Still Burning";
    art = "images/observation_bridge.jpg";
    text = buildStillBurningText(crisis, shape, final, planet);
  }
  // Fracture — hard authority or cold vault with low cohesion
  else if (c < 30 || leadership === "watch" || reckon === "suppress" || (vaultSac === "future" && c < 40)) {
    title = "Fracture";
    art = "images/ending_fracture.jpg";
    text = buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices, final);
  }
  // Default long dark
  else {
    title = "The Long Dark";
    art = "images/ending_ship.jpg";
    text = buildLongDarkText(final, planet, emb, preg, shape, integ, sup);
  }

  // Attachment footer
  if (title !== "The Yellow Circle") {
    text += buildEndingFooter(deadNames, title, fav, shape);
  }

  const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
  if (debt.length) {
    const names = debt.map(k => crew[k] ? crew[k].name : k);
    text += "\n\nSome of the living never stopped measuring who got your private hours: " + names.join(", ") + ".";
  }

  document.getElementById("ending-title").textContent = title;
  document.getElementById("ending-text").textContent = text;
  setEndingArt(art);
  showScreen("ending");
}

function showWhatRemains() {
  const el = document.getElementById("what-remains-text");
  if (!el) return;
  const facts = typeof whatRemainsFacts === "function" ? whatRemainsFacts() : [];
  el.textContent = facts.length ? facts.join("\n\n") : "What remains of this run is thin — names, debts, and the corridor you just left.";
  // SUN-CREW-EPILOGUES-01: one paragraph per crew member under the reflection lines, in its own
  // element so the 3–6 reflection lines (L-008) and the checks that pin them are unchanged.
  const crewEl = document.getElementById("what-remains-crew");
  const crewHeading = document.getElementById("what-remains-crew-heading");
  if (crewEl) {
    const paragraphs = typeof crewEpilogues === "function" ? crewEpilogues() : [];
    crewEl.textContent = paragraphs.join("\n\n");
    crewEl.classList.toggle("hidden", !paragraphs.length);
    if (crewHeading) crewHeading.classList.toggle("hidden", !paragraphs.length);
  }
  showScreen("what-remains");
  const heading = document.getElementById("what-remains-heading");
  if (heading && typeof heading.focus === "function") {
    try { heading.focus(); } catch (e) { /* ignore */ }
  }
}

function canYellowCircle() {
  return (
    state.flags.crisis !== "vent" &&
    hasMark("sela", "spoken") &&
    isAlive("sela") &&
    ideologyShape() === "living" &&
    state.cohesion >= 50 &&
    state.survivors >= 6 &&
    !hasMark("tomas", "broke") &&
    state.flags.sela_attention !== "ignored" &&
    state.flags.sun_doctrine !== "scrubbed" &&
    (state.flags.sun_doctrine === "doctrine" || state.flags.sela_attention === "present" || state.romance.sela) &&
    (state.flags.final === "endure" || state.flags.final === "hold" || state.flags.final === "comfort")
  );
}

function buildYellowCircleText(vaultSac) {
  let text = `You did not deliver the future intact. You did not land on a world with a sun.\n\nWhat you delivered was smaller and stranger: a crew that still draws yellow circles on bulkheads, that still argues about plants and paste, that still looks for each other in the corridors.\n\nSela's suns multiplied. No one ordered them taken down.`;
  // Only cite acts that can actually have occurred this run
  if (isAlive("jiro") && (hasMark("jiro", "bonded") || hasMark("sela", "spoken"))) {
    text += ` Jiro stopped correcting the orbital math long enough to acknowledge the circles.`;
  }
  if (isAlive("tomas") && !hasMark("tomas", "broke") && (hasMark("tomas", "held") || hasMark("tomas", "bonded"))) {
    text += ` Tomas kept the silence from turning into something worse.`;
  }
  text += `\n\n`;
  if (vaultSac === "living") text += `When the grids failed, you chose the living. The embryo counts remember. So do the people who are still warm.\n\n`;
  if (state.flags.final === "hold") {
    text += `The rogue planet may still be ahead. The course is a fact on the board. The yellow circles are a fact on the bulkheads.\n\n`;
  } else if (state.flags.final === "comfort") {
    text += `You spent what was left on warmth. The drawings stayed up anyway.\n\n`;
  } else {
    text += `There is no grand destination. There is the next cycle, and the circles, and the people who still make them.\n\n`;
  }
  // SUN-ROMANCE-ARC-05 (L-050): this ending skips the footer, so the arc's end state is cited here.
  if (state.flags.sela_amber && isAlive("sela")) text += `Sela lit the lamp for one person once, and you stayed past amber.\n\n`;
  const memory = lastEndingMemory();
  if (memory) text += `Something private still sits with you: ${memory}\n\n`;
  text += `You did not win the argument between Future and Living. You made a ship where Living still had a voice.`;
  return text;
}

function buildLandfallText(shape, planet, final) {
  let text = `Against every probability, the ship holds together long enough.\n\nThe rogue planet grows from a data point into a disc of ice and dark rock. There is no sun to rise over it. There is only the cold light of distant stars and the faint heat of the Sunsplitter's remaining systems.\n\n`;
  if (planet === "committed" && final === "hold") {
    text += `You locked the course early and held it when the ship tried to argue. The board still shows the same destination.\n\n`;
  } else if (final === "hold") {
    text += `You ordered the course held when it mattered. The planet stopped being a file and became a direction.\n\n`;
  } else {
    text += `Arrival was never guaranteed — only possible.\n\n`;
  }
  text += `The vault is still viable. The living are still breathing. That combination was never guaranteed.\n\n`;
  if (shape === "future") text += `You kept the future intact when it cost you. The numbers people will remember that the package arrived.\n\n`;
  else if (shape === "split") text += `You tried to hold both sides of the argument. Arrival does not resolve it. It only changes the room in which it continues.\n\n`;
  text += `You do not know if the subsurface ocean is real. You know only that the people who are left still look at one another, and that the restart package survived the journey with them.\n\nArrival and salvation were never the same thing.\n\nYou land anyway.`;
  return text;
}

function buildFinalOrderText(final) {
  if (final === "hold") {
    return `The rogue-planet course remains on the board. You ordered it held when the final choice was yours.\n\n`;
  }
  if (final === "comfort") {
    return `You traded the destination for speed and comfort. The remaining margin went to the people already aboard.\n\n`;
  }
  if (final === "transmission") {
    return `You sent a final transmission into the dark. The ship went quiet afterward.\n\n`;
  }
  if (final === "endure") {
    return `You refused a grand purpose. The order was the next day, then the next.\n\n`;
  }
  return "";
}

function buildLivingShipText(futureVoices, livingVoices, preg, emb, final) {
  let text = `You chose the people who were already breathing.\n\nThe embryo counts are permanently lower (${emb}%). The vault remembers the cost.\n`;
  if (futureVoices.length) text += ` ${futureVoices.join(" and ")} call it a failure of nerve.\n\n`;
  else text += `\n\n`;
  text += `But the habitation decks are warmer. The remaining crew still argues, eats, and now and then reaches for one another.\n\n`;
  if (preg === true) text += `A living pregnancy is possible. That fact sits in the medical bay like a second vault.\n\n`;
  if (livingVoices.length) text += `The living side of the argument — ${livingVoices.join(", ")} — still has a place to stand.\n\n`;
  text += buildFinalOrderText(final);
  text += `You did not deliver the future intact. You delivered a smaller, warmer present.\n\nWhether that is enough is no longer a command decision.`;
  return text;
}

// SUN-BLEAK-ENDING-HONESTY-01: deaths that came at one of the Commander's orders or refusals. The
// attributable causes (the vent, a diverted bus, an ordered repair, a stopped treatment, a vented
// pocket) plus the lethal opportunities whose causes do not name the order: Lena's treatment left
// unbuilt, Elias sealed into B-four, Tomas sent through the annex, the shared line moved to Lena.
const ORDERED_DEATH_CAUSES = [
  "kept working until the clock ran out",
  "held the line",
  "went back for the living and did not return",
  "lost the shared medical line to Lena"
];
function deathByOrder() {
  return (state.dead || []).some(k => attributableDeath(k) ||
    ORDERED_DEATH_CAUSES.includes(state.deathCause && state.deathCause[k]));
}

function buildQuietShipText(deadNames, shape, final) {
  // SUN-BLEAK-ENDING-HONESTY-01: say which collapse this is (the gate's own terms), not both as a hedge.
  const fewLeft = state.survivors <= 4 || (state.integrity < 15 && state.survivors <= 5);
  const vaultThin = state.embryos < 25;
  let text = fewLeft && vaultThin ? `Only a few of you remain, and what remains of the restart package is too thin to matter.\n\n`
    : fewLeft ? `Only a few of you remain.\n\n`
    : `What remains of the restart package is too thin to matter.\n\n`;
  if (deadNames.length) text += `The dead: ${deadNames.join("; ")}.\n\n`;
  if (shape === "future") text += `You protected the vault when you could. It did not save the room.\n\n`;
  // SUN-BLEAK-ENDING-HONESTY-01: not after crew died at the Commander's order or refusal.
  if (shape === "living" && !deathByOrder()) text += `You protected the living when you could. There were not enough left to matter.\n\n`;
  text += buildFinalOrderText(final);
  text += `The Sunsplitter drifts. Systems fail one by one. There is no longer any pretense of a future.\n\nYou sit with the last of them in the observation blister and watch the stars that do not care.\n\nWhen the final systems go dark, no one speaks.\n\nThis is how the last light goes out.`;
  return text;
}

function buildStillBurningText(crisis, shape, final, planet) {
  let text = `Against every reasonable expectation, the group holds.\n\n`;
  if (crisis === "vent") text += `The cost is permanent. Names are not spoken lightly.\n\n`;
  // SUN-RECAP-HONESTY-01: when the vault choice set the shape against the recorded orders What Remains
  // cites, say it was the vault choice, so the two screens do not disagree about the lean.
  const byVault = shape !== whatRemainsIdeologyShape();
  if (shape === "future") text += byVault ? `At the vault fault you kept the vault and the mission. The living remember the cold — but they are still here.\n\n` : `You leaned toward the vault and the mission. The living remember the cold — but they are still here.\n\n`;
  else if (shape === "living") text += byVault ? `At the vault fault you chose the breathing. The embryo counts are wounded. The room is not.\n\n` : `You leaned toward the breathing. The embryo counts are wounded. The room is not.\n\n`;
  else text += `You refused to let either side of the argument own the ship completely.\n\n`;
  if (final === "hold") {
    text += state.flags.course_briefed
      ? `The course remains locked on the rogue planet. Verified corridor: day 181 through day 184. One pass.\n\n`
      : `The course remains locked on the rogue planet. Fourteen months. No guarantee.\n\n`;
  }
  else if (final === "comfort") text += `You abandoned the destination for warmth and slightly less hunger.\n\n`;
  else if (final === "transmission") text += `A final transmission went out. The ship went quieter afterward.\n\n`;
  else text += `There is no grand destination. Only the work of the next cycle.\n\n`;
  text += `When you walk the corridors, people still meet your eyes. It is not hope. It is the refusal to die on the same day.`;
  return text;
}

function buildFractureText(shape, leadership, reckon, deadNames, futureVoices, livingVoices, final) {
  let text = `The people under your command no longer move as one.\n\n`;
  if (shape === "future") text += `Protecting the vault cost you the room. The living side of the crew will not forgive the cold.\n\n`;
  if (shape === "living") text += `Protecting the living cost you the mission faction. The numbers people have gone quiet or hard.\n\n`;
  if (leadership === "watch" || reckon === "suppress") text += `Authority hardened. Compliance is high. Trust is not.\n\n`;
  if (deadNames.length) text += `The dead are not equally mourned.\n\n`;
  if (futureVoices.length && livingVoices.length) {
    text += `Future still speaks through ${futureVoices[0]}. Living still speaks through ${livingVoices[0]}. They no longer share a language.\n\n`;
  }
  text += buildFinalOrderText(final);
  text += `You remain Commander in name. In practice the Sunsplitter is a collection of isolated survivors sharing a dying hull.\n\nThe void does not need to kill you. You are doing it yourselves.`;
  return text;
}

function buildLongDarkText(final, planet, emb, preg, shape, integ, sup) {
  let text = `You keep them alive. Not all of them. Not with dignity every day. But alive.\n\n`;
  if (final === "hold" && planet === "committed") text += `The course remains locked on the rogue planet. The course is held.\n\n`;
  else if (final === "hold") text += `You ordered the course held. Whether the planet is real enough is no longer the only question.\n\n`;
  else if (final === "transmission") text += `A final transmission was sent into the dark. No reply is expected.\n\n`;
  else if (final === "comfort") text += `You spent fuel on comfort. The horizon is closer and emptier.\n\n`;
  else text += `There is no destination that feels real.\n\n`;
  if (emb < 60) text += `The restart package is wounded (${emb}%). The numbers will not recover.\n\n`;
  if (integ < 40) text += `Hull is a daily argument (${integ}%).\n\n`;
  if (sup < 30) text += `Supplies are a shorter argument (${sup}%).\n\n`;
  if (preg === true) text += `A living child may still be possible. That fact competes with every frozen future in the vault.\n\n`;
  const byVault = shape !== whatRemainsIdeologyShape(); // SUN-RECAP-HONESTY-01, as in Still Burning
  if (shape === "future") text += byVault ? `At the vault fault you chose Future. The vault still has a claim on the ship.\n\n` : `Your run leaned toward Future. The vault still has a claim on the ship.\n\n`;
  else if (shape === "living") text += byVault ? `At the vault fault you chose Living. The warmth has a cost the numbers will not forget.\n\n` : `Your run leaned toward Living. The warmth has a cost the numbers will not forget.\n\n`;
  text += `The Sunsplitter pushes on through the black.\n\nYou do the work anyway.\n\nOne more day, then the next, then the next.`;
  return text;
}

function buildEndingFooter(deadNames, title, fav, shape) {
  let text = "";
  if (deadNames.length && title !== "The Quiet Ship") {
    text += `\n\nThe dead still have names: ${deadNames.join("; ")}.`;
  }
  const memory = lastEndingMemory();
  if (memory) {
    text += `\n\nSomething private still sits with you: ${memory}`;
  }
  if (fav && crew[fav.favored] && isAlive(fav.favored)) {
    text += `\n\nThe others noticed who you chose to keep close. ${crew[fav.favored].name} still looks for you in the corridors. Not everyone is glad of it.`;
  } else {
    const top = highestAffinity();
    if (top.who && top.score >= 30 && crew[top.who] && isAlive(top.who)) {
      text += `\n\nSomeone still looks for you in the corridors: ${crew[top.who].name}.`;
    }
  }
  // SUN-ROMANCE-ARC-01 (L-050): the arc's end state is cited from run facts only. lena_last_hour
  // is written after her only death site, so it always describes a living Lena.
  if (state.flags.lena_last_hour && hasMark("lena", "dying_held") && isAlive("lena")) text += `\n\nLena's remaining time was spent with someone who stayed. One hour of it went to the cabinet count: awake, standing, variance zero.`;
  else if (state.flags.lena_last_hour && isAlive("lena")) text += `\n\nLena asked for presence without the rest, and had it. One hour of it went to the cabinet count: awake, standing, variance zero.`;
  else if (hasMark("lena", "dying_held") && isAlive("lena")) text += `\n\nLena's remaining time was spent with someone who stayed.`;
  else if (hasMark("lena", "dying_held")) text += `\n\nLena's remaining time was spent with someone who stayed. That fact outlived her.`;
  else if (hasMark("lena", "held_only") && isAlive("lena")) text += `\n\nLena asked for presence without the rest, and had it.`;
  else if (hasMark("lena", "held_only")) text += `\n\nLena asked for presence without the rest, and had it. That fact outlived her.`;
  // SUN-BLEAK-ENDING-HONESTY-01: what tomas_break's reply shows, not a breakdown it does not show.
  if (hasMark("tomas", "broke")) text += `\n\nYou told Tomas the future is what justifies this. He took it like a ration cut, and did not argue. That fact does not leave the ship.`;
  else if (hasMark("tomas", "held") && isAlive("tomas")) text += `\n\nTomas is still holding. He told you he might not.`;
  // SUN-ROMANCE-ARC-05 (L-050): Sela's end state, cited from the answer the run gave.
  if (state.flags.sela_amber) {
    const amber = state.flags.sela_amber === "meaning" ? `You asked what it meant for one person; she told you it was the whole of it.`
      : state.flags.sela_amber === "sentence" ? `You asked for the sentence she keeps unfinished; she kept it, and let you stand near it.`
      : `You said nothing, which she counted as the correct amount.`;
    text += `\n\nSela performed the ritual for one person once, and you stayed past amber. ${amber}${isAlive("sela") ? "" : " That fact outlived her."}`;
  }
  // SUN-ROMANCE-ARC-04 (L-050): Amara's end state, cited from the answer the run gave.
  if (state.flags.amara_page) {
    const page = state.flags.amara_page === "open" ? `Amara read you your page in her ledger and left it open. Interest runs; she had not charged it.`
      : state.flags.amara_page === "closed" ? `Amara read you your page in her ledger and closed it at your asking. Closed, not forgiven; she said you'd learn the difference.`
      : `Amara read you your page in her ledger, then showed you hers: the long one, every name on it dead and none of them paid.`;
    text += `\n\n${page}${isAlive("amara") ? "" : " That fact outlived her."}`;
  }
  // SUN-ROMANCE-ARC-03 (L-050): Vess's end state, cited from the answer the run gave.
  if (state.flags.vess_item_two) {
    const chair = state.flags.vess_item_two === "chair" ? `Vess kept her chair and let you share it. Rated for one, occupancy two, confirmed.` : `Vess kept her chair and you took the deck beside it. Occupancy one, company present, confirmed.`;
    text += `\n\n${chair} That night she said "Captain" once and let it stand.${isAlive("vess") ? "" : " That fact outlived her."}`;
  }
  // SUN-ROMANCE-ARC-02 (L-050): her arc's end state, cited from the answer the run gave.
  if (state.flags.mira_root_cause) {
    const asked = state.flags.mira_root_cause === "drive" ? `Mira asked why you kept her out of the sealed bay, and you said the drive. She logged it: root cause, drive, confidence sixty percent.`
      : state.flags.mira_root_cause === "you" ? `Mira asked why you kept her out of the sealed bay, and you said it was her. She filed a fault against herself and kept the console.`
      : `Mira asked why you kept her out of the sealed bay, and you gave her both. She is running the drive under the variance.`;
    text += `\n\n${asked}${isAlive("mira") ? "" : " That fact outlived her."}`;
  }
  if (hasMark("mira", "drive_first") && isAlive("mira")) text += `\n\nMira still believes the drive can be saved because you once let her try.`;
  // No raw ideology debug dump in player-facing text (0.20.2)
  return text;
}

function setEndingArt(src) {
  currentEndingArt = typeof src === "string" ? src : "";
  syncEndingArtForScreen("ending");
}
