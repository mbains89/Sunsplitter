// Sunsplitter — scenes-31.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: bond_lena + romance_amara_tomas + sex
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  bond_lena: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_lena";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("lena")) return `Medical is quiet in the wrong way.`;
      return `Lena is restocking a nearly empty cabinet when you return.

"If this is about guilt, I will throw you out. If this is about not wanting to be alone with the math, sit down."

She does not soften the prognosis. She softens nothing. The offer is presence — and, if you both decide, more.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Sit down. Cross the line without pity.", next: "romance_lena_sex", affinity: { lena: 10 }, trust: { lena: 6 } },
        { text: "Sit with her. No further.", next: "intimacy_window", affinity: { lena: 8 }, trust: { lena: 6 }, mark: { lena: "held_only" } },
        { text: "Leave before this becomes something you cannot schedule.", next: "intimacy_window", mark: { lena: "declined" } }
      ];
    }
  },

  // PRE: Amara and recovered Tomas alive; hydroponics full; offered from intimacy_window / act3_spine_next
  // WRITES: privacy leave applies +3 cohesion/affinity, marks privacy_left, does NOT set romance.amara_tomas
  // Stay/sex remains the only writer of romance.amara_tomas. Interrupt does not write romance.
  // DEATH: no death writes | DEAD SPEECH/APPEARANCE: empty-bay fallback requires both alive
  // IMAGE: REUSE images/romance_amara_tomas.jpg; no new art request
  romance_amara_tomas: {
    get text() {
      if (!isAlive("amara") || !isAlive("tomas")) return `The bay is empty. Whatever might have been shared here is gone.`;
      return `You find them together among the trays.

Amara looks over Tomas's shoulder and does not look away. There is an invitation in it, or at least no refusal. Tomas's hand rests at her waist. Neither of them pretends this is accidental.

"You can leave," Amara says. "Or you can stay. Those are the only clean options."`;
    },
    get choices() {
      if (!isAlive("amara") || !isAlive("tomas")) return [{ text: "Move on.", next: "intimacy_window" }];
      return [
        { text: "Leave them the privacy they have claimed.", next: "debt_notice", effects: { cohesion: 3 }, affinity: { amara: 4, tomas: 4 }, mark: { amara: "privacy_left" } },
        { text: "Stay. Join what they are offering.", next: "romance_amara_tomas_sex", effects: { cohesion: 4 } },
        { text: "Ask them to stop. This is a complication the ship cannot afford.", next: "intimacy_window", effects: { cohesion: -3 }, affinity: { amara: -4, tomas: -4 }, mark: { amara: "interrupted" } }
      ];
    }
  },

  romance_amara_tomas_sex: {
    text: `What follows is explicit and unhurried. Amara is vocal. Tomas is focused, almost worshipful. They include you fully — hands, mouths, the warm air of the bay. When it is finished Amara rests her forehead against Tomas's and then against yours.

"We are still allowed this," she says. "Even if the corridor disagrees later."`,
    choices: [
      { text: "Stay until the bay cools.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { amara: 10, tomas: 10 } },
      { text: "Dress and leave before the next watch.", next: "pursuit_window", affinity: { amara: 6, tomas: 6 } }
    ],
    onEnter: () => {
      if (!isAlive("amara") || !isAlive("tomas")) return "intimacy_window";
      if (!state.romance.amara_tomas) {
        state.romance.amara_tomas = true;
        addAffinity("amara", 25);
        addAffinity("tomas", 25);
        remember("You shared the hydroponics bay with Amara and Tomas. The crew will invent a version if you do not own one.");
      }
    },
    image: "images/romance_amara_tomas.jpg"
  },


});
