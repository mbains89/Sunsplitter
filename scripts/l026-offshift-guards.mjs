// L-026 — Last Off-Shift zero/one routes are defensive save-recovery guards.
// They are not ordinary playable content and must not gain a player-facing selector.

export function offshiftDefensiveGuardChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const killPresentCrew = () => {
      for (const who of ["lena", "elias", "mira", "amara", "sela"]) {
        kill(who, "L-026 fixture");
      }
    };

    resetRunState();
    state.crisisPath = "breath";
    state.flags.junctionChoice = "lena";
    killPresentCrew();
    const zeroRedirect = scenes.offshift_open.onEnter();
    const zero = {
      redirect: zeroRedirect || null,
      junctionChoice: state.flags.junctionChoice,
      offers: scenes.offshift_open.choices.map(choice => choice.next),
      followupRedirect: scenes.faction_split.onEnter() || null
    };

    resetRunState();
    state.crisisPath = "breath";
    for (const who of ["sela", "mira", "amara", "elias"]) kill(who, "L-026 fixture");
    const oneLenaRedirect = scenes.offshift_open.onEnter();
    const oneLenaBefore = state.flags.junctionChoice || null;
    scenes.offshift_lena.onEnter();
    const oneLenaAfter = state.flags.junctionChoice;

    resetRunState();
    state.crisisPath = "breath";
    for (const who of ["lena", "mira", "amara", "elias"]) kill(who, "L-026 fixture");
    const oneSelaRedirect = scenes.offshift_open.onEnter();
    const oneSelaBefore = state.flags.junctionChoice || null;
    scenes.offshift_sela.onEnter();
    const oneSelaAfter = state.flags.junctionChoice;

    resetRunState();
    state.crisisPath = "breath";
    state.flags.junctionChoice = "lena";
    const multiRedirect = scenes.offshift_open.onEnter();
    const multi = {
      redirect: multiRedirect || null,
      junctionChoice: state.flags.junctionChoice,
      offers: scenes.offshift_open.choices.map(choice => choice.next)
    };

    return {
      zero,
      oneLena: { redirect: oneLenaRedirect || null, before: oneLenaBefore, after: oneLenaAfter },
      oneSela: { redirect: oneSelaRedirect || null, before: oneSelaBefore, after: oneSelaAfter },
      multi
    };
  })()`);

  if (fixture.zero.redirect !== "faction_split" || fixture.zero.followupRedirect !== null) {
    errors.push("zero-eligible Off-Shift guard does not bypass cleanly to faction_split");
  }
  if (fixture.zero.junctionChoice !== "none") {
    errors.push(`zero-eligible Off-Shift guard wrote junctionChoice=${fixture.zero.junctionChoice} instead of none`);
  }
  if (fixture.zero.offers.length) errors.push(`zero-eligible Off-Shift guard rendered invitations: ${fixture.zero.offers.join(",")}`);

  if (fixture.oneLena.redirect !== "offshift_lena" || fixture.oneLena.before !== null || fixture.oneLena.after !== "lena") {
    errors.push("one-eligible Lena guard no longer defers junctionChoice to offshift_lena");
  }
  if (fixture.oneSela.redirect !== "filters_stencil" || fixture.oneSela.before !== null || fixture.oneSela.after !== "sela") {
    errors.push("one-eligible Sela guard no longer preserves the stencil route and destination junctionChoice");
  }

  if (fixture.multi.redirect !== null || fixture.multi.junctionChoice !== "lena") {
    errors.push("ordinary multi-eligible Off-Shift route auto-routed or mutated junctionChoice");
  }
  if (!fixture.multi.offers.includes("offshift_lena") || !fixture.multi.offers.includes("filters_stencil")) {
    errors.push(`ordinary multi-eligible Off-Shift selector lost invitations: ${fixture.multi.offers.join(",")}`);
  }
  return errors;
}
