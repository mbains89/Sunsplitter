# PX-5 Command Authority and Sexual Power Audit

`SOURCE main@8d23109 · RUNTIME 648a025 · TASK SUN-V033-PX5-COMMAND-AUTHORITY-01 · MODE verification`

- Acting role: Build / GPT-Codex
- Implementation authorized: yes, bounded to the dispatched PX-5 audit and one GitHub PR; this record makes no gameplay correction or product ruling
- Authority read: `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, `artifacts/CHARACTER_BIBLE.md`, `artifacts/VOICE_CARDS.md`
- Runtime inspected: all 222 registered scenes, with focused review of `src/state.js`, `src/engine.js`, `src/validate.js`, `src/scenes-03.js`, `src/scenes-04.js`, `src/scenes-16.js` through `src/scenes-18.js`, `src/scenes-24.js`, `src/scenes-25.js`, `src/scenes-27.js`, and `src/scenes-29.js` through `src/scenes-37.js`, `src/scenes-48.js` through `src/scenes-52.js`

## Audit standard

ROADMAP PX-5 requires every romance route to be examined for rank, scarcity, consent, initiation, refusal, aftermath, and operational dependency. ROADMAP §2 also locks these constraints:

- eligible, living, non-declined romance partners initiate;
- the player must be able to reject explicitly;
- acceptance creates relationship debt and scarce private attention through existing state;
- Sela's adult high-trust boundaries stay legible;
- Vess keeps retained power and a different currency;
- no new consent meter, morality bar, exclusivity system, or relationship dashboard is introduced.

The review used static source inspection, runtime rendering, choice/state probes, zero-resource affordability checks, and two independent read-only reviews. Findings are separated into confirmed correction-level defects, owner-disposition questions, and compliant controls. A source-confirmed coupling is not automatically labeled a defect when it may be protected by the locked scarcity/debt design.

## Per-route findings

| Route family | Rank, consent, refusal, and aftermath | Operational dependency | Disposition |
|---|---|---|---|
| Lena | Both the early dying-clock route and standard first offer provide sex, nonsexual presence, and explicit rejection. Refusal closes the offer. First intimacy writes `romance.lena`, affinity/trust, `dying_held`, and memory. | `pursuit_lena` makes authorizing the last uncontaminated regenerative and staying for sex the same choice. Refusal remains free and exits to `debt_notice`. | First offer **PASS**. Later regenerative/sex exchange is **PX5-D01: OWNER DISPOSITION REQUIRED**. |
| Mira | First offer provides sex, nonsexual presence, and rejection. The explicit rejection applies `affinity.mira -2` and `trust.mira -4`. `pursuit_mira` says Mira stands between the Commander and the only exit. | Second intimacy is coupled to public or partial disclosure of retained intimate audio and vault talk. Refusal remains free and exits. Later lethal engineering text correctly states that private history is not a veto. | **PX5-F01 CONFIRMED:** mechanical penalty on explicit first rejection. **PX5-F02 CONFIRMED:** blocked-exit prose. Disclosure/sex exchange is **PX5-D02: OWNER DISPOSITION REQUIRED**. |
| Amara | First offer explicitly says work continues if the answer is no. Sex, nonsexual company, and rejection are available; refusals are non-penalizing. Acceptance and aftermath make favoritism public. | `pursuit_amara` couples sex to delaying a contaminated grow-deck vent and moving clean-air margin. The cost is public and refusal is free. | First offer **PASS**. Vent-delay/sex exchange is **PX5-D03: OWNER DISPOSITION REQUIRED**. |
| Sela | First offer explicitly establishes adulthood and boundaries, with sex, ritual-only presence, and rejection. The second approach names the no-command-privilege vault vow. | The second route says the vow must be logged and that Sela refuses a private exception, but a private-vow negotiation still reaches sex. A later `offshift_sela` romantic question uses `romanceOpen`; choosing “Stay past the yellow” writes no romance, decline, debt, or memory state. | First offer **PASS**. Private-vow downgrade is **PX5-D04: OWNER DISPOSITION REQUIRED**. Write-free late acceptance is **PX5-D05: OWNER DISPOSITION REQUIRED**. |
| Vess | `vess_offer` is partner-initiated, explicitly permits refusal, and says power stays with her. `vess_intimate` keeps door, pace, and ending on her terms. | Accepting the offer enters `vess_transmission` and immediately writes `romance.vess=true` before the last-transmission decision. Keeping the window exits with no intimacy but leaves romance true. The transmission is Vess's locked different currency. | Initial offer and retained-power prose **PASS**. Pre-choice romance write and resource/sex sequencing are **PX5-D06: OWNER DISPOSITION REQUIRED**, not silently classified against the Vess lock. |
| Amara and Tomas | The group route says an invitation exists “or at least no refusal”; Tomas never affirmatively invites the Commander. Joining writes `romance.amara_tomas`, affinity, and memory. Leaving their privacy is a safe positive exit. | The route appears only with full hydroponics, remains offered after Amara's solo `declined` mark, creates no `relationshipDebtors()` entry, and produces no What Remains relationship fact, although `reckon_summary` records it. | **PX5-F03 CONFIRMED:** absence of refusal is treated as invitation. Prior-mark gating, hydro coupling, and debt/reflection scope are **PX5-D07: OWNER DISPOSITION REQUIRED**. |
| Shared route framing | `intimacy_window` has no numeric affinity/trust gate and all living open partners have an exit. `pursuit_window` says a first-time bond remains “if you insist” and labels the route “Use the last private window on someone new,” despite the locked partner-initiates rule. | At zero integrity, cohesion, supplies, and embryos, every resource-bearing pursuit acceptance disables while each zero-cost refusal remains enabled. | **PX5-F04 CONFIRMED:** first-offer wrapper is framed as Commander insistence/use. Zero-resource refusal availability **PASS**. |
| Post-consent and late operations | Shower/rear follow-ups are one-shot, require a living current partner, write only completion flags, and preserve exits. `debt_notice`, `reckon_summary`, and operational Mira text surface public cost and private-history limits. | `relationshipDebtors()` uses existing affinity and romance state; no new relationship system is needed. | **PASS**, subject to PX5-D07 for the group route's omission. |

## Confirmed correction candidates

These are findings, not dispatched ticket identities. Each should be corrected only through one separately named, one-concern ticket.

| Finding | Exact current evidence | Narrow correction boundary |
|---|---|---|
| PX5-F01 | `bond_mira` rejection writes `affinity.mira -2` and `trust.mira -4` while the other first-offer refusals are neutral or positive. | Preserve explicit rejection and durable decline without a mechanical sex-refusal penalty; no new state or UI. |
| PX5-F02 | `pursuit_mira` places Mira “between you and the only exit” during a sexual proposition. | Reframe her position beside a clear exit while preserving her disclosure demand and agency. |
| PX5-F03 | `romance_amara_tomas` says there is “an invitation in it, or at least no refusal.” | Require affirmative, separate consent from both Amara and Tomas before the join choice; preserve the privacy exit. |
| PX5-F04 | `pursuit_window` uses “if you insist” and “Use the last private window on someone new.” | Reframe the wrapper as answering an existing partner-initiated offer; no route, state, or content-volume change. |

## Owner-disposition questions

PX5-D01 through PX5-D07 are source-confirmed facts, but the current locks do not determine whether each coupling is prohibited or is intentional relationship debt/scarcity. Manraj must rule; Grok must record the ruling before Build changes runtime behavior.

1. **PX5-D01 — Lena:** may the last regenerative allocation and second intimacy remain one transaction?
2. **PX5-D02 — Mira:** may disclosure of retained intimate audio and second intimacy remain one transaction?
3. **PX5-D03 — Amara:** may a contaminated-vent delay and second intimacy remain one transaction?
4. **PX5-D04 — Sela:** may the Commander negotiate her stated logged public vow down to a private vow and still continue?
5. **PX5-D05 — Sela:** is “Stay past the yellow” romantic acceptance, nonsexual presence, or only texture? Its state write must match the ruling.
6. **PX5-D06 — Vess:** does accepting “the attempt” create the relationship before the last-transmission choice even when no intimate hour occurs, or must romance state wait for a later explicit acceptance?
7. **PX5-D07 — Amara/Tomas:** must prior Amara refusal/held-only state close the group offer; is full hydroponics an intentional eligibility gate; and must the group relationship feed existing debt and What Remains selectors?

## Runtime probe evidence

- Exact runtime: `648a0256f4abfc22ff2e8493a3ce50d14a16b7c9`.
- Registered surface: 222 scenes across 58 runtime scripts.
- Mira first refusal: `affinity -2`, `trust -4`, `mark.mira=declined`.
- Amara/Tomas offer after `mark("amara", "declined")`: still present.
- Vess after accepting the offer but before spending the transmission: `romance.vess=true`, `vess_intimate=false`.
- Vess after keeping the transmission window: romance remains true, intimacy remains false.
- Sela after “Stay past the yellow”: no romance value, mark, or memory is written.
- Amara/Tomas after joining: group romance is true, `relationshipDebtors()` is empty, What Remains relational fact is null, and `reckon_summary` does record the relationship.
- At zero public resources, all four pursuit families preserve an enabled zero-cost refusal to `debt_notice`.

## Verification boundary

- `node scripts/verify.mjs` loads and executes all runtime scripts, validates all 222 scenes, passes the existing romance gates, Commander-path gate, Vess replay guards, three policy simulations, and all ticket-relevant checks. Its overall result remains red only on the inherited main identity/authority posture (`base=8d23109`, expected `src=992f7c5`), reproduced on the untouched `648a025` lane.
- No gameplay, art, state, schema, version, lock, status, or release bytes are changed by this audit.
- L-002 and L-007 control the product rules and PX sequence. L-004 / ART-R2 remains held and unwired. L-025 remains locked and was not reopened.
- PR 45 and PR 46 remain held. `NO-PUBLISH / NOT_CERTIFIED` remains controlling.

Next action: Grok/program office records owner dispositions for PX5-D01 through PX5-D07 and dispatches exactly one confirmed PX-5 correction ticket; Build does not bundle or pre-implement those corrections.
