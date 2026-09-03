// Sunsplitter — scenes-30.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: bond_mira + romance_mira + bond_amara + romance_amara + bond_sela + romance_sela
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  bond_mira: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_mira";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("mira")) return `Engineering is empty.`;
      return `Mira is alone with the drive schematic and a cooling mug she has not touched.\n\n"I keep fixing things that will break again," she says without looking up. "I need something that is not a system. If that is not you, say so before I make a fool of both of us."\n\nShe finally turns. Grease on her wrist. Tired eyes. No performance.\n\n"I am not asking for a future. I am asking for one honest hour that is not the ship."`;
    },
    get choices() {
      if (!isAlive("mira")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Stay. Give her the honest hour.", next: "romance_mira_1", affinity: { mira: 10 }, trust: { mira: 6 } },
        { text: "Tell her you care — and that sex would complicate the chain of command tonight.", next: "intimacy_window", affinity: { mira: 8 }, trust: { mira: 8 }, mark: { mira: "held_only" }, effects: { cohesion: 2 } },
        { text: "Step back. Not her. Not like this.", next: "intimacy_window", mark: { mira: "declined" } }
      ];
    }
  },

  romance_mira_1: {
    get text() { return `She does not wait for a speech. She steps into your space, pulls your mouth to hers, and the kiss is immediate and hungry.\n\nClothes come off against the console. She is explicit about what she wants — your hands, your mouth, the weight of you. The sex is intense, almost angry with need, her legs locked around you as the ship vibrates under both of you. When she comes she bites down on a sound so the rest of the crew will not hear. Afterward she stays against you longer than the work schedule allows.\n\n"That was not a mistake," she says quietly. "Do not treat it like one.${isAlive("elias") ? " And do not pretend Elias will not notice who you left engineering smelling like." : ""}"`; },
    get choices() {
      const opts = [
        { text: "Tell her you want more of this, whatever the public cost.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { mira: 8 }, lean: { living: 1 } },
        { text: "Hold her. Make no promise the crew can overhear.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { mira: 5 } }
      ];
      // 0.22.1 optional one-shot shower linger
      if (isAlive("mira") && !state.flags.mira_shower_done) {
        opts.push({ text: "Linger. Share the rinse station before the corridor takes the rest of the hour.", next: "mira_shower" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("mira")) return "intimacy_window";
      if (!state.romance.mira) {
        state.romance.mira = true;
        addAffinity("mira", 40);
        addTrust("mira", 12);
        remember("You and Mira crossed a line in engineering. The ship is too small to hide it.");
      }
    },
    image: "images/shower_mira.jpg"
  },

  bond_amara: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_amara";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("amara")) return `The trays are unattended.`;
      return `Amara is alone in the hydroponics bay. The house key from Lagos turns once between her fingers, then stills.\n\n"Listening and deciding are not the same job."\n\nShe looks at you directly — grounded, not coy.\n\n"I am not offering a three-person negotiation. I am asking if you want me. If the answer is no, I will keep growing food and we will still work. If the answer is yes, I need you to mean it when the crew starts counting who gets your private time."`;
    },
    get choices() {
      if (!isAlive("amara")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Tell her yes. Mean it.", next: "romance_amara_1", affinity: { amara: 10 }, trust: { amara: 8 } },
        { text: "Tell her you want her company without sex tonight.", next: "intimacy_window", affinity: { amara: 8 }, trust: { amara: 6 }, mark: { amara: "held_only" }, effects: { cohesion: 2 } },
        { text: "Tell her no. Keep the line clean.", next: "intimacy_window", affinity: { amara: 2 }, trust: { amara: 2 }, mark: { amara: "declined" } }
      ];
    }
  },

  romance_amara_1: {
    text: `She locks the bay hatch. Not dramatic — practical.\n\nWhat follows is unhurried and explicit. Amara is vocal about what she likes and what she does not. She pulls you down among the warm trays, skin against skin, the smell of wet earth and her mouth at your ear. She does not perform vulnerability; she chooses it. When she finishes she laughs once, quiet, then goes still with her forehead against your shoulder.\n\n"The crew will smell the bay," she says. "Let them. I am done pretending only the vault gets a future."`,
    get choices() {
      const opts = [
        { text: "Stay until the next duty cycle forces you out.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { amara: 8 }, lean: { living: 2 } },
        { text: "Dress. Kiss her once. Return to the corridor before you are missed.", next: "pursuit_window", effects: { cohesion: 1 }, affinity: { amara: 5 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("amara") && !state.flags.amara_rear_done) {
        opts.push({ text: "Stay a moment longer. Watch her before either of you reaches for clothes.", next: "amara_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("amara")) return "intimacy_window";
      if (!state.romance.amara) {
        state.romance.amara = true;
        addAffinity("amara", 40);
        addTrust("amara", 12);
        remember("You and Amara claimed the hydroponics bay. Favoritism is no longer theoretical.");
      }
    },
    image: "images/shower_amara.jpg"
  },

  bond_sela: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_sela";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("sela")) return `The bulkhead is unmarked tonight.`;
      return `Sela sits with a fresh plate of yellow pigment. She does not look surprised to see you.\n\n"You keep returning. That is data."\n\nA pause. She chooses the next sentence carefully.\n\n"I am not a project and I am not a child. If you are here for warmth, say the true version. If you are here because the yellow bothers you, leave it alone."\n\nHer voice stays precise. Adult. The ritual plate rests between you like a third party that will not be ignored.`;
    },
    get choices() {
      if (!isAlive("sela")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Tell her the true version: you want her, not the symbol.", next: "romance_sela_1", affinity: { sela: 12 }, trust: { sela: 8 } },
        { text: "Sit with the ritual only. No further claim.", next: "intimacy_window", affinity: { sela: 8 }, trust: { sela: 6 }, mark: { sela: "held_only" }, effects: { cohesion: 2 }, lean: { living: 1 } },
        { text: "Leave the plate alone. You will not take this further.", next: "intimacy_window", affinity: { sela: 2 }, mark: { sela: "declined" } }
      ];
    }
  },

  romance_sela_1: {
    text: `She sets the pigment down.\n\nWhat happens is slower than the ship usually allows. Sela is exact about boundaries and exact about desire — she tells you where to touch and when to stop and when not to stop. The sex is quiet, intense, deliberate; she does not perform for an audience that is not there. Afterward she draws one small yellow mark on the inside of your wrist with a fingertip, then rubs it away before it can dry.\n\n"That was not a claim on the crew's time," she says. "It was mine. If they notice, that is their measurement, not ours."`,
    get choices() {
      const opts = [
        { text: "Tell her you will protect what this was.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { sela: 10 }, lean: { living: 2 } },
        { text: "Match her silence. Let the mark be enough.", next: "pursuit_window", affinity: { sela: 8 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("sela") && !state.flags.sela_rear_done) {
        opts.push({ text: "Stay. Let the moment hold a little longer before either of you moves.", next: "sela_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("sela")) return "intimacy_window";
      if (!state.romance.sela) {
        state.romance.sela = true;
        addAffinity("sela", 45);
        addTrust("sela", 15);
        mark("sela", "spoken");
        remember("Sela chose you without an audience. The yellow is still a fact.");
      }
    },
    image: "images/shower_sela.jpg"
  },

});
