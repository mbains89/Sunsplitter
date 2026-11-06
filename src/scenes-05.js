// Sunsplitter — scenes-05.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: vault_voice
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: post-transmission vault route | WRITES: onEnter may write past_known_by.lena; paid choices affect resources/flag/lean; governed floor writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira/Tomas/Amara/Elias text and Mira choice are living-gated
  // SPEECH TAG: presence-line is Mira if living, else Tomas if living; never unattributed
  // IMAGE: REUSE images/vault_voice.jpg; no new art request
  vault_voice: {
    get text() {
      let t = `The vault monitoring panel has begun speaking.

Not an alarm. A voice. Soft, almost childlike, cycling through fragments of the original mission briefing and then, without warning, the names of the dead.

`;
      if (isAlive("mira")) {
        t += `Mira stands in front of it with her arms crossed tightly.

"It is a residual interface. The system was designed to report status to a living crew at the destination. Something in the power fluctuations woke a deeper layer. It is not conscious. It is worse. It is obedient to a purpose that no longer has a world."

`;
      } else {
        t += `The residual interface was designed to report status to a living crew at the destination. Power fluctuations woke a deeper layer. It is not conscious. It is obedient to a purpose that no longer has a world.

`;
      }
      if (isAlive("tomas")) {
        t += `Tomas is also there. He has not told anyone else.

`;
      }
      if (isAlive("mira") || isAlive("tomas")) {
        t += isAlive("mira")
          ? `Mira does not look away from the panel.

`
          : `Tomas keeps his voice low.

`;
        t += `"Some of the crew have started treating it as a presence.`;
        if (isAlive("amara")) t += ` Amara left a plant cutting on the hatch.`;
        if (isAlive("elias")) t += ` Elias wants the audio disabled.`;
        t += `"`;
      }
      return t;
    },
    onEnter: () => {
      if (state.flags.past === "lena_only") state.past_known_by.lena = true;
    },
    choices: [
      { text: "Disable the voice. It is a system, not a ghost.", next: "arc_fork", effects: { cohesion: -3, integrity: 2 }, flag: { vault_voice: "off" }, lean: { future: 2 }, reply: [`You cut the audio at the panel. The voice stops partway through a name, and nobody in the room finishes it.`, { who: "elias", text: `Elias checks the cutoff himself. "A voice that is not giving orders is still giving orders," he says. "Not anymore."` }] },
      { text: "Leave it. Let people hear what they need to hear.", next: "boarding_stories", effects: { cohesion: 4, supplies: -1 }, flag: { vault_voice: "on" }, lean: { living: 2 }, requires: { cohesion: { min: 30 } } },
      { text: "Restrict access. Only you and Mira hear it from now on.", next: "arc_fork", effects: { cohesion: -1, integrity: 1 }, flag: { vault_voice: "restricted" }, requires: { trust: { mira: 40 } }, alive: "mira", reply: [{ who: "mira", text: `Mira locks the audio to two command keys and hands you one. "Status reports only, routed to us. If it starts reading names again, I want root cause before anyone else hears it."` }] },
      { text: "Leave the panel untouched. Move on.", next: "arc_fork", reply: [`You leave the panel as it is. Behind you the voice finishes the names, goes back to the briefing, and begins again.`] }
    ]
  },

});
