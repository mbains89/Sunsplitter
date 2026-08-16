// Sunsplitter — scenes-early.js
// Version 0.21 — Discoverability
// Act 1: wake through private_stores. Soft intro, departure lore, absence felt.
// Strict scene shape only: text | choices | onEnter | image
// Register into global `scenes` object (duplicate-id throw).

registerScenes({
  wake: {
    text: `The medical bay smells of ozone and blood.

Emergency lights flicker. A status board still scrolls launch errors that no one has authority to clear.

Dr. Lena Voss works on a man who will not last the hour. Elias Kane stands by the hatch, arms folded, already counting who is left.

Somewhere deeper in the ship, other voices move — too few of them. The Sunsplitter was built for a colony complement measured in the thousands. The bunk maps still show names. Most of those people never made the docking ring.

Nine of you cleared the hatch. The official story is that the cascade gave you hours, maybe two days. The rest is still being written in the dark sections you have not opened yet.

You are the Commander. What you order in the next minutes will not stay in this room.`,
    choices: [
      { text: "Sit up. Take command. Demand what Lena and Elias already know.", next: "intro_lena", effects: { cohesion: 3 }, flag: { rourke: "ignored" } },
      { text: "Go to the dying man first.", next: "dying", effects: { cohesion: 5 } },
      { text: "Stay silent a moment longer. Let the empty ship settle.", next: "silence", effects: { cohesion: -4 } }
    ]
  },
  dying: {
    text: `The man on the table is Marcus Rourke. Docking crew. You barely knew him.

Lena does not look up.

"Chest full of shrapnel from the ring. Even if I open him, he dies. I already used the last stabilizers."

Rourke's eyes find yours. He tries to speak. Only blood comes.

Elias from the doorway: "We don't have time for the dying, Commander."`,
    choices: [
      { text: "Stay with him until the end. No one dies alone if you can help it.", next: "rourke_end", effects: { cohesion: 6, supplies: -2 }, flag: { rourke: "stayed" } },
      { text: "Order Lena to stop. Conserve everything for the living.", next: "rourke_stop", effects: { cohesion: -8, supplies: 2 }, flag: { rourke: "stopped" } },
      { text: "Ask Lena what she needs to try anyway.", next: "rourke_try", effects: { supplies: -9, cohesion: 2 }, flag: { rourke: "tried" } }
    ]
  },
  rourke_end: {
    text: `You take Rourke's hand. It is already cold.

He dies twelve minutes later. No one speaks.

Lena covers his face. When she looks at you there is something like respect, or maybe just exhaustion.

Elias mutters, "One less mouth."

Mira flinches. Sela watches from the edge of the room and does not look away.`,
    choices: [
      { text: "Stay a moment longer. Then find Lena.", next: "intro_lena", affinity: { lena: 8 }, effects: { cohesion: 2 } },
      { text: "Leave him covered. The living need you.", next: "intro_lena", affinity: { elias: 5 }, effects: { cohesion: -2 } }
    ],
    onEnter: () => {
      kill("rourke", "died with company");
      remember("You held Rourke's hand until it went cold.");
    }
  },
  rourke_stop: {
    text: `You give the order. Lena stops working.

Rourke makes a small sound. Then nothing.

The room feels colder. Mira will not look at you. Amara turns her face to the wall.

Elias nods once, satisfied.

You have already chosen what kind of Commander you will be.`,
    choices: [
      { text: "Face Lena. Own the order.", next: "intro_lena", affinity: { lena: -4 }, effects: { cohesion: -2 } },
      { text: "Do not linger. Move to the living.", next: "intro_lena", affinity: { elias: 6 }, effects: { cohesion: -3 } }
    ],
    onEnter: () => {
      kill("rourke", "ordered to stop treatment");
      mark("mira", "watched_stop");
      remember("You ordered Lena to stop. Mira looked away.");
    }
  },
  rourke_try: {
    text: `Lena works for forty-three minutes.

Rourke still dies.

The supplies are gone. The result is the same.

Lena strips off her gloves. "I told you."

But Mira looks at you differently. The silence after is heavier than the work.

Later you will learn Lena kept him alive longer than protocol allowed. She does not explain why.`,
    choices: [
      { text: "Thank Lena for trying. Then keep moving.", next: "intro_lena", affinity: { lena: 8 }, effects: { cohesion: 2 } },
      { text: "Say nothing. The cost is already clear.", next: "intro_lena", affinity: { mira: 4 }, effects: { cohesion: -1 } }
    ],
    onEnter: () => {
      const alreadyDead = state.dead.includes("rourke");
      kill("rourke", "attempted rescue, still died");
      if (!alreadyDead) {
        addAffinity("mira", 8);
        // tomas affinity deferred until recovered (0.23)
        remember("You spent the last stabilizers on a man who died anyway.");
      }
    }
  },
  silence: {
    text: `You do not speak.

The silence stretches. Someone starts to cry. Elias loses patience.

"Commander. We need orders. Now."

Rourke dies while you are still deciding what to say. Lena covers his face without looking at you.

The weight of their eyes is heavier than the silence was.`,
    choices: [
      { text: "Break the silence. Find Lena.", next: "intro_lena", effects: { cohesion: 2 } },
      { text: "Break the silence. Demand a status report from whoever will give one.", next: "intro_lena", effects: { cohesion: -1 }, affinity: { elias: 4 } }
    ],
    onEnter: () => {
      kill("rourke", "died in silence while orders waited");
      remember("Rourke died while you said nothing.");
    }
  },
  intro_lena: {
    text: `Dr. Lena Voss does not waste words.

She finishes sealing the body bag, washes her hands twice, then faces you.

"I have enough antibiotics for two serious infections and one surgical kit with no anesthetics left. The air scrubbers are already filtering blood particulates. If we lose another hull seal, the CO₂ will climb faster than I can treat the symptoms."

She glances once at the empty recovery racks — capacity for a full medical wing. Nine people do not need a wing.

"I will keep them alive as long as the ship lets me. That is the only promise I can make."`,
    choices: [
      { text: "Give her authority over all medical decisions without question.", next: "intro_elias", effects: { cohesion: 4, supplies: -3 }, flag: { lena_authority: true }, affinity: { lena: 15 }, trust: { lena: 12 } },
      { text: "Tell her every major intervention needs your approval. Resources are that tight.", next: "intro_elias", effects: { cohesion: -3, supplies: 2 }, flag: { lena_authority: false }, affinity: { lena: -8 }, trust: { lena: -10 } },
      { text: "Ask her what she needs most right now.", next: "intro_elias", effects: { cohesion: 2, supplies: -5 }, flag: { lena_authority: true }, affinity: { lena: 10 }, trust: { lena: 8 } }
    ],
    onEnter: () => { if (!state.dead.includes("rourke")) kill("rourke", "died while command was taken"); }
  },
  intro_elias: {
    text: `Elias Kane is waiting in the corridor outside medical. He does not wait long for people.

"Rourke was always going to die. The question is how many more we write off before the math forces your hand."

He is tall, scarred, and already thinking three crises ahead.

"I can keep order. I can keep people working. I can keep the weapons locked and the corridors quiet. What I cannot do is pretend soft leadership will survive the first real shortage."

He studies you.

"Decide how hard you intend to hold this ship before the empty decks decide for you."`,
    choices: [
      { text: "Give him security authority and the right to enforce work quotas.", next: "vault_reveal", effects: { integrity: 3, cohesion: -6 }, flag: { elias_power: "high", leadership_style: "hard" }, affinity: { elias: 12 }, trust: { elias: 15, lena: -5, tomas: -5 } },
      { text: "Keep security under your direct control. No freelancing.", next: "vault_reveal", effects: { cohesion: 3 }, flag: { elias_power: "limited", leadership_style: "balanced" }, affinity: { elias: 4 }, trust: { elias: 0 } },
      { text: "Tell him you will not rule by fear. He will have to adapt.", next: "vault_reveal", effects: { cohesion: 5, integrity: -2 }, flag: { elias_power: "low", leadership_style: "soft" }, affinity: { elias: -10 }, trust: { elias: -12, tomas: 8 } }
    ]
  },





  vault_reveal: {
    text: `Mira stops you in the corridor outside the sealed cargo section.

"You need to see this before you give any more orders."

She opens a secondary hatch. Cold air rolls out. Rows of cryogenic cylinders line the walls, each one marked with a genetic code and a viability percentage. Below them, sealed containers of soil starters, fertilizer compounds, and genetic archives.

"This is what the Sunsplitter was actually built for. Not a lifeboat. A colonization ark. Restart package first — embryos, archives, soil starters. The living complement was supposed to be thousands. We got nine through the hatch when the cascade closed the sky."

The monitoring panel still cycles: EMBRYOS VIABLE — 100%. POWER DRAW — STABLE. Empty crew manifests scroll in a side pane and nobody has had the nerve to clear them.

Elias stands in the doorway, arms folded. "Now you know what the real cargo is. Every decision from here on is about which future we feed."

Lena, from behind you: "We are also still alive. Do not forget which side of the glass you are on."

The argument that will define the rest of the voyage has names now. Future. Living. This lean will return — in who trusts you, what options stay open, and what the ship remembers. Leadership is a separate question: how hard you hold the living while you answer it.`,
    choices: [
      { text: "The living come first. We protect the people who are already breathing.", next: "status", effects: { cohesion: 4 }, flag: { vault_priority: "living" }, lean: { living: 6 }, affinity: { lena: 8, tomas: 10, elias: -6 }, trust: { lena: 10, tomas: 12, elias: -8, jiro: -4 } },
      { text: "This is the only future that matters. Everything else is temporary.", next: "status", effects: { cohesion: -3 }, flag: { vault_priority: "future" }, lean: { future: 6 }, affinity: { elias: 10, jiro: 8, lena: -6, tomas: -8 }, trust: { elias: 12, jiro: 10, lena: -6, tomas: -10 } },
      { text: "We protect both until the ship forces a choice.", next: "status", effects: { cohesion: 1 }, flag: { vault_priority: "both" }, lean: { future: 2, living: 2 }, affinity: { mira: 6 } }
    ]
  },
  status: {
    get text() {
      const n = state.survivors;
      let t = `You gather what remains of your people in the corridor outside medical.\n\n`;
      t += `${n} living.`;
      if (!isAlive("rourke")) t += ` One body already cooling.`;
      t += ` The manifests still list capacity for a colony. Most of those berths will never be filled.\n\n`;
      t += `Behind a sealed hatch: one hundred percent of a future that has never drawn breath.\n\n`;
      if (isAlive("mira")) {
        t += `Mira gives the report in a thin voice:\n\n"Primary drive offline. Auxiliary power only. Life support holding at sixty-two percent. Food and water maybe five weeks if we ration hard. Hull breach on Deck 3 sealed but temporary. Navigation half-blind. No destination. Vault power stable — for now."\n\n`;
      } else {
        t += `The systems board gives the report without a voice: drive offline, life support at sixty-two percent, vault power stable — for now.\n\n`;
      }
      if (isAlive("elias")) t += `Elias: "And no one is coming for us."\n\n`;
      if (isAlive("lena")) t += `Lena asks the question no one else will:\n\n"What are your orders, Commander?"`;
      else t += `Someone asks, without rank: "What are your orders?"`;
      return t;
    },
    choices: [
      { text: "Prioritize life support and hull. Everything else secondary.", next: "priority_repairs", effects: { integrity: 12, supplies: -7 }, flag: { priority: "repairs" }, lean: { living: 3 }, affinity: { mira: 6, amara: 4 } },
      { text: "Ration immediately. Strict. No exceptions.", next: "priority_ration", effects: { supplies: 10, cohesion: -8 }, flag: { priority: "ration" }, lean: { future: 2 }, affinity: { elias: 6, amara: -4 } },
      { text: "We need a destination. Find anything that can still be a world.", next: "priority_planet", effects: { cohesion: 5, supplies: -3 }, flag: { priority: "planet" }, lean: { future: 3, living: 2 }, affinity: { jiro: 8, sela: 6 } }
    ]
  },
  priority_repairs: {
    text: `You put Mira and Amara on the hull and life support. The nav station stays dark — Jiro is not among the nine who made the hatch.

They work through the next cycle without sleep. Temporary seals hold. Hull climbs.

Elias watches with narrowed eyes. "We're fixing a coffin so it lasts longer."

Amara answers without looking up: "Then we make the coffin worth living in."

Mira gains something like confidence. The ship feels marginally less like it is actively trying to kill you.`,
    choices: [
      { text: "Check the hydroponics bay. Food is the next crisis.", next: "hydroponics", effects: { integrity: 2 } },
      { text: "Walk the ship first. See how the crew is holding.", next: "crew_walk", effects: { cohesion: 2 } }
    ]
  },
  priority_ration: {
    text: `You announce the rationing schedule yourself.

Half portions. Water measured. No private stores.

Mira accepts it without complaint. Elias looks almost pleased. Lena simply nods — she already knew the math.

Amara exchanges a look with no one in particular. Sela asks if the paste is supposed to taste like nothing. No one answers her.

Hunger will make them honest soon enough.`,
    choices: [
      { text: "Check the hydroponics bay. Food is the next crisis.", next: "hydroponics", effects: { supplies: 2 } },
      { text: "Walk the ship first. See how the crew is holding.", next: "crew_walk", effects: { cohesion: 1 } }
    ]
  },
  priority_planet: {
    text: `You order a full sweep of every remaining sensor and archive.

Hours later Mira returns with a single file.

"There is a candidate. A rogue planet. No star. Ice and rock. Possible subsurface ocean. Fourteen months at current thrust — if the drive ever comes back."

Elias laughs once, without humor. "So we freeze in the dark instead of starving in the dark."

Lena: "It's something."

Sela watches the schematic as if it might become a sun. The navigation board is still empty of the man who was supposed to own it.`,
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
    text: `The hydroponics bay is half-dead.

Amara Vale — the woman with the house key from Lagos on a cord at her throat — stands among the trays with a tablet and quiet fury. This is the first time you have heard her report in full.

"Power fluctuations killed the UV cycle. I can restart the full array, but it pulls from life support. Or I keep a minimal crop on low power and we stay on paste longer."

She turns the key once between her fingers.

"I grew food for three habitats before the cascade. This bay was sized for hundreds. We are nine. That does not make the last green trays optional. If we lose them, morale drops harder than the calories."`,
    choices: [
      { text: "Full power to hydroponics. Real food and something living.", next: "crew_walk", effects: { supplies: 9, integrity: -7, cohesion: 5 }, flag: { hydro: "full" }, lean: { living: 2 }, affinity: { amara: 8 }, trust: { amara: 6 } },
      { text: "Minimal power only. Protect life support first.", next: "crew_walk", effects: { supplies: -4, integrity: 4, cohesion: -3 }, flag: { hydro: "minimal" }, lean: { future: 1 }, affinity: { amara: -4 }, trust: { amara: -3 } },
      { text: "Strip failed racks for parts. Seed a smaller, efficient system.", next: "crew_walk", effects: { supplies: 3, integrity: -2, cohesion: 2 }, flag: { hydro: "rebuild" }, affinity: { amara: 4 } }
    ]
  },
  crew_walk: {
    text: `You move through a ship sized for a civilization that did not board.

Deck 2 berths: names still printed on locker lips. A child's shoe in a size no one on this crew wears. Bedding folded for people who never made the ring. The air recyclers run at a fraction of design load and still sound too loud.

Medical: Lena catalogues every remaining drug by hand. Empty recovery racks line the far wall like an accusation. A covered body still occupies the corner.

Engineering: Mira is asleep at her console — face lit by warning lights. One is a drive fault she has not yet reported. Her hands, even asleep, rest near the manual overrides.

Common area: Amara sits alone with a cold cup. Seating for two hundred. The wash rack holds fewer cups than the manifest claimed. Two names from the boarding list never answered the final call.

Observation blister: stars drift at an uneven rate. Daylight panels still cycle an obsolete Earth sunrise over empty rows. The star tracker console is dark.

Before Elias finds you, there is a moment — small, private — that no one else needs to see.`,
    choices: [
      { text: "Stop by Sela. She is at the bulkhead again.", next: "quiet_sela", effects: { cohesion: 2 }, affinity: { sela: 12 }, alive: "sela" },
      { text: "Wake Mira gently. The drive fault is still open.", next: "quiet_mira", effects: { cohesion: 1 }, affinity: { mira: 10 }, alive: "mira" },
      { text: "Sit with Tomas without asking for anything.", next: "quiet_tomas", effects: { cohesion: 3 }, affinity: { tomas: 10 }, alive: "tomas" },
      { text: "Find Amara among the trays.", next: "quiet_amara", effects: { cohesion: 2 }, affinity: { amara: 10 }, alive: "amara" },
      { text: "Share a quiet hour with Elias — no orders.", next: "bond_elias", effects: { cohesion: 1 }, alive: "elias", tag: "bond" },
      { text: "Sit a low-stakes game with Tomas if he will play.", next: "bond_tomas", effects: { cohesion: 1 }, alive: "tomas", tag: "bond" },
      { text: "Join Jiro on a competence hang at the star tracker.", next: "bond_jiro", effects: { cohesion: 1 }, alive: "jiro", tag: "bond" },
      { text: "Walk the empty berths before you take any more orders.", next: "empty_berths", effects: { cohesion: 1 } },
      { text: "Skip the quiet. Elias is already waiting.", next: "lead_prompt", effects: { cohesion: -1 } }
    ]
  },

  empty_berths: {
    text: `The habitation spine was never meant to feel this hollow.

You pass berth tags still waiting for check-in: families, specialists, a whole hydroponics cohort that never left the pad. Someone's handwritten list is taped inside a locker door — first names only, a few crossed out in a different ink, the rest left open as if the cascade might reverse.

In the laundry nook, uniforms hang in sizes that will not be filled. The ship's inventory system still politely requests biometric updates for three hundred and forty-one missing crew IDs.

This is not a mystery. It is a design that assumed a different launch day. The Sunsplitter did not become empty by accident. It launched incomplete.`,
    choices: [
      { text: "Take one name from the list into memory. Then go back to the living.", next: "lead_prompt", effects: { cohesion: 2 }, remember: "You kept one name from a locker list of people who never boarded." },
      { text: "Close the locker. The living are waiting for orders.", next: "lead_prompt", effects: { integrity: 1 } }
    ]
  },

  competence_watch: {
    get text() {
      let t = `Not every hour is a crisis.

`;
      if (isAlive("mira")) t += `Mira has the auxiliary grid balanced without being asked. The knock in the hull is quieter. She does not look for praise; she looks at the next fault light.

`;
      if (isAlive("jiro")) t += `Jiro has recalibrated the star tracker against a dead catalog and still gotten a usable fix. When he speaks, it is one sentence: "We know where we are. That is not nothing."

`;
      if (isAlive("amara")) t += `Amara's trays are not saving the ship. They are keeping one corridor honest about green things. She works as if the original bay roster might still arrive.

`;
      if (isAlive("lena")) t += `Lena restocks a cabinet that will never be full again and still labels every vial. Competence is not hope. It is refusal to get sloppy.

`;
      if (isAlive("sela")) t += `Sela's yellow circles have not multiplied into chaos. They have gotten tighter. Precision is her form of care.

`;
      t += `The ship is still dying on a long fuse. The people left are still good at what they were trained to be.`;
      return t;
    },
    choices: [
      // Forward only — must not re-enter lead_prompt declaration (0.20.2)
      { text: "Let them work. Do not turn competence into another speech.", next: "power_crisis", effects: { cohesion: 3 }, lean: { living: 1 } },
      { text: "Log the gains. Quiet success still has to be counted.", next: "power_crisis", effects: { integrity: 2, cohesion: 1 }, lean: { future: 1 } }
    ]
  },

  quiet_sela: {
    text: `Sela works at the bulkhead that no longer opens — the one the crew walks past without looking.

Yellow pigment on salvaged plating. The same circle, tightened, revised. A sun that has no right to exist out here.

She does not startle when you sit. After a stretch of silence she speaks without looking up, voice low and exact:

"The daylight panels are still running an Earth schedule. That is not comfort. That is a system that has not been told the truth."

She turns the plate so you can see the latest version.

"It was warm. Not a memory to cry over — a fact. If we only keep what the dark allows, we will forget what we were trying to arrive as."

When you leave she has already started the next circle — same diameter, cleaner line. The hatch stays empty.`,
    choices: [
      { text: "Tell her the yellow is a fact worth protecting.", next: "prom_make_sela", affinity: { sela: 10 }, effects: { cohesion: 3, supplies: -1 }, lean: { living: 2 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" } },
      { text: "Ask what she would refuse to optimize away.", next: "prom_make_sela", affinity: { sela: 8 }, effects: { cohesion: 2 }, lean: { living: 1 }, mark: { sela: "spoken" } },
      { text: "Say nothing. Leave the plate where it is.", next: "prom_make_sela", affinity: { sela: 4 }, effects: { cohesion: 1 } }
    ],
    onEnter: () => {
      remember("Sela called the Earth sunrise panels a system that has not been told the truth.");
      mark("sela", "spoken");
      if (state.flags.sela_attention !== "ignored") {
        state.flags.sela_attention = state.flags.sela_attention || "present";
      }
    }
  },


  quiet_mira: {
    text: `You touch her shoulder. Mira Solis jerks awake with a sound that is almost a word.

Drive systems specialist. The patch on her suit is the first clean name you get for the woman who has been keeping the boards from going dark.

"How long?" she asks. Then she sees the fault light still open and answers herself.

"I can chase the drive, or I can keep patching the things that keep people breathing. I cannot do both at full effort. Someone has to tell me which failure we are allowed to live with."

She waits. Not soft. Hungry for an answer that will let her work.`,
    choices: [
      { text: "Tell her people come first when it is that or the ship.", next: "lead_prompt", affinity: { mira: 8 }, trust: { mira: 6 }, mark: { mira: "people_first" }, lean: { living: 1 } },
      { text: "Tell her the ship has to hold or none of this matters.", next: "lead_prompt", affinity: { mira: 6 }, trust: { mira: 5 }, mark: { mira: "drive_first" }, lean: { future: 1 } },
      { text: "Say nothing. Let the quiet stand.", next: "lead_prompt", affinity: { mira: 4 } }
    ]
  },


  quiet_tomas: {
    text: `Brother Tomas sits where the common area still has a shadow that feels intentional.

He has no rank and no console. He was a hospital chaplain before the pads. On this ship he keeps the human cost on the ledger when everyone else is trying to close it.

"They will come to you with numbers," he says. "I will come to you with names. I am not asking you to ignore the numbers. I am asking you not to pretend the names are noise."

He does not ask for a promise. He waits to see whether you can sit without filling the silence with orders.`,
    choices: [
      { text: "Tell him you heard him.", next: "lead_prompt", affinity: { tomas: 10 }, trust: { tomas: 8 }, effects: { cohesion: 2 }, lean: { living: 1 } },
      { text: "Leave the silence unbroken.", next: "lead_prompt", affinity: { tomas: 5 }, trust: { tomas: 3 } }
    ]
  },


  quiet_amara: {
    text: `Amara is on her knees between the trays, checking root systems by hand. When she sees you she does not stand.

"The paste will keep us alive," she says. "It will not keep us human. That is not a metaphor. I have watched people forget the taste of green things and then forget why they were supposed to care about anything else."

She presses a small leaf into your palm. It is pale and not much, but it is alive.

"If you decide the plants are a luxury, say so clearly. I would rather know."`,
    choices: [
      { text: "Promise the living things still matter.", next: "prom_make_amara", affinity: { amara: 8 }, mark: { amara: "plants_matter" } },
      { text: "Tell her the math will decide, not sentiment.", next: "prom_make_amara", affinity: { amara: -4 }, mark: { amara: "math_first" } }
    ],
    onEnter: () => remember("Amara put a living leaf in your hand.")
  },

  bond_elias: {
    text: `Elias does not do small talk. He does, apparently, keep a sealed bulb of something that was never ship-issue.

He pours two measures without asking whether you drink. The common area is empty enough that the silence is a choice, not an accident.

"Rourke used to sit here after docking runs," he says. Not a eulogy. A coordinate. "He thought the ship would outlast every name on the roster. He was half right."

He does not ask for your past. He does not offer his. He lets the shared quiet be the whole transaction — two people who have already made hard calls, not pretending the next ones will be easier.`,
    get choices() {
      // 0.23.3: early exit stays lead_prompt; post-vault (recovered path) returns to act3_spine_next
      const next = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      return [
        { text: "Drink. Let the quiet stand without turning it into a briefing.", next, affinity: { elias: 12 }, trust: { elias: 10 }, effects: { cohesion: 2 }, mark: { elias: "bonded" }, remember: "Elias shared a non-regulation drink and Rourke's name without demanding anything back." },
        { text: "Ask one question about what he was before the lists.", next, affinity: { elias: 8 }, trust: { elias: 8 }, effects: { cohesion: 1 }, mark: { elias: "bonded" }, remember: "Elias admitted he was selection security long before the cascade — the lists were always his language." },
        { text: "Leave the bulb untouched. You will not soften this chain of command.", next, affinity: { elias: 2 }, mark: { elias: "bond_skipped" } }
      ];
    },
    image: "images/bond_elias.jpg"
  },

  bond_tomas: {
    text: `Tomas has a thin pack of cards that have survived more washes than sense.

He deals without sermon. The game is simple enough that neither of you needs to pretend it matters. When he loses a hand he almost smiles.

"Before the ship I sat with people who were dying slower than this," he says. "Different building. Same arithmetic. The ones who wanted a priest and the ones who wanted a witness were not always the same people."

He does not recruit you. He plays the next card.`,
    get choices() {
      return [
        { text: "Play until the deck runs out. Be a witness, not a commander.", next: "prom_make_tomas", affinity: { tomas: 12 }, trust: { tomas: 10 }, effects: { cohesion: 3 }, mark: { tomas: "bonded" }, lean: { living: 1 }, remember: "Tomas dealt cards and named the difference between a priest and a witness." },
        { text: "Ask what he still refuses to call lost.", next: "prom_make_tomas", affinity: { tomas: 10 }, trust: { tomas: 8 }, effects: { cohesion: 2 }, mark: { tomas: "bonded" }, remember: "Tomas said he refuses to call the living a preliminary cost for the vault." },
        { text: "Fold early. Duty is waiting in the corridor.", next: "prom_make_tomas", affinity: { tomas: 3 }, mark: { tomas: "bond_skipped" } }
      ];
    },
    image: "images/bond_tomas.jpg"
  },

  bond_jiro: {
    text: `Jiro is recalibrating the star tracker against a catalog that no longer matches the sky.

He does not look up when you enter. After a stretch of clean silence he slides a second stool an inch with his foot — invitation without performance.

"I trained for a longer mission with a full nav section," he says. "Eight people. We had arguments about proper motion that lasted weeks. Now I argue with a dead database and win by default."

He shows you a fix that is almost elegant. Competence as company.`,
    get choices() {
      const next = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      return [
        { text: "Sit the stool. Help with the dull part of the calibration.", next, affinity: { jiro: 12 }, trust: { jiro: 10 }, effects: { integrity: 2, cohesion: 2 }, mark: { jiro: "bonded" }, remember: "Jiro let you into the dull half of a star fix. He trained for a crew of eight." },
        { text: "Ask what heading he would choose if the commander were silent.", next, affinity: { jiro: 8 }, trust: { jiro: 8 }, effects: { cohesion: 1 }, mark: { jiro: "bonded" }, remember: "Jiro said if command went silent he would still hold a usable fix — not a destination, a refusal to be lost." },
        { text: "Leave him the work. You are not nav.", next, affinity: { jiro: 2 }, mark: { jiro: "bond_skipped" } }
      ];
    },
    image: "images/bond_jiro.jpg"
  },

  lead_prompt: {
    text: `Elias finds you in the observation blister.

"They're already choosing sides. Some think you hesitate too much. Some think you don't hesitate enough. You need to decide what kind of ship this is going to be before they decide for you."`,
    choices: [
      { text: "I will not rule by fear. We hold together or we die together.", next: "lead_together", effects: { cohesion: 10, integrity: -2 }, flag: { leadership: "together" } },
      { text: "Hard rules. Clear consequences. No debate.", next: "lead_hard", effects: { cohesion: -7, integrity: 6, supplies: 2 }, flag: { leadership: "hard" } },
      { text: "Tell me who is already talking against me.", next: "lead_watch", effects: { cohesion: -11, integrity: 2 }, flag: { leadership: "watch" } }
    ]
  },
  lead_together: {
    text: `You say it loud enough for anyone nearby to hear.

Elias studies you, then nods once. Not agreement — acknowledgment.

Amara catches your eye from the far hatch and does not look away. The empty chairs stay empty.

The ship does not become kinder. But the air feels less sharp.`,
    choices: [
      { text: "Answer the call from engineering.", next: "power_crisis" },
      { text: "Spend one more cycle with the crew before the next crisis.", next: "competence_watch", effects: { cohesion: 3, supplies: -2 } }
    ]
  },
  lead_hard: {
    text: `You draft the rules and post them.

Rations enforced. Work mandatory. Disobedience punished by reduced shares.

Elias smiles with half his mouth. Mira looks at the list and says nothing.

Two survivors stop speaking when you pass.

Order returns. Trust does not.`,
    choices: [
      { text: "Answer the call from engineering.", next: "power_crisis", effects: { integrity: 1 } },
      { text: "Enforce the first ration cut yourself. Make the rule real.", next: "power_crisis", effects: { supplies: 5, cohesion: -5, integrity: 1 }, lean: { future: 2 } }
    ]
  },
  lead_watch: {
    text: `Elias gives you three names without hesitation.

You do not act on them yet. The knowledge sits in your chest like a stone.

Word spreads that you asked. The corridors grow quieter when you walk them.

You have drawn a line. People are already deciding which side of it they stand on.`,
    choices: [
      { text: "Answer the call from engineering.", next: "power_crisis" },
      { text: "Ask Elias to watch those three quietly. Do not act yet.", next: "power_crisis", effects: { cohesion: -2 }, trust: { elias: 8 } }
    ]
  },
  power_crisis: {
    text: `Mira calls you to engineering. The main power bus is fluctuating again.

"We can stabilize it by cutting non-essential systems for the next week — observation blister, most of the daylight panels, and half the common area lighting. That buys us stability.

Or we can burn through the remaining high-grade capacitors to keep everything online. Those capacitors are also what I need if we ever want the drive back."

The choice is simple and ugly: comfort and visibility now, or the possibility of real thrust later. Supplies and trust will decide which options stay open.`,
    choices: [
      { text: "Cut non-essentials. Stabilize the ship.", next: "private_stores", effects: { integrity: 9, cohesion: -6, supplies: 3 }, flag: { power: "cut" } },
      { text: "Burn the capacitors. Keep systems running and protect the drive option.", next: "private_stores", effects: { integrity: -7, supplies: -9, cohesion: 4 }, flag: { power: "burn" }, requires: { supplies: { min: 12 } }, lean: { future: 2 } },
      { text: "Ask Mira to invent a third option, even if it is riskier.", next: "private_stores", effects: { integrity: -4, supplies: -5, cohesion: 5 }, flag: { power: "risk" }, requires: { trust: { mira: 45 }, supplies: { min: 8 } }, lean: { future: 1 } }
    ]
  },
  private_stores: {
    text: `Elias reports a problem he has been watching.

Two of the remaining survivors have been holding back small private food stores. Not enough to change the math of the ship — enough to create a line between those who share and those who do not.

"I can seize it and make an example. Or we can pretend we did not notice. Or you can address it yourself in front of everyone."

The food is almost irrelevant. What it represents is not. Cohesion will notice either way.`,
    choices: [
      { text: "Seize the stores and make the rule clear: no private reserves.", next: "coolant_trade", effects: { supplies: 6, cohesion: -9, integrity: 1 }, flag: { stores: "seize" }, lean: { future: 2 } },
      { text: "Ignore it. Some small secrets are the price of holding the group together.", next: "coolant_trade", effects: { cohesion: 3, supplies: -3 }, flag: { stores: "ignore" }, lean: { living: 1 } },
      { text: "Call everyone together and put the question to them. Let the group decide the rule.", next: "coolant_trade", effects: { cohesion: 6, supplies: 2, integrity: -1 }, flag: { stores: "vote" } }
    ]
  }
});
