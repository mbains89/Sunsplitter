SOURCE main@8d23109 · RUNTIME 0215840 · TASK SUN-PLAYTEST-CREW-COUNT-FLEX-01 · MODE implementation

Build / launch node. Owner playtest follow-up (issue 148 / `SUN_PLAYTEST_RESPONSE_PLAN.md` item 5 count+flex slice). **NO-PUBLISH / NOT_CERTIFIED**. Last certified remains `0.28.1d`. Do not mint 0.36. Do not remint 107–149. Do not touch PR 45/46. Do not reopen L-025–L-028. Full-screen crew character sheet is **not** this ticket.

## Root cause

HUD Crew showed `state.survivors` (starts at 9: eight companions plus Rourke). The crew panel hides unrecovered Tomas / Jiro / Vess, so wake paints six names. The mechanical survivors resource is unchanged and still used for costs, saves, and endings.

## Bounded change

- Crew HUD number and status announcement use `visibleLivingCrewCount()`: living names currently painted on the panel.
- Name chips `flex: 1 1` so they stretch when few and shrink/wrap when more; phone width uses a three-across flex basis. 48px touch floor kept.
- No new meter, state key, scene field, crew, or character sheet.

## Named-path proof (wake)

Visible living names: Lena, Elias, Mira, Amara, Sela, Rourke. HUD Crew = 6. `state.survivors` remains 9. After Rourke's death, living names = 5 and the HUD follows. Recovering Vess raises the HUD without writing the survivors resource.

## Verifier

`VERIFY_HEAD_REF=ticket/0.30.1-playtest-crew-count-flex-01 node scripts/verify.mjs`
