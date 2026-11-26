SOURCE main@8d23109 · RUNTIME e630401 · TASK SUN-V035-PLAYTEST-CLOSED-LEDGER-01 · MODE implementation

Build / launch node, sole isolated writer. Owner-authorized docs-only
closed playtest findings ledger after PR 146 merge-committed at
`e630401cb2719877db99d84396363808354c88ec`. One PR into
`version/0.30.1-main-reconcile-ci.1`. **NO-PUBLISH / NOT_CERTIFIED**.
Last certified remains `0.28.1d`. Do not mint 0.36. Do not remint
PRs 107–146.

This file classifies PLAYTEST_SUN findings so later agents do not reopen
the same defects as new ticket identities. It does not certify, deploy,
Netlify-pin, or close a sequential gate. Hosted v0.33 / pin `a91a26d` is
owner playtesting evidence, not this HEAD and not PIN-02 remint authority.

## Authority

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Write-lane HEAD / predecessor: `e630401cb2719877db99d84396363808354c88ec`
  (owner merge of PR 146 `SUN-V035-STATUS-DOCS-01`).
- Governed branch: `version/0.30.1-main-reconcile-ci.1`.
- AGENTS, ROADMAP, PROJECT_STATUS, LOCKS read from GitHub `main@8d23109`
  in this session. Lane STATUS at the predecessor is newer than the stale
  main copy. This ticket does not rewrite STATUS, ROADMAP, LOCKS, or rulesets.
- Source report `PLAYTEST_SUN.md` is owner-local
  (`/Users/manra/.codex/loops-play-sun/PLAYTEST_SUN.md`) and is not in this
  repository. Rows below cite only IDs named by landed tickets, STATUS, or
  this /goal. Unnamed IDs get a hold reason. No new defect is invented.

Hunch, labeled as hunch and not acted on as a mapping: SUN-PLAY-007 / 009
might alias findings 4 / 6. Those findings are already LANDED under their
finding numbers. The matching SUN-PLAY rows stay independently held so this
ledger does not mint a second ticket from an unverified alias.

## Vocabulary

| Disposition | Meaning on this lane |
|---|---|
| **LANDED** | Merge-committed into `version/0.30.1-main-reconcile-ci.1`. Not SHIPPED. Not CERTIFIED. Do not remint. |
| **ALREADY_SATISFIED** | Reproduced or proven closed on the lane after a named predecessor. Do not mint a retry. |
| **PARKED** | Owner hold. Do not start work from this ledger. |
| **HELD** | Closed classification with a hold reason. Do not invent a defect ticket. |
| **BLOCKED** | Explicitly forbidden action. |

## PLAYTEST_SUN findings 1–6

| ID | Subject | Disposition | PR / proof | Do not remint |
|---|---|---|---|---|
| Finding 1 | Drive-repair capacitors vs burn label on `power_crisis` | **LANDED** | [PR 125](https://github.com/mbains89/Sunsplitter/pull/125) merge `bc1f021`. Proof: `artifacts/SUN_V035_CAPACITOR_PROOF.md`. | Yes |
| Finding 2 | Sela question with no visible answer before `arc_living_3` | **LANDED** | [PR 124](https://github.com/mbains89/Sunsplitter/pull/124) merge `cb48039`. Proof: `artifacts/SUN_V035_SELA_ANSWER_PROOF.md`. | Yes |
| Finding 3 | Closing recap omits current Vess / shared-encounter facts | **LANDED** | [PR 126](https://github.com/mbains89/Sunsplitter/pull/126) merge `3327b30`. Proof: `artifacts/SUN_V035_EPILOGUE_PROOF.md`. | Yes |
| Finding 4 | Lena pregnancy-check opening ignores recorded participation | **LANDED** | [PR 127](https://github.com/mbains89/Sunsplitter/pull/127) merge `07973c8`. Proof: `artifacts/SUN_V035_PREGNANCY_LENA_PROOF.md`. | Yes |
| Finding 5 / SUN-PLAY-008 | Glued `everyone.` paragraph join in `faction_split` | **LANDED** | [PR 128](https://github.com/mbains89/Sunsplitter/pull/128) merge `a542db4`. Proof: `artifacts/SUN_V035_JOIN_TYPO_PROOF.md`. | Yes |
| Finding 6 | Mira fallback still says “even without Jiro's full voice” | **LANDED** | [PR 131](https://github.com/mbains89/Sunsplitter/pull/131) merge `869f51f`. Proof: `artifacts/SUN_V035_JIRO_VOICE_PROOF.md`. | Yes |

## SUN-PLAY-007…014

| ID | Subject as proven in-repo | Disposition | PR / hold reason | Do not remint |
|---|---|---|---|---|
| SUN-PLAY-007 | Not named by any merged PR 107–146 | **HELD** | No landed ticket cites this ID. Do not invent a defect. Do not remint finding 4 / PR 127 on a hunch that the IDs alias. | Yes — no new ticket from this ID |
| SUN-PLAY-008 | Same as finding 5: `faction_split` join typo | **LANDED** | [PR 128](https://github.com/mbains89/Sunsplitter/pull/128) merge `a542db4`. | Yes |
| SUN-PLAY-009 | Not named by any merged PR 107–146 | **HELD** | No landed ticket cites this ID. Do not invent a defect. Do not remint finding 6 / PR 131 on a hunch that the IDs alias. | Yes — no new ticket from this ID |
| SUN-PLAY-010 | Not named by any merged PR 107–146 | **HELD** | No landed ticket cites this ID. Do not invent a defect or reopen PRs 107–146. | Yes — no new ticket from this ID |
| SUN-PLAY-011 | Not named by any merged PR 107–146 | **HELD** | No landed ticket cites this ID. Do not invent a defect or reopen PRs 107–146. | Yes — no new ticket from this ID |
| SUN-PLAY-012 | Private recap omits accepted / completed Vess | **LANDED** | [PR 129](https://github.com/mbains89/Sunsplitter/pull/129) merge `b133aaf`. Proof: `artifacts/SUN_V035_VESS_RECAP_PROOF.md`. | Yes |
| SUN-PLAY-013 | Final-orders labels claim a course that was never committed | **LANDED** | [PR 130](https://github.com/mbains89/Sunsplitter/pull/130) merge `d1e0cde`. Proof: `artifacts/SUN_V035_DESTINATION_PROOF.md`. | Yes |
| SUN-PLAY-014 | Not named by any merged PR 107–146 | **HELD** | No landed ticket cites this ID. Do not invent a defect or reopen PRs 107–146. | Yes — no new ticket from this ID |

## Art / event mismatches

Named PLAYTEST_SUN cluster (six scenes) is **ALREADY_SATISFIED** after the
ART-R2 one-scene retargets. Proof-only close: [PR 142](https://github.com/mbains89/Sunsplitter/pull/142)
merge `a91a26d`. Proof: `artifacts/SUN_V035_ART_R2_PLAYTEST_CLOSE_PROOF.md`.
This is not an ART-R2 campaign reopen.

| Scene | PLAYTEST contradiction | Living plate after cluster | Landing PRs |
|---|---|---|---|
| `romance_lena_1` | blister event on shower rinse | `images/observation_bridge_alt_2.jpg` | [133](https://github.com/mbains89/Sunsplitter/pull/133), closed by 142 |
| `romance_amara_1` | tray event on shower rinse | `images/hydroponics.jpg` | [135](https://github.com/mbains89/Sunsplitter/pull/135), closed by 142 |
| `romance_mira_1` | console event on shower rinse | `images/quiet_mira.jpg` | [138](https://github.com/mbains89/Sunsplitter/pull/138), closed by 142 |
| `act2_tether_hand_elias` | EVA tether on interior corridor wheel | `images/tether_ride.jpg` | [136](https://github.com/mbains89/Sunsplitter/pull/136), closed by 142 |
| `act3_lethal_elias_order` | Station B-four work on seated cup | `images/work_elias.jpg` | [137](https://github.com/mbains89/Sunsplitter/pull/137), closed by 142 |
| `act3_lethal_elias_sealant` | sealant cartridges on seated cup / standing portrait | `images/work_elias.jpg` | [141](https://github.com/mbains89/Sunsplitter/pull/141), closed by 142 |

ART-R2 **broad campaign** remains **HELD**. Landed one-scene retargets are not
a campaign reopen, regen, or identity audit.

Related earlier art tickets, not the named six-scene cluster, also **LANDED**
and must not be reminted: Off-Shift Vess portrait [PR 115](https://github.com/mbains89/Sunsplitter/pull/115);
act3 hub corridor repeat [PR 116](https://github.com/mbains89/Sunsplitter/pull/116);
26 confirmed event-art aliases [PR 121](https://github.com/mbains89/Sunsplitter/pull/121).

## Explicit holds (this ledger does not open them)

| Subject | Disposition | Reason |
|---|---|---|
| Amara-route | **PARKED** | Owner hold. No Amara-route work from this ticket. |
| PIN-02 / Netlify pin | **BLOCKED** | Owner playtesting pin remains `a91a26d`. This file does not remint PIN-02 and does not authorize a new Netlify pin. |
| ART-R2 broad campaign | **HELD** | ROADMAP / STATUS. Named one-scene retargets already landed; do not reopen the campaign. |
| 0.36 PC-readiness | **HELD** | Not opened. Do not mint 0.36 from this file. |
| PR 45 / draft PR 46 | **HELD** | Untouched. |
| L-025–L-028 | **unchanged** | Not reopened. `LOCKS.md` is not edited. |
| Q9 `LENA-CROSS-RECHECK` | **HELD** | Later ticket identity. Not this branch. Do not start it here. |
| Certification / publish / tag / deploy | **BLOCKED** | `NO-PUBLISH / NOT_CERTIFIED`. Last certified remains `0.28.1d`. |

## Phone-resume / SAVE-EXPORT / packaging (already proven)

| Concern | Disposition | Evidence |
|---|---|---|
| Phone-resume | **ALREADY_SATISFIED** | [PR 112](https://github.com/mbains89/Sunsplitter/pull/112) merge `e3b7472` is an ancestor of `e630401`. STATUS after PR 146 records this. Do not mint a retry. Owner physical play remains playtesting evidence, not certification. |
| SAVE-EXPORT | **ALREADY_SATISFIED** | [PR 88](https://github.com/mbains89/Sunsplitter/pull/88) merge `8f9d1c0` (`SUN-V032-EXPORT-IMPORT-01`) is an ancestor of this lane. Do not mint a retry. |
| Content notice | **LANDED** | Original [PR 111](https://github.com/mbains89/Sunsplitter/pull/111); revisit [PR 144](https://github.com/mbains89/Sunsplitter/pull/144) merge `3e3a6a6`. |
| Private package | **LANDED** | Original [PR 110](https://github.com/mbains89/Sunsplitter/pull/110); refresh [PR 143](https://github.com/mbains89/Sunsplitter/pull/143) merge `736add8` pins package source `a91a26d`. Not a remint of 107–142 as a new identity. |
| Private drafts | **LANDED** | Original [PR 113](https://github.com/mbains89/Sunsplitter/pull/113); refresh [PR 145](https://github.com/mbains89/Sunsplitter/pull/145) merge `a2bb4a2`. |

## Related landed 0.33 playtest tickets (do not remint)

These rows are not new SUN-PLAY IDs. They are already merge-committed on the
version lane. Listing them prevents remints. This PR does not reopen them.

| PR | Ticket | Lane meaning |
|---|---|---|
| 114 | `SUN-V035-PLAYTEST-SUPPLIES-01` | Finite new-run Supplies margin. |
| 117 | `SUN-V035-PLAYTEST-CREW-PANEL-01` | Crew HUD opens existing crew panel. |
| 118 | `SUN-V035-PLAYTEST-MIDGAME-VARIETY-01` | Bounded stores/coolant order variation. |
| 119 | `SUN-V035-PLAYTEST-CINEMATICS-01` | Skippable existing-art bookends. |
| 120 | `SUN-V035-PLAYTEST-MALE-CREW-01` | Existing Elias/Jiro personality follow-through. |
| 122 | `SUN-V035-PLAYTEST-CHOICE-AUDIT-01` | Tomas off-shift choices follow living holders. |
| 123 | `SUN-V035-LIVING-CAST-01` | Restored scenes guard absent cast. |
| 139 | `SUN-V035-PLAYTEST-REMAINS-LEAN-01` | WHAT REMAINS lean follows recorded-order weights. Pass 4 classified; **LANDED**, not a new SUN-PLAY ID in this file. |
| 140 | `SUN-V035-OPENING-BACKSTORY-01` | Opening reads in-tree prologue. Proof only. |

0.34 PRs 107–109 and original 0.35 PRs 110–113 remain drained on the lane as
recorded by PR 146. Do not remint 107–146.

## Files

- this ledger only.

No `src/**`, art bytes, STATUS, ROADMAP, LOCKS, workflows, Netlify, or
package edits. No new defect tickets.

## Limits and stop

This is a classification ledger, not a fresh playtest, not certification,
and not a hosted-byte claim. IDs that the owner-local report names but no
landed PR cites stay **HELD** so they cannot be reminted as open work.

Merge-commit this one PR into `version/0.30.1-main-reconcile-ci.1` after
required version-lane checks are green. Not squash. Not rebase.

**Stop.** Do not start Q9 `LENA-CROSS-RECHECK` on this branch.
