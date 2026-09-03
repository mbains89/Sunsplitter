// Sunsplitter — scenes-40.js
// 0.28.1c size hygiene. Pure mechanical. early: priority through crew_walk
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  priority_repairs: {
    get text() { return `${isAlive("mira") && isAlive("amara") ? `You put Mira and Amara on the hull and life support.` : ""} The nav station stays dark — Jiro is not among the nine who made the hatch.

They work through the next cycle without sleep. Temporary seals hold. Hull climbs.

${isAlive("elias") ? `Elias watches with narrowed eyes. "We're fixing a coffin so it lasts longer."` : ""}

${isAlive("amara") ? `Amara answers without looking up: "Then we make the coffin worth living in."` : ""}

${isAlive("mira") ? `Mira gains something like confidence.` : ""} The ship feels marginally less like it is actively trying to kill you.`; },
    choices: [
      { text: "Check the hydroponics bay. Food is the next crisis.", next: "hydroponics", effects: { integrity: 2 } },
      { text: "Walk the ship first. See how the crew is holding.", next: "crew_walk", effects: { cohesion: 2 } }
    ]
  },
  priority_ration: {
    get text() { return `You announce the rationing schedule yourself.

Half portions. Water measured. No private stores.

${isAlive("mira") ? `Mira accepts it without complaint.` : ""} ${isAlive("elias") ? `Elias looks almost pleased.` : ""} ${isAlive("lena") ? `Lena simply nods — she already knew the math.` : ""}

${isAlive("amara") ? `Amara exchanges a look with no one in particular.` : ""} ${isAlive("sela") ? `Sela asks if the paste is supposed to taste like nothing. No one answers her.` : ""}

Hunger will make them honest soon enough.`; },
    choices: [
      { text: "Check the hydroponics bay. Food is the next crisis.", next: "hydroponics", effects: { supplies: 2 } },
      { text: "Walk the ship first. See how the crew is holding.", next: "crew_walk", effects: { cohesion: 1 } }
    ]
  },
  priority_planet: {
    get text() { return `You order a full sweep of every remaining sensor and archive.

${isAlive("mira") ? `Hours later Mira returns with a single file.

"There is a candidate. A rogue planet. No star. Ice and rock. Possible subsurface ocean. Fourteen months at current thrust — if the drive ever comes back."` : ""}

${isAlive("elias") ? `Elias laughs once, without humor. "So we freeze in the dark instead of starving in the dark."` : ""}

${isAlive("lena") ? `Lena: "It's something."` : ""}

${isAlive("sela") ? `Sela watches the schematic as if it might become a sun.` : ""} The navigation board is still empty of the man who was supposed to own it.`; },
    choices: [
      { text: "Set course. We go there or we die trying.", next: "commit_planet", effects: { cohesion: 7 }, flag: { planet: "committed" } },
      { text: "Not yet. Stabilize the ship first.", next: "hydroponics", effects: { cohesion: -3 }, flag: { planet: "deferred" } }
    ]
  },
  commit_planet: {
    text: `You give the order.

The Sunsplitter turns, slowly, toward a world that has never known sunlight.

For the first time since the escape, something like purpose settles over the group.

It will not last. But for a few hours, no one argues.`,
    choices: [
      { text: "Check the hydroponics bay. Food is the next crisis.", next: "hydroponics" },
      { text: "Walk the ship. Let the purpose settle before the next crisis.", next: "crew_walk", effects: { cohesion: 2 } }
    ]
  },
  hydroponics: {
    get text() { return `The hydroponics bay is half-dead.

${isAlive("amara") ? `Amara Vale — the woman with the house key from Lagos on a cord at her throat — stands among the trays with a tablet and quiet fury. This is the first time you have heard her report in full.

"Power fluctuations killed the UV cycle. I can restart the full array, but it pulls from life support. Or I keep a minimal crop on low power and we stay on paste longer."

She turns the key once between her fingers.

"I grew food for three habitats before the cascade. This bay was sized for hundreds. We are nine. That does not make the last green trays optional. If we lose them, morale drops harder than the calories."` : ""}`; },
    choices: [
      { text: "Full power to hydroponics. Real food and something living.", next: "crew_walk", effects: { supplies: 9, integrity: -7, cohesion: 5 }, flag: { hydro: "full" }, lean: { living: 2 }, affinity: { amara: 8 }, trust: { amara: 6 } },
      { text: "Minimal power only. Protect life support first.", next: "crew_walk", effects: { supplies: -4, integrity: 4, cohesion: -3 }, flag: { hydro: "minimal" }, lean: { future: 1 }, affinity: { amara: -4 }, trust: { amara: -3 } },
      { text: "Strip failed racks for parts. Seed a smaller, efficient system.", next: "crew_walk", effects: { supplies: 3, integrity: -2, cohesion: 2 }, flag: { hydro: "rebuild" }, affinity: { amara: 4 } }
    ]
  },
  crew_walk: {
    get text() { return `You move through a ship sized for a civilization that did not board.

Deck 2 berths: names still printed on locker lips. A child's shoe in a size no one on this crew wears. Bedding folded for people who never made the ring. The air recyclers run at a fraction of design load and still sound too loud.

${isAlive("lena") ? `Medical: Lena catalogues every remaining drug by hand. Empty recovery racks line the far wall like an accusation. A covered body still occupies the corner.` : ""}

${isAlive("mira") ? `Engineering: Mira is asleep at her console — face lit by warning lights. One is a drive fault she has not yet reported. Her hands, even asleep, rest near the manual overrides.` : ""}

${isAlive("amara") ? `Common area: Amara sits alone with a cold cup. Seating for two hundred. The wash rack holds fewer cups than the manifest claimed. Two names from the boarding list never answered the final call.` : ""}

Observation blister: stars drift at an uneven rate. Daylight panels still cycle an obsolete Earth sunrise over empty rows. The star tracker console is dark.

${isAlive("elias") ? `Before Elias finds you, there is a moment — small, private — that no one else needs to see.` : ""}`; },
    choices: [
      { text: "Stop by Sela. She is at the bulkhead again.", next: "quiet_sela", effects: { cohesion: 2 }, affinity: { sela: 12 }, alive: "sela" },
      { text: "Wake Mira gently. The drive fault is still open.", next: "quiet_mira", effects: { cohesion: 1 }, affinity: { mira: 10 }, alive: "mira" },
      { text: "Sit with Tomas without asking for anything.", next: "quiet_tomas", effects: { cohesion: 3 }, affinity: { tomas: 10 }, alive: "tomas" },
      { text: "Find Amara among the trays.", next: "quiet_amara", effects: { cohesion: 2 }, affinity: { amara: 10 }, alive: "amara" },
      { text: "Share a quiet hour with Elias — no orders.", next: "bond_elias", effects: { cohesion: 1 }, alive: "elias", tag: "bond" },
      { text: "Sit a low-stakes game with Tomas if he will play.", next: "bond_tomas", effects: { cohesion: 1 }, alive: "tomas", tag: "bond" },
      { text: "Join Jiro on a competence hang at the star tracker.", next: "bond_jiro", effects: { cohesion: 1 }, alive: "jiro", tag: "bond" },
      { text: "Walk the empty berths before you take any more orders.", next: "empty_berths", effects: { cohesion: 1 } },
      { text: "Skip the quiet. Elias is already waiting.", alive: "elias", next: "lead_prompt", effects: { cohesion: -1 } }
    ]
  },

});
