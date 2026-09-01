// L-026 — Last Off-Shift zero/one routes are defensive save-recovery guards.
// Not ordinary playable content. Do not add a player-facing selector for them.

export function offshiftDefensiveGuardChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const roster = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
    const killAllPresent = () => {
      for (const who of roster) {
        if (who === "tomas" || who === "jiro" || who === "vess") continue;
        if (!state.dead.includes(who)) kill(who, "L-026 fixture");
      }
    };

    resetRunState();
    state.flags.junctionChoice = "lena";
    killAllPresent();
    const zeroRedirect = scenes.offshift_open.onEnter();
    const zeroChoice = state.flags.junctionChoice;
    const zeroOffers = scenes.offshift_open.choices.map(choice => choice.next);

    resetRunState();
    kill("sela", "L-026 fixture");
    kill("mira", "L-026 fixture");
    kill("amara", "L-026 fixture");
    kill("elias", "L-026 fixture");
    const oneLenaRedirect = scenes.offshift_open.onEnter();
    const oneLenaChoice = state.flags.junctionChoice;
    scenes.offshift_lena.onEnter();
    const oneLenaAfterVisit = state.flags.junctionChoice;

    resetRunState();
    kill("lena", "L-026 fixture");
    kill("mira", "L-026 fixture");
    kill("amara", "L-026 fixture");
    kill("elias", "L-026 fixture");
    const oneSelaRedirect = scenes.offshift_open.onEnter();

    resetRunState();
    state.flags.junctionChoice = "lena";
    const multiRedirect = scenes.offshift_open.onEnter();
    const multiChoice = state.flags.junctionChoice;
    const multiOffers = scenes.offshift_open.choices.map(choice => choice.next);

    return {
      zeroRedirect,
      zeroChoice,
      zeroOffers,
      oneLenaRedirect,
      oneLenaChoice,
      oneLenaAfterVisit,
      oneSelaRedirect,
      multiRedirect,
      multiChoice,
      multiOffers
    };
  })()`);

  if (fixture.zeroRedirect !== "faction_split") {
    errors.push(`zero-eligible offshift_open redirected to ${fixture.zeroRedirect} != faction_split`);
  }
  if (fixture.zeroChoice !== "none") {
    errors.push(`zero-eligible guard did not write junctionChoice=none: ${fixture.zeroChoice}`);
  }
  if (fixture.zeroOffers.length) {
    errors.push(`zero-eligible offshift_open still rendered invitations: ${fixture.zeroOffers.join(",")}`);
  }
  if (fixture.oneLenaRedirect !== "offshift_lena") {
    errors.push(`one-eligible Lena auto-route ${fixture.oneLenaRedirect} != offshift_lena`);
  }
  if (fixture.oneLenaChoice) {
    errors.push(`one-eligible auto-route wrote junctionChoice before the destination scene: ${fixture.oneLenaChoice}`);
  }
  if (fixture.oneLenaAfterVisit !== "lena") {
    errors.push(`offshift_lena no longer preserves junctionChoice=lena: ${fixture.oneLenaAfterVisit}`);
  }
  if (fixture.oneSelaRedirect !== "filters_stencil") {
    errors.push(`one-eligible Sela auto-route ${fixture.oneSelaRedirect} != filters_stencil`);
  }
  if (fixture.multiRedirect) {
    errors.push(`two-or-more offshift_open auto-routed to ${fixture.multiRedirect}`);
  }
  if (fixture.multiChoice !== "lena") {
    errors.push(`two-or-more path mutated junctionChoice ${fixture.multiChoice} != lena`);
  }
  if (!fixture.multiOffers.includes("offshift_lena") || !fixture.multiOffers.includes("filters_stencil")) {
    errors.push(`two-or-more offshift_open lost ordinary invitations: ${fixture.multiOffers.join(",")}`);
  }
  return errors;
}
