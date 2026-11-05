# SUN-V037-EXTERNAL-REVIEW-PLAN-01

SOURCE main@8d23109b · RUNTIME 02280d92de839954b2252f7491604ce724aedd65 · TASK SUN-V037-EXTERNAL-REVIEW-PLAN-01 · MODE proposal

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Plan only. Does not mint or certify 0.36 or 0.37. Does not invent OPEN 0.38. Does not deploy, pin Netlify, or close out to `main`. Last certified remains `0.28.1d`.

Authority: owner pick 0.37 · entry after tip-named 0.36 pack closed (PR **#367** widescreen revalidate + PR **#368** pack-close) · ROADMAP §0.37 External Review Pilot / L-010.

## Frozen private candidate

| Field | Value |
|---|---|
| Lane | `version/0.30.1-main-reconcile-ci.1` |
| Candidate SHA | `02280d92de839954b2252f7491604ce724aedd65` |
| Meaning | Live write-lane HEAD at plan freeze (merge of PR **#368**). Pre-PR cite for this plan ticket. Not this plan PR's own merge SHA. |
| `main` | `8d23109b63b844e0703fb36643f14b91b8800c90` — SHIPPED observation only |
| Paint | `VERSION.md` first line `0.36` (**PAINT**, not OPEN / not certified) |
| Host | Owner-only. This plan does not remint PIN-02 or fire Netlify. |

Reviewers play **this SHA** (or an owner-named later freeze). Do not hand a moving tip. If the lane moves, freeze a new SHA in a new ticket — do not silently retarget this identity.

## Reviewers

Exactly two strangers.

| Seat | Requirement |
|---|---|
| R1 mobile-primary | Phone or phone-width browser. Has never played Sunsplitter. Has not seen code, internal reports, or earlier builds. |
| R2 desktop | Desktop viewport (PR85 plate-beside-prose is in scope as composition, not as a second game). Same independence rule. |

Both record device, OS, browser + version, viewport, and the candidate SHA before the first tap.

Out: staff, prior playtesters, anyone who read a STATUS/QUEUE/FEED, anyone who saw a Chief/Art plate session.

## Protocol

### A. Start-to-end

Each reviewer plays one full start-to-end run on their seat without coaching.

Cover, as they naturally reach them: first-run clarity, save/resume, choice legibility, art/text composition, resource honesty, death continuity, ending specificity, adult-content notice, replay desire.

Do not force every romance / ideology branch. One honest run each is the pilot. Extra routes are notes, not a completion checklist.

### B. Explicit probes (required, both seats)

After or during the run, each reviewer (or the desk running the session) must attempt these five probes on the **same frozen SHA**:

| Probe | Fail if |
|---|---|
| Dead speech | A dead or unrecovered character speaks, appears as living counsel, votes, or contributes an effect |
| Unpaid cost | A spent resource / hull / cohesion / supply / reaction-mass cost is described but the number does not move, or the HUD lies |
| Save loss | Save then kill the tab / refresh / Continue — slot missing, wrong scene, or silently reset |
| Softlock | No affordable exit; choices all dead; sheet/panel trap with no Back |
| False ending | Ending / What remains cites a fact that did not happen this run, or a counterfactual |

### C. Ranked report

One report covering both seats. Separate **correctness** from **experience**. Recommendations are not locks.

```
SUN-V037-EXTERNAL-REVIEW finding
CANDIDATE: 02280d92de839954b2252f7491604ce724aedd65
SEAT: R1-mobile | R2-desktop
DEVICE / OS / BROWSER / VIEWPORT:
SCENE or UI:
SEVERITY: P0 | P1 | P2
CLASS: correctness | experience
PROBE (if any): dead-speech | unpaid-cost | save-loss | softlock | false-ending | none
REPRO:
1.
2.
EVIDENCE: (note / screenshot id — no new JPEG in this repo from the reviewer)
EXPECTED:
ACTUAL:
```

Severity:

| Rank | Meaning | Exit |
|---|---|---|
| P0 | Correctness / save loss / softlock / false ending | Must close and **retest** on the frozen SHA after the repair |
| P1 | First-run trust or save-integrity harm; owner ranks or defers with a named later version | Blocks 1.0 if first-run-trust or save-integrity unless owner-deferred |
| P2 | Polish | Cannot be silently inflated into a new system |

### D. Retest-after-repair

- No repair ships inside the reviewer's live session.
- Owner ranks findings. Repairs are **one-concern PRs** into the version lane. Do not invent a mid-version for the pile.
- Retest a P0 only after that PR is merge-committed. Retest on the **repair SHA**, recorded next to the original candidate SHA.
- A finding is not closed because the author disagrees. Closed = retested pass or owner-deferred with a named later version.
- Do not start a 0.38 cohort from this plan. ROADMAP may feed 0.38 later. This ticket does **not** invent OPEN 0.38.

## Out of this plan

- Electron / Tauri / gamepad / cloud saves / PC-only story
- ART-R2 binary regen; Bot JPEG gen
- PR 45 / draft PR 46
- Certify, tag, Release, main close-out, public page, paying customers
- Netlify tip-ahead / PIN-02 remint
- Opening 0.38 product work

## Exit (pilot, not certification)

Both reviewers finished **or** their blockers are ranked. P0 closed and retested. First-run-trust and save-integrity P1s closed or owner-deferred with a named later version. Green CI on a repair is not CERTIFIED and is not 1.0.
