// TEST-ONLY. Never imported by index.html, scene files, or the game runtime.
// SUN-PLAYERFLOW-COSTCHECK-03 proof fixture. Loaded only with --broken-fixture,
// then injected into the live `scenes` object the costs check already walks.
export const brokenCostFixture = {
  id: "costcheck_fixture_only",
  skip: "expected-fail carried from the old costs check",
  choices: [
    {
      text: "Spend stores you do not have",
      effects: { supplies: -5 },
      forceOffer: true
    },
    {
      text: "Cost line with no number",
      effects: { cohesion: null }
    }
  ]
};
