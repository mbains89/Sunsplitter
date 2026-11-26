# SUN-V036-PLAYTEST-GATE-02

Post-pin honesty checklist (report-only). No browser runtime. No art wire. No Netlify.

Source tip: `8fdc3cde2c2065f3272051345b38fa22c796d9a8` (PR216 pin refresh @ PACK-NEXT-02 playables).  
Lane: `version/0.30.1-main-reconcile-ci.1`  
Paint **0.36** · NO-PUBLISH · certified **0.28.1d** · art PARKED  
LIVE host pin remains Approve-only — this report is source-SHA, not a CDN remint.

## Checklist

1. Title subtitle shows `v0.36` — **yes** — `index.html` `#game-subtitle` is `v0.36`; `src/state.js` `VERSION = "0.36"`; `VERSION.md` first line `0.36`.
2. Commander create on New Run — **yes (source-static)** — `#commander-create` with callsign/seal/oath; PR210 lineage still on tip.
3. Crew-conflict attach sites present — **yes (source-static)** — `src/scenes-16.js` offers `pair_shield_cold` / `pair_grudge_settle` / `pair_favor_confront`; `faction_split` redirects in scenes-23/24; engine handles `pair_shield_cold` / `faction_split`.
4. Ending cinematic bookend ≠ outcome plate — **yes (source-static)** — `showCinematic("ending")` in `src/engine.js`; shared bookend `images/onboarding_background.jpg` per `docs/SUN_V036_ENDING_CINEMATIC_01.md`; `#ending-screen` separate from `#cinematic-screen`.
5. No invented physical-browser PASS. Remint 107–216 banned.

## Result

**GATE_PASS** @ `8fdc3cde2c2065f3272051345b38fa22c796d9a8` — paint 0.36 + commander + crew-conflict attach + ending corridor bookend present in source. Not certified. Not published.

IDLE_FOR_ORCH · SUN-V036-PLAYTEST-GATE-02 · GATE_PASS
