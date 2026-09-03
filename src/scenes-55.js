// Sunsplitter — scenes-55.js
// 0.28.1c size hygiene. Pure mechanical. exclusive: custody
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  custody_onset: {
    image: "images/custody_onset.jpg",
    onEnter: () => {
      if (state.crisisPath == null) state.crisisPath = "custody";
    },
    text: () => {
      let t = `The vault thermal spine is saturated. Heat must leave or the embryos cook.\n\n`;
      t += `There is no clean radiator left that does not touch an occupied section or the vault itself. The question is no longer technical. It is custody: who decides what the future is allowed to cost.`;
      return t;
    },
    choices: [
      { text: "Open the custody hub.", next: "prom_price" }
    ]
  },

  // PRE: custody question route; supports only the two governed custody repairs
  // WRITES: thaw/sever choices pay their declared effects immediately; sever also writes Future lean
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira/Sela options are living-gated
  // IMAGE: REUSE images/vault.jpg; no new art request
  custody_hub: {
    image: "images/vault.jpg",
    text: () => {
      let t = `Four answers. One is ungated. The rest require a living specialist who still has the authority or the body to spend.\n\n`;
      t += `Whatever you choose becomes the permanent answer to who owns the future on this ship.`;
      return t;
    },
    get choices() {
      const opts = [
        {
          text: "Dump the heat through the inhabited ring. Vault remains possession.",
          next: "custody_possession"
        },
        {
          text: "Thaw outer embryo racks to absorb the heat.",
          next: "custody_thaw",
          requires: { embryos: { min: 14 }, cohesion: { min: 1 } },
          effects: { embryos: -14, cohesion: -1 }
        },
        {
          text: "Mira severs the fused thermal junction in the unpressurized skin.",
          next: "custody_severed",
          alive: "mira",
          requires: { integrity: { min: 3 } },
          effects: { integrity: -2, cohesion: 1 },
          lean: { future: 1 }
        }
      ];
      if (state.promises.sela !== "broken") {
        opts.push({
          text: "Open the vault manifest and grant Sela second physical authorization.",
          next: "custody_shared",
          alive: "sela"
        });
      }
      return opts;
    }
  },

  // PRE: custody_hub ungated possession route | WRITES: onEnter custody_answer/custody_roll; paid choices affect resources; governed floor writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: no named character speaks or appears
  // IMAGE: REUSE images/bulkhead.jpg; no new art request
  custody_possession: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      state.flags.custody_answer = "possession";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Heat dumps into the inhabited ring. The vault stays sealed and whole.\n\n`;
      t += `Crew take the thermal exposure. You can spend stores and hull margin to treat them and keep the ring habitable, or seal it and let cohesion carry the abandonment. The future was treated as the Commander's possession; only the reserve that absorbs the aftermath is still yours to choose.`;
      return t;
    },
    get choices() {
      const routes = [
        {
          text: "Treat the exposed crew and brace the ring. Spend stores and hull to keep it habitable.",
          next: "custody_after",
          effects: { supplies: -3, integrity: -3 }
        },
        {
          text: "Seal the scorched ring. Preserve stores and hull; let cohesion carry the abandonment.",
          next: "custody_after",
          effects: { cohesion: -6 }
        }
      ];
      if (!routes.some(choice => canAffordEffects(choice.effects))) {
        routes.push({
          text: "No reserve remains. Seal the ring without treatment and record the abandonment.",
          next: "custody_after"
        });
      }
      return routes;
    }
  },

  // PRE: newly committed thaw choice, or a pre-FH-01B save already parked here
  // WRITES: entry records custody_answer/custody_roll; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: no named character speaks or appears
  // IMAGE: REUSE images/vault_interior_alt.jpg; no new art request
  custody_thaw: {
    image: "images/vault_interior_alt.jpg",
    onEnter: () => {
      state.flags.custody_answer = "thawed";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Outer racks are thawed to drink the heat. The numbers drop. The living sections stay cool.\n\n`;
      t += `The thawed embryos become an explicit fact the endings will have to name.`;
      return t;
    },
    choices: [ { text: "Accept the reduced count.", next: "custody_after" } ]
  },

  // PRE: newly committed sever choice with living Mira, or a pre-FH-01B save already parked here
  // WRITES: entry records custody_answer/custody_roll; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira's line is historical to this committed scene
  // IMAGE: REUSE images/mira_thermal_cut.jpg; no new art request
  custody_severed: {
    image: "images/mira_thermal_cut.jpg",
    onEnter: () => {
      state.flags.custody_answer = "severed";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Mira goes into the unpressurized maintenance throat alone. The cut is exact. Redundancy dies with the junction.\n\n`;
      t += `She comes back with cold-radiation injury she will carry for the rest of the voyage. She does not ask for thanks.`;
      return t;
    },
    choices: [ { text: "Get her to medical. Log the cut.", next: "custody_after" } ]
  },

  custody_shared: {
    image: "images/observation_bridge_alt.jpg",
    onEnter: () => {
      state.flags.custody_answer = "shared";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `The vault manifest is opened in front of the crew. Sela receives the second physical key.\n\n`;
      t += `"No unilateral triage after this," she says. "If the future is to be spent, it is spent with both names on the order."\n\n`;
      t += `Command retains power. It no longer owns the vault alone.`;
      return t;
    },
    choices: [
      {
        text: "Accept the compact.",
        next: "custody_after",
        effects: { cohesion: 2 },
        lean: { living: 1 }
      }
    ]
  },

  // PRE: a custody answer is committed; legacy recovery may resume with a dead Tomas and an untested made promise
  // WRITES: resolves Tomas's made promise only while he is alive to witness the authored custody test
  // DEATH: none | DEAD SPEECH/APPEARANCE: dead Tomas neither speaks nor receives a kept/broken result
  // IMAGE: REUSE images/corridor_pressure_1.jpg; no new art request
  custody_after: {
    image: "images/corridor_pressure_1.jpg",
    onEnter: () => {
      if (state.promises.tomas === "made" && isAlive("tomas")) {
        if (state.flags.custody_answer === "possession") {
          state.promises.tomas = "broken";
          remember("You broke the promise to Tomas. The living paid for the vault.");
        } else {
          state.promises.tomas = "kept";
          remember("You kept the promise to Tomas. The living got the mercy.");
        }
      }
    },
    text: () => {
      let t = `The thermal spine cools. The answer is on the record.\n\n`;
      if (state.flags.custody_answer === "possession") t += `The vault was kept as possession. The living paid in heat and trust.\n\n`;
      else if (state.flags.custody_answer === "thawed") t += `Outer racks were thawed. The count is lower and permanent.\n\n`;
      else if (state.flags.custody_answer === "severed" && isAlive("mira")) t += `Mira's cut holds. She carries the cold.\n\n`;
      else if (state.flags.custody_answer === "shared" && isAlive("sela")) t += `Sela holds the second key. Unilateral control is over.\n\n`;
      if (state.promises.tomas === "broken" && isAlive("tomas"))
        t += `Tomas reads the exposure log once. "You said: if the vault and the living need the same mercy, the living get it. The ring paid. Noted, Commander."\n\n`;
      else if (state.promises.tomas === "kept" && isAlive("tomas"))
        t += `Tomas counts the cost without flinching from it. "Whatever the next order is, you won't have to give it twice."\n\n`;
      t += `The ship has a path again. The fracture has not closed.`;
      return t;
    },
    choices: [
      { text: "Return to the crew.", next: "prom_vent" }
    ]
  }
});

// SUN-V035-LIVING-CAST-01 — saved-scene admission, after the full graph loads.
// PRE: the listed conversation requires its named living participants. Recovery
// entry may admit an unrecovered person, but never someone recorded dead.
// WRITES: no new state. Invalid entry bypasses the original encounter writes;
// marked Continue/import only masks presentation, preserving the exact snapshot.
// DEATH: existing lethal results keep their dead victim; only the witness is
// required. DEAD SPEECH/CHOICES: the same predicate protects both surfaces.
// IMAGE: existing resolver guards, then an existing empty corridor; no new art.
// Every fallback uses an existing successor and this exact authored sentence
// from act2_spine_next. No new scene IDs, plot, flags, or scene-schema fields.
const ABSENT_CAST_TEXT = "The boards keep working. So do you.";
const livingCastContracts = {};
// Preserve authored descriptors for static validation as well as live-branch
// equivalence tests; masking an absent view must not hide authored graph edges.
const livingCastOriginals = new WeakMap();
// Already-correct text/choice fallbacks need only the matching image guard.
const livingCastImageOnly = {
  romance_amara_tomas: ["amara", "tomas"],
  lena_shower: ["lena"], mira_shower: ["mira"],
  lena_rear: ["lena"], mira_rear: ["mira"], amara_rear: ["amara"], sela_rear: ["sela"],
  tomas_break: ["tomas"], act3_lethal_tomas_cost: ["tomas"],
  act3_lethal_tomas_stores: ["tomas"], act3_lethal_tomas_structure: ["tomas"],
  act3_lethal_mira_board: ["mira"], act3_lethal_mira_reserve: ["mira"]
};
function requireLivingCast(ids, cast, next, options = {}) {
  for (const id of ids.split(" ")) {
    livingCastContracts[id] = { cast, next, ...options };
  }
}

requireLivingCast("romance_lena_sex", ["lena"], () => state.past_known ? "pursuit_window" : "past_leak");
requireLivingCast("past_leak", ["elias"], "transmission");
const trappedCastPresent = () => ["amara", "sela", "jiro"].some(isAlive);
requireLivingCast("crisis cut_out self_risk", [], "aftermath", { render: trappedCastPresent });
requireLivingCast("records_changeorders records_changeorders_after", ["mira"], "arc_future_4");
requireLivingCast("act2_tether_manifest act2_tether_truth", ["tomas"], "act2_spine_next");
requireLivingCast("act3_reckoning_briefing observation_nightshift observation_nightshift_ask observation_nightshift_leave", ["jiro"], "act3_lethal_lena_clock");
requireLivingCast("hold_bolts hold_bolts_again hold_bolts_silent", ["tomas"], "act3_spine_next");
requireLivingCast("vess_offer vess_transmission vess_intimate", ["vess"], "act3_spine_next");
requireLivingCast("aftermath_seal aftermath_seal_order aftermath_seal_holds", ["elias"], "offshift_open");
requireLivingCast("romance_mira_1", ["mira"], "intimacy_window");
requireLivingCast("romance_amara_1", ["amara"], "intimacy_window");
requireLivingCast("romance_sela_1", ["sela"], "intimacy_window");
requireLivingCast("romance_amara_tomas_sex", ["amara", "tomas"], "intimacy_window");
for (const who of ["mira", "amara", "sela", "lena"]) {
  // These bond getters already have correct authored dead text and Leave exits.
  requireLivingCast(`bond_${who}`, [who], "intimacy_window", { entryOnly: true });
  requireLivingCast(`pursuit_${who}`, [who], "pursuit_window");
  requireLivingCast(`pursuit_${who}_sex`, [who], "debt_notice");
}
requireLivingCast("favor_mira", ["mira"], "pursuit_window");
requireLivingCast("history_elias", ["elias"], "vault_voice");
requireLivingCast("intro_elias", ["elias"], "vault_reveal");
requireLivingCast("intro_lena", ["lena"], "intro_elias", { preserveEntry: true });
requireLivingCast("dying", ["rourke"], "intro_lena");
requireLivingCast("quiet_amara berths_manifest", ["amara"], "lead_prompt");
requireLivingCast("quiet_mira", ["mira"], "lead_prompt");
requireLivingCast("quiet_sela", ["sela"], "lead_prompt");
requireLivingCast("quiet_tomas", ["tomas"], "act3_spine_next");
for (const who of ["elias", "tomas", "jiro"]) {
  requireLivingCast(`bond_${who}`, [who], () => state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt");
}
for (const [who, next] of Object.entries({ amara: "lead_prompt", lena: "past_leak", elias: "vault_voice", sela: "lead_prompt", mira: "pursuit_window", tomas: () => state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt" })) {
  requireLivingCast(`prom_make_${who} prom_r_${who}`, [who], next);
}
for (const who of ["amara", "lena"]) {
  requireLivingCast(`prom_make_${who}_ag prom_r_${who}_ag`, [who], "debt_notice");
}
for (const [test, holder, next] of [["deck4", "elias", "prom_line"], ["direct", "mira", "faction_split"], ["price", "sela", "custody_hub"]]) {
  requireLivingCast(`prom_${test} prom_${test}_keep prom_${test}_break`, [holder], next);
}
for (const [test, holder, next, patients] of [["vent", "amara", "prom_deck4", ["jiro", "vess"]], ["line", "lena", "prom_direct", ["mira", "jiro", "vess"]]]) {
  const patientPresent = () => patients.includes(state.flags.prom_line_other) && isAlive(state.flags.prom_line_other);
  // The original entry selects the patient. A marked resume must NOT select again.
  requireLivingCast(`prom_${test}`, [holder], next, { render: patientPresent });
  requireLivingCast(`prom_${test}_keep`, [holder], next, { enter: patientPresent, render: patientPresent });
  // The victim is dead AFTER a committed break. Validate only before a new kill.
  requireLivingCast(`prom_${test}_break`, [holder], next, {
    enter: () => state.promises[holder] === "broken" || patientPresent()
  });
}
for (const who of ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"]) {
  requireLivingCast(`offshift_${who}`, [who], "faction_split");
}
requireLivingCast("offshift_tomas_r", ["tomas"], "faction_split");
// L-026 fresh zero/one/many entry behavior remains untouched. A marked saved
// zero-invitation selector needs an exit without replaying junctionChoice.
requireLivingCast("offshift_open", [], "faction_split", {
  preserveEntry: true,
  render: () => [eligLena, eligElias, eligMira, eligTomas, eligAmara, eligJiro, eligSela, eligVess].some(eligible => eligible())
});
requireLivingCast("filters_stencil filters_stencil_luck filters_stencil_silent", ["sela"], "faction_split");
requireLivingCast("pair_grudge_settle", ["tomas", "jiro"], "act3_spine_next");
requireLivingCast("pair_favor_confront", ["amara", "sela"], "act3_spine_next");
requireLivingCast("warmth_meal", ["tomas"], "act3_spine_next");
const twoLivingVoices = () => ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"].filter(isAlive).length >= 2;
requireLivingCast("warmth_laughter", [], "act3_spine_next", { enter: twoLivingVoices, render: twoLivingVoices });
requireLivingCast("breath_garden", ["amara"], "breath_after", { preserveEntry: true });
requireLivingCast("breath_blacksleep", ["lena"], "breath_after", { preserveEntry: true });
requireLivingCast("custody_severed", ["mira"], "custody_after", { preserveEntry: true });
requireLivingCast("custody_shared", ["sela"], "custody_after", { preserveEntry: true });

const interruptedCastPresent = () => {
  const who = { bond_mira: "mira", bond_amara: "amara", bond_sela: "sela", bond_lena: "lena" }[state.flags.interrupt_return];
  return !who || isAlive(who);
};
requireLivingCast("ship_interrupt ship_interrupt_resolve", [], "debt_notice", { enter: interruptedCastPresent, render: interruptedCastPresent });

// Remote rescue is not ordinary onboard presence. Keep all three arrivals open.
for (const [who, ids, recovery, next] of [
  ["tomas", "act2_tether_sighting act2_tether_vent act2_tether_rush", "act2_tether_dock", "act3_reckoning_pattern"],
  ["jiro", "act3_reckoning_pattern act3_reckoning_heading act3_reckoning_burn_stale", "act3_reckoning_cut", "act3_lethal_lena_clock"],
  ["vess", "vess_signal vess_cost", "vess_boarding", "act3_spine_next"]
]) {
  const notDead = () => !state.dead.includes(who);
  requireLivingCast(ids, [], next, { enter: notDead, render: notDead });
  requireLivingCast(recovery, [], next, { enter: notDead, render: () => isAlive(who) });
}
for (const who of ["elias", "mira", "sela"]) {
  const targetNotDead = () => !state.dead.includes("tomas");
  requireLivingCast(`act2_tether_hand_${who}`, [who], "act2_tether_dock", { enter: targetNotDead, render: targetNotDead });
}
for (const [id, who] of [["act3_reckoning_burn_verified", "mira"], ["act3_reckoning_delay", "tomas"]]) {
  const targetNotDead = () => !state.dead.includes("jiro");
  requireLivingCast(id, [who], "act3_reckoning_cut", { enter: targetNotDead, render: targetNotDead });
}

function livingCastPresent(id, phase = "render") {
  const contract = livingCastContracts[id];
  return !contract || (contract.cast.every(isAlive) && (!contract[phase] || contract[phase]()));
}
function livingCastExit(id) {
  const next = livingCastContracts[id].next;
  return typeof next === "function" ? next() : next;
}
for (const [id, contract] of Object.entries(livingCastContracts)) {
  const scene = scenes[id];
  if (!scene) throw new Error(`Unknown living-cast scene: ${id}`);
  livingCastOriginals.set(scene, Object.getOwnPropertyDescriptors(scene));
  const entry = scene.onEnter;
  scene.onEnter = function(opts) {
    if (!contract.preserveEntry && !livingCastPresent(id, "enter")) return livingCastExit(id);
    return entry ? entry.call(this, opts) : undefined;
  };
  if (contract.entryOnly) continue;
  for (const field of ["text", "choices"]) {
    const original = Object.getOwnPropertyDescriptor(scene, field);
    const fallback = () => field === "text" ? ABSENT_CAST_TEXT : [{ text: "Continue.", next: livingCastExit(id) }];
    if (typeof original.value === "function") {
      Object.defineProperty(scene, field, {
        enumerable: true, configurable: true, writable: true,
        value: function() {
          return livingCastPresent(id) ? original.value.call(this) : fallback();
        }
      });
      continue;
    }
    Object.defineProperty(scene, field, {
      enumerable: true, configurable: true,
      get() {
        if (!livingCastPresent(id)) return fallback();
        return original.get ? original.get.call(this) : original.value;
      }
    });
  }
}
