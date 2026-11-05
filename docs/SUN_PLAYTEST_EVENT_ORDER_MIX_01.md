# SUN-PLAYTEST-EVENT-ORDER-MIX-01

Lane: `version/0.30.1-main-reconcile-ci.1` @ `5fd5711163c013958f065f1159d6b2db437619ea` (post PR196).
Paint: existing `VERSION.md`. NO-PUBLISH / NOT_CERTIFIED / 0.36 HOLD.

Verdict: **ALREADY_SATISFIED.** Docs only. No scene remint. Board lines from PR #192 / #193 stay locked.

## What may mix

Early-act one-shots `private_stores` and `coolant_trade` may trade places on a fresh run. That swap is already proven by `scripts/midgame-variety-checks.mjs`. Resume must not reroll the offered event. `seal_or_food` stays once, after both.

## What must not mix

Living-cast recoveries stay authored spine order. They are not a random pool.

1. Tomas — `act2_tether_dock` (after Green Tether).
2. Jiro — `act3_reckoning_cut` (after Dead Reckoning burns).
3. Vess — `vess_boarding` (after the Vess window opens).

Unrecovered or dead cast do not speak, do not take a board line, and do not appear ahead of their recovery beat. `scripts/living-cast-checks.mjs` already owns that graph.

Board sentences stay exactly:

- Tomas: `His name is on the board before anyone finds him a bunk.`
- Jiro: `His name is on the board before the briefing starts.`
- Vess: `Her name is on the board before the first watch turns.`

## Out of scope

No new mix of recoveries. No HUD change. No art. No remint of PRs 107–196. No 0.36.
