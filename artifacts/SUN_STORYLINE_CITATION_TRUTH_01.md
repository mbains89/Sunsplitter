# SUN-STORYLINE-CITATION-TRUTH-01

Docs + negative fixtures only. No scene rewrite. No invented endings.
Base: `2c35896a18e15430acf813d6365e906d6dbb6027`.

Fable / FABLE_BRIEF §10 + pillar 6: endings and What Remains cite only
facts from the current run. No counterfactuals, no evaluation, no scores.
Cause-of-death phrasing from logged `state.deathCause` event strings.

## Truth table (live helpers on this tip)

| Surface | Source helper | Cites | Must not cite |
|---|---|---|---|
| What Remains line 1 | `whatRemainsIdeologyShape()` | Recorded-order weights only (`future-living` ≥ 8) | `vault_sacrifice` override used by `ideologyShape()` / ending routing |
| What Remains deaths | `whatRemainsDeathFacts()` + `whatRemainsDeathClause()` | `state.dead` order (Rourke first) + logged `deathCause` clause | Anyone not in `state.dead`; a guessed cause when the log is missing (`<name> died` only) |
| What Remains crisis | `whatRemainsCrisisFact()` | `vault_sacrifice` and the taken `crisisPath` answer flags | The unused crisis path; a crisis that was not taken |
| What Remains promise | `whatRemainsPromiseFact()` | First tested (`kept`/`broken`) promise, death-causing first | `made` / untested promises (V6) |
| What Remains relational | `whatRemainsRelationalFact()` | Crossed romance flags + living/dead tense | Partners who were not crossed |
| Ending destination | `ideologyShape()` + existing ending screens | Vault override + weights | What Remains weight line (separate surface) |

No new ending titles. Landfall / Breath / Custody names already in those helpers stay.

## Negative fixtures (wired through `scripts/remains-lean-checks.mjs`)

1. Joined What Remains text must not match `would have|if you had|should have|high score|low score|ending rating|points awarded`.
2. `kill(lena, "not_a_logged_event_string")` → clause is `Lena died`, not an invented medical story.
3. `deathCause.lena` set while `state.dead` omits Lena → no Lena death line.
4. `promises.amara === "made"` → no service-pocket test line.

HOLD: PR 45/46, L-025–028, Canon, 0.36, story rewrite campaign.
