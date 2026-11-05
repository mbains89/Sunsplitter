# SUN-RECKON-TRUTH-LINE-PASS-01 — confirm-and-report (ALREADY_SATISFIED / STOP)

SOURCE `main@8d23109b` · RUNTIME `daf19f8b3e0558b915addc5ba3aff4bb09af1c18` · MODE docs
Lane: `version/0.30.1-main-reconcile-ci.1`
Owner OPEN as `Sticket: UN-RECKON-TRUTH-LINE-PASS-01` (parsed `SUN-RECKON-TRUTH-LINE-PASS-01`).

No `src` change. No JPEG. No 0.36 mint. No Netlify. No certify.
Does not remint `SUN-STILL-BURNING-CORRIDOR-01` / PR **#345**.
Does not remint `SUN-CASCADE-ALLUSIVE-PAYOFF-01` / PR **#351**.
Does not remint `SUN-CASCADE-SECOND-FLAG-PAYOFF-01` / PR **#353** (already merged; pays `flags.manifest` on `reckon_public`, not this host).
Does not remint `SUN-VAULT-FACE-LINE-PASS-01` / PR **#354**.

## Verdict

**ALREADY_SATISFIED.** Live `reckon_truth` player-facing lines already match the locked corridor contract. This ticket is a line-pass confirm, not a prose rewrite.

If the owner wanted a *new* spoken payoff on this host (second flag, reserved Tomas phrase, or a taste rewrite), that is a **new** ticket id with named line + existing flag/values + speaker. Do not reuse this id.

## Reachability at `daf19f8b` (reconfirmed; same getter as `be12f732`)

| Step | File | Fact |
|---|---|---|
| Offer | `src/scenes-25.js` `faction_split` | Fifth choice: "Tell them the truth you have been carrying — planet, odds, and what remains." `next: reckon_summary`, `flag: { reckon: "truth" }`, `lean: { living: 1 }`, `effects: { cohesion: 1 }` |
| Router | `src/scenes-27.js` `reckon_summary` | `state.flags.reckon === "truth"` → `reckon_truth` |
| Host | `src/scenes-26.js` `reckon_truth` | Text getter + two choices, both `next: sun_payoff` |

`reckon_truth` is reachable. It is not a dead scene.

## Live lines at `daf19f8b` (`src/scenes-26.js`)

Frame (always):

> You tell them the truth you have been carrying.

`state.flags.course_briefed` truthy (PX6-F02 / Still Burning pay):

> The rogue planet may have water under the ice. It may have nothing. The verified corridor is day 181 through day 184, one pass. That is still a long time for a damaged ship and a small group of people who have already begun to break.

`course_briefed` false or absent (months line kept):

> The rogue planet may have water under the ice. It may have nothing. Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.

Close (always):

> You ask what they still want from the time that remains.
>
> The answers are not unified. Some want the planet. Some want speed. Some want comfort. Some want a final transmission aimed at nothing in particular.
>
> You listen. Then you decide.

Choices:

- "You have heard enough. Make the final order." → `sun_payoff`
- "Ask one more person what they still want. Then decide." → `sun_payoff`, `cohesion +2`, `supplies -1`

No `onEnter`. No flag writes from this scene. Scene comment: `SUN-STILL-BURNING-CORRIDOR-01 / PX6-F02: pay course_briefed; keep months line otherwise.`

Adjacent, not rewritten here: the same file wraps `buildStillBurningText` so ending `final === "hold"` + `course_briefed` replaces "Fourteen months. No guarantee." with "Verified corridor: day 181 through day 184. One pass."

## Checks

| Check | Result |
|---|---|
| `course_briefed` true → day 181–184, one pass | PASS at `daf19f8b` |
| `course_briefed` false/absent → Fourteen months line kept | PASS |
| Fourteen months is transit duration, not embryo count | PASS — no embryo digits in this scene |
| Spoken embryo lock 140,006 not disturbed | PASS — not on these lines |
| Boarding berths 214 not disturbed | PASS — not on these lines |
| Tomas reserved "People were tier four." | Unspent. Not on these lines. |
| `elias_question` | COLD. Not touched. |
| `flags.changeorders` | Not paid here. Paid on `faction_split` (#311) and `reckon_summary` (#351). |
| `flags.manifest` | Not paid here. Paid on `faction_split` (#339) and `reckon_public` (#353). |
| Image map `reckon_truth` | `images/observation_reckon.jpg` in live `state.js`. Unchanged. |
| PR #345 contract ("already met; leave unchanged") | Still true. Do not remint. |

## Out of scope

- Aesthetic rewrite of the wants-list or "You listen. Then you decide."
- Spending the reserved Tomas phrase
- A third cascade write (`SUN-MIDGAME-THIRD-CONSEQUENCE-01`)
- STATUS / TICKET_QUEUE tip-honesty (lane files still cite `c3626434`; separate stale pointer)
- Trailer / Netlify / 0.36 / certify / main close-out
- Merge or rebase of leftover Copilot PRs #304 / #297

## Owner fork (not this id)

| Shape | Meaning |
|---|---|
| **A — this ticket** | Confirm corridor line. **DONE / STOP.** |
| **B — new id** | Name one additional existing flag + values + spoken sentence + speaker for `reckon_truth`. |
