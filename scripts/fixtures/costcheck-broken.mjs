// TEST-ONLY. Never imported by index.html, scene files, or the game runtime.
// SUN-PLAYERFLOW-COSTCHECK-03 proof fixture: an unaffordable choice that is still offered,
// plus a cost field that is not a number. Loaded only with --broken-fixture.
export const brokenCostFixture = {
  id: "costcheck_fixture_only",
  skip: "expected-fail carried from the old costs check",
  choices: [
    {
      text: "Spend stores you do not have",
      effects: { supplies: -5 },
      balance: { supplies: 0 },
      offered: true
    },
    {
      text: "Cost line with no number",
      effects: { cohesion: null }
    }
  ]
};
