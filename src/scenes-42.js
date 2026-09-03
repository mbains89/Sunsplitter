// Sunsplitter — scenes-42.js
// 0.28.1c size hygiene. Pure mechanical. early: bond_elias through private_stores
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // SUN-V035-PLAYTEST-MALE-CREW-01: accepted bond now includes a zero-write follow-through.
  // PRE: living Elias via crew_walk / act3_spine_next. WRITES: existing choice
  // affinity/trust/cohesion/marks/memories only; none added. DEATH: none.
  // DEAD SPEECH/APPEARANCE: original living-gated entry; follow-through guards its own renders.
  // IMAGE: unchanged bond_elias.jpg. CHRONOLOGY: VC-02 / VC-09, same quiet interval.
  bond_elias: {
    text: `Elias does not do small talk. He does, apparently, keep a sealed bulb of something that was never ship-issue.

He pours two measures without asking whether you drink. The common area is empty enough that the silence is a choice, not an accident.

"Rourke used to sit here after docking runs," he says. Not a eulogy. A coordinate. "He thought the ship would outlast every name on the roster. He was half right."

He does not ask for your past. He does not offer his. He lets the shared quiet be the whole transaction — two people who have already made hard calls, not pretending the next ones will be easier.`,
    get choices() {
      // 0.23.3: early exit stays lead_prompt; post-vault (recovered path) returns to act3_spine_next
      const next = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      return [
        { text: "Drink. Let the quiet stand without turning it into a briefing.", next: "bond_elias_mending", affinity: { elias: 12 }, trust: { elias: 10 }, effects: { cohesion: 2 }, mark: { elias: "bonded" }, remember: "Elias shared a non-regulation drink and Rourke's name without demanding anything back." },
        { text: "Ask one question about what he was before the lists.", next: "bond_elias_mending", affinity: { elias: 8 }, trust: { elias: 8 }, effects: { cohesion: 1 }, mark: { elias: "bonded" }, remember: "Elias admitted he was selection security long before the cascade — the lists were always his language." },
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

  // SUN-V035-PLAYTEST-MALE-CREW-01: accepted bond now includes a zero-write follow-through.
  // PRE: living, recovered Jiro via existing bond entry. WRITES: existing choice
  // affinity/trust/integrity/cohesion/marks/memories only; none added. DEATH: none.
  // DEAD SPEECH/APPEARANCE: original living-gated entry; follow-through guards its own renders.
  // IMAGE: unchanged bond_jiro.jpg. CHRONOLOGY: VC-09, same quiet interval; recovery ledger applies.
  bond_jiro: {
    text: `Jiro is recalibrating the star tracker against a catalog that no longer matches the sky.

He does not look up when you enter. After a stretch of clean silence he slides a second stool an inch with his foot — invitation without performance.

"I trained for a longer mission with a full nav section," he says. "Eight people. We had arguments about proper motion that lasted weeks. Now I argue with a dead database and win by default."

He shows you a fix that is almost elegant. Competence as company.`,
    get choices() {
      const next = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      return [
        { text: "Sit the stool. Help with the dull part of the calibration.", next: "bond_jiro_distance", affinity: { jiro: 12 }, trust: { jiro: 10 }, effects: { integrity: 2, cohesion: 2 }, mark: { jiro: "bonded" }, remember: "Jiro let you into the dull half of a star fix. He trained for a crew of eight." },
        { text: "Ask what heading he would choose if the commander were silent.", next: "bond_jiro_distance", affinity: { jiro: 8 }, trust: { jiro: 8 }, effects: { cohesion: 1 }, mark: { jiro: "bonded" }, remember: "Jiro said if command went silent he would still hold a usable fix — not a destination, a refusal to be lost." },
        { text: "Leave him the work. You are not nav.", next, affinity: { jiro: 2 }, mark: { jiro: "bond_skipped" } }
      ];
    },
    image: "images/bond_jiro.jpg"
  },

  // SCENE: bond_elias_mending | TICKET: SUN-V035-PLAYTEST-MALE-CREW-01
  // PRE: either accepting bond_elias choice; isAlive("elias") at render.
  // WRITES: none beyond normal scene/save navigation; no new marks or rewards.
  // DEATH: none. DEAD SPEECH/APPEARANCE: live text + portrait guards; neutral fallback.
  // IMAGE: byte-identical elias.jpg alias; absent fallback onboarding_background.jpg.
  // CHRONOLOGY: VOYAGE_CHRONOLOGY VC-02 / VC-09 @ fed798c; ends the same quiet interval.
  bond_elias_mending: {
    get image() { return isAlive("elias") ? "images/elias.jpg" : "images/onboarding_background.jpg"; },
    text: () => {
      if (!isAlive("elias")) return "The chair is empty. There is no conversation to finish. The ship's work remains.";
      // Preserve the already-authored unmended-jacket consequence, not a new reconciliation.
      if (!isAlive("mira") && attributableDeath("mira")) {
        return `A work jacket lies folded beside Elias. The cuff is split. A needle rests across the open seam.

He sees you looking.

"Not tonight, Commander."

He folds the jacket over the needle. You leave it where it is.`;
      }
      return `Before you leave, Elias draws a work jacket across his knees. The cuff has opened along an old seam. He puts the needle through where the previous stitches held.

"Hold the edge, Commander."

You hold it. His stitches are small and close, the knot buried where it will not catch on a hatch. He tests the seam with both thumbs.

"You do all of them?" you ask.

"The torn ones."

There is no list beside the jacket. You have seen him keep lists for less.

He folds it with the repaired cuff on top.

"Leave it on the chair. They know where to look."

For once, he has given you a task that ends when it is done.`;
    },
    get choices() {
      return [{ text: "Return to the ship's work.", next: state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt" }];
    }
  },

  // SCENE: bond_jiro_distance | TICKET: SUN-V035-PLAYTEST-MALE-CREW-01
  // PRE: either accepting bond_jiro choice; isAlive("jiro") checks recovery and death live.
  // WRITES: none beyond normal scene/save navigation; no new marks or rewards.
  // DEATH: none. DEAD SPEECH/APPEARANCE: live text + portrait guards; neutral fallback.
  // IMAGE: byte-identical jiro.jpg alias; absent fallback onboarding_background.jpg.
  // CHRONOLOGY: VOYAGE_CHRONOLOGY VC-09 + recovery ledger @ fed798c; no new elapsed-time claim.
  bond_jiro_distance: {
    get image() { return isAlive("jiro") ? "images/jiro.jpg" : "images/onboarding_background.jpg"; },
    text: () => {
      if (!isAlive("jiro")) return "The second stool is empty. The chart stays where it was left. There is no conversation to finish.";
      return `As you get up, you ask Jiro how far it is to the common area.

"Forty seconds. Fifty if the hatch sticks."

You repeat the estimate. He looks up from the chart.

"Most people ask for meters."

"You don't."

His thumb trembles against the paper. He presses it flat without comment.

"Meters don't tell you whether someone will still be there."

You leave the second stool pulled out. He reaches to put it away, then stops.

"Forty seconds back," he says. "The hatch only sticks on the way out."

It is the first route he has given you with the return journey included without being asked.`;
    },
    get choices() {
      return [{ text: "Leave the second stool out. Return to duty.", next: state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt" }];
    }
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
  // PRE: after power_crisis, before time_pass; the original early living roster
  // WRITES: only the existing stores choice flag/effects; entry only orders events
  // DEATH: none | DEAD SPEECH/APPEARANCE: unchanged early roster, before lethal beats
  // IMAGE: unchanged private_stores binding; no art work
  // L-046 reopened narrowly by SUN-V035-PLAYTEST-MIDGAME-VARIETY-01.
  // Roll only before an offer is rendered. state.scene persists the selected
  // offer; sceneEntered resumes it without rolling or replaying a paid choice.
  private_stores: {
    onEnter: (entry = {}) => {
      if (state.flags.stores) return state.flags.coolant ? "seal_or_food" : "coolant_trade";
      // Conservative reversal floor: at most 3 supplies for coolant plus 3
      // for the stores exit; at most 3+9 cohesion spent, leaving 1 for Deck 4's
      // no-supplies patch. Every legal reversed outcome retains an exit.
      // Depleted runs retain their original order. Legacy resumes retain the
      // already offered stores scene even without the sceneEntered marker.
      if (!entry.resume && !state.flags.coolant && state.supplies >= 6 && state.cohesion >= 13) {
        const coolantAvailable = scenes.coolant_trade.choices.some(c =>
          (!c.alive || isAlive(c.alive)) && (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects));
        if (coolantAvailable && Math.random() < 0.5) return "coolant_trade";
      }
    },
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
