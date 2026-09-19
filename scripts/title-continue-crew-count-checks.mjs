// SUN-TITLE-CONTINUE-CREW-COUNT-01 — title Continue chip must match HUD visible living roster.
// After Rourke dies with Tomas/Jiro/Vess still missing, chip must say "5 alive" not "8 alive".
export function titleContinueCrewCountChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showScene("wake");
    persistSave({ silent: true });
    kill("rourke", "title-chip fixture");
    persistSave({ silent: true });
    showScreen("title");
    refreshTitleResumeUI();
    const meta = document.getElementById("resume-meta");
    return {
      chip: meta ? meta.textContent : "",
      living: (typeof visibleLivingCrewCount === "function") ? visibleLivingCrewCount() : null,
      survivors: state.survivors,
      dead: (state.dead || []).slice(),
      recovered: Object.assign({}, state.recovered)
    };
  })()`);
  if (fixture.living !== 5) errors.push("title-chip fixture living expected 5, got " + fixture.living);
  if (fixture.survivors !== 8) errors.push("mechanical survivors must stay 8 after Rourke, got " + fixture.survivors);
  if (/\b8 alive\b/.test(fixture.chip)) {
    errors.push("title Continue chip leaked missing-as-alive after Rourke: " + JSON.stringify(fixture.chip));
  }
  if (!/\b5 alive\b/.test(fixture.chip)) {
    errors.push("title Continue chip missing 5 alive after Rourke: " + JSON.stringify(fixture.chip));
  }
  return errors;
}
