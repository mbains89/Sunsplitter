# SUN-V036-PLAYTEST-GATE-01

Post-pin honesty checklist (report-only). Seat `$ S2`. No browser runtime. No art wire. No Netlify.

LIVE SHA: `8d2f001d5a825f92aebec17a4c629243142d79b3`  
Lane: `version/0.30.1-main-reconcile-ci.1`  
Authority: PREP-FEED after PR210 MERGED · paint 0.36 · NO-PUBLISH · certified 0.28.1d · art PARKED

## Checklist

1. Title subtitle shows `v0.36` — **yes** — `index.html` `#game-subtitle` text is `v0.36`.
2. VERSION.md first line `0.36`; NO-PUBLISH / NOT_CERTIFIED; certified 0.28.1d — **yes** — `VERSION.md` first line `0.36`; following lines name NO-PUBLISH / NOT_CERTIFIED and last certified `0.28.1d`. `src/state.js` `const VERSION = "0.36"`. Lock line `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`.
3. New Run commander callsign / seal / oath path reachable — **yes (source-static)** — `#commander-create` markup with `#commander-callsign`, `name="commander-seal"`, `#commander-oath`. `commitNewRun()` calls `showCommanderCreate()`; `confirmNewRun()` → `commitNewRun()`; `confirmCommanderCreate()` → `commitNewRunWithCommander()`. PR210 merge is this LIVE SHA.
4. No invented physical-browser PASS. This is source-static at the named SHA.

## Result

**GATE_PASS** @ `8d2f001` — title `v0.36` + VERSION `0.36` + commander create reachable on New Run. Not certified. Not published.

IDLE_FOR_ORCH · SUN-V036-PLAYTEST-GATE-01 · GATE_PASS
