// Sunsplitter — scenes-38.js
// 0.28.2 size hygiene. Pure mechanical. early: wake through silence
// Strict scene shape only: text | choices | onEnter | image
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
    text: `You held Rourke's hand. It was already cold.

He died twelve minutes later. No one speaks.

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

Rourke made one small sound before the room went still.

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
});
