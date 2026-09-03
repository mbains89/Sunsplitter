// Sunsplitter — scenes-11.js
// 0.28.1c size hygiene. Pure mechanical. crises: tether hands + dock
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: living Elias offered from tether approach; Tomas not dead (requireLivingCast)
  // WRITES: onEnter sets tether_hand_elias
  // DEATH: none here | DEAD SPEECH/APPEARANCE: dead Elias is not offered; requireLivingCast keeps rider living
  // IMAGE: REUSE images/tether_ride.jpg; one anonymous helmeted exterior rider, green annex still ahead.
  //   Not self_risk.jpg (wet interior corridor wheel). Mira is not on the plate. Commander faceless.
  act2_tether_hand_elias: {
    image: "images/tether_ride.jpg",
    onEnter: () => { state.flags.tether_hand_elias = true; },
    text: () => {
      const rushed = !!state.flags.tether_rushed;
      let t = `Elias suits up the way he does everything: once, in order, no wasted motion. He checks the tether shackle three times because three is the number, not because he's afraid.`;
      if (isAlive("mira")) {
        t += `\n\nMira stops him at the lock on a private channel. "The collar's failure modes are sequential, not simultaneous. If the primary shear ring binds, you have twelve seconds of secondary before the pressure wave. I told the room forty times the rating. That was for the room. This is for you." She does not wait for acknowledgment.`;
      }
      t += `\n\nOn the line, four kilometers of nothing under his boots, his comm stays flat. "On approach. Annex is bleeding light from the aft seam. ${rushed ? "Closing fast. This will bang." : "Closing slow. This will hold."} Ready."`;
      return t;
    },
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_hand_mira: {
    image: "images/self_risk.jpg",
    onEnter: () => { state.flags.tether_hand_mira = true; },
    text: () => {
      const rushed = !!state.flags.tether_rushed;
      return `"For the record," Mira says, sealing her helmet, "I'm the only person aboard who knows where that collar fails, which makes this the correct assignment and a bad one at the same time. Both can be true."

On the line she narrates the whole ride in measurements — range, closure, seam temperature. Somewhere in the middle the range calls drop to single numbers, then stop. "${rushed ? "Fourteen millibars a second is what I said and fourteen is what we'll get. Ready." : "Two meters a second. The collar is rated for forty times that. Ready."}"`;
    },
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_hand_sela: {
    image: "images/self_risk.jpg",
    onEnter: () => { state.flags.tether_hand_sela = true; },
    text: () => `Sela puts the suit on without being shown twice. "I will go," she says. "I have caught falling things before. None this large. The principle holds."

On the line she does not fill the silence. Range calls only, exact, unhurried. At two hundred meters she says one thing that is not a number: "There is green light coming through the strip. It is the correct color. I wanted someone else to know that before the catch, in case I am busy afterward."`,
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_dock: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (!isRecovered("tomas")) {
        state.recovered.tomas = true;
        if (state.flags.tether_rushed) state.flags.trays_dead = true;
        remember("Recovered Tomas alive from the agri-annex.");
        if (state.flags.tether_rushed) {
          remember("The sprouting trays died of pressure shock during the hard dock.");
        }
      }
    },
    text: () => {
      let t;
      if (state.flags.tether_rushed) {
        t = `The catch bangs. The whole spine rings with it, and through the observation strip the green goes over in one motion — rack after rack of sprouting trays slapping flat, soil and water sheeting off the walls. The collar seals. The seals were never the question.

The hatch opens on wet ruin. Grey-green mash where the trays were.`;
      } else {
        t = `The catch takes eight minutes and sounds like nothing at all — the tether singing once as it loads, the collar meeting the ring, a kiss and a seal. Through the strip the trays stand in their racks, rank on rank of green, untouched.

The hatch opens on the smell of soil. Nobody aboard has smelled soil in a long time.`;
      }
      // Rider-comm payoffs (guarded)
      if (state.flags.tether_hand_sela && isAlive("sela")) {
        t += state.flags.tether_rushed
          ? `\n\nSela's last call was a single word: "Sealed." Then silence until the hatch.`
          : `\n\nSela's last call was clean range and a quiet "Green light holds." She does not celebrate.`;
      } else if (state.flags.tether_hand_mira && isAlive("mira")) {
        t += `\n\nMira's last transmission was the seal pressure, read once, then "Collar holds."`;
      } else if (state.flags.tether_hand_elias && isAlive("elias")) {
        t += `\n\nElias comes off the line the same way he went on it: three checks, then the hatch.`;
      } else if (!["sela", "mira", "elias"].some(who => state.flags[`tether_hand_${who}`])) {
        t += `\n\nYou rode it yourself. The line sang under your hands the whole way in. Nobody else was available to hear the report.`;
      }
      t += `\n\nTomas comes through it on his own feet, barely. Gaunt to the bone, soil under every nail, eyes lamp-burned to a permanent squint. `;
      if (state.flags.tether_rushed) {
        t += `He is holding one tray against his chest. He braced it with his body through the catch. It is the only green thing left.`;
      } else {
        t += `He puts a hand on the nearest rack on his way out, the way other men touch a doorframe of a house they are leaving.`;
      }
      t += `\n\nHe looks at you before he looks at anyone else.\n\n"Count the trays before you thank me. Then decide whether you still want to."`;
      return t;
    },
    choices: [
      { text: "Get him to medbay.", next: "act2_tether_manifest" }
    ]
  },

});
