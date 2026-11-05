# PX-4 Commander Rendered-Path Audit

`SOURCE main@8d23109 · RUNTIME 7ec5b30 · TASK SUN-V033-PX4-COMMANDER-PATH-01 · MODE verification`

- Acting role: Build / GPT-Codex
- Files read: `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, the 58 runtime scripts loaded by `scripts/verify.mjs`, and all referenced candidate Commander plates listed below
- Implementation authorized: yes, bounded to L-025 faceless-Commander enforcement; ART-R2 remains held

## Method

The audit combined source-wide static checks with runtime rendering. Every one of the 222 registered scenes was rendered under four deliberately different state profiles: fresh, recovered crew, high-affinity/romanced, and depleted/all-dead. The resulting 888 scene/profile paths covered rendered scene text, rendered choice labels, and resolved scene images. Static checks across all 58 runtime scripts close gaps where a branch may not be reachable under those four profiles.

Every runtime-referenced or plausible sibling plate that could depict the Commander was also inspected visually. Approved faceless representations were SHA-256 pinned in the verifier; known face-revealing romance plates were placed on a runtime denylist.

## Confirmed finding and repair

The only live L-025 violation was `images/romance_lena_1.jpg`. Both `romance_lena_1` and `romance_lena_sex` resolved to that plate, which visibly assigns the faceless player-shaped Commander a male face and body. Both scene paths now use the existing solo-Lena plate `images/shower_lena.jpg`, leaving the Commander absent from the image.

No art bytes were added, regenerated, removed, or changed. The four sibling face-revealing romance plates remain unwired. ART-R2 remains held.

## Plate disposition

| Plate | SHA-256 | Audit disposition |
|---|---|---|
| `images/romance_lena_1.jpg` | `39697e63417eb273581c317cc9acf9a84297ea98565a83f0c246e325dadea603` | FACE-REVEALING; was live; now unwired; do not wire |
| `images/romance_mira_1.jpg` | `abd84d4e4e32ca22692e718f4b41cc366743eb0dbe05bae731b1df7134057024` | FACE-REVEALING; unwired; do not wire |
| `images/romance_amara_1.jpg` | `75ef96ae4d943f20eaf28b65a97f34404b99238e1f1eba80aafe206d24242f42` | FACE-REVEALING; unwired; do not wire |
| `images/romance_sela_1.jpg` | `88388baa0c69235598e50973b8319aa18c80b61ed9fb828e6facfc92f597b050` | FACE-REVEALING; unwired; do not wire |
| `images/romance_vess_1.jpg` | `7dcfa7c0e72d54f9dfa1cc91fb85f30d16e743db40d6d80cbfcdcd89b94e1d3c` | FACE-REVEALING; unwired; do not wire |
| `images/self_risk.jpg` | `427fb4c5a72239451d213dcf7d6e80bef15da646a4b5e6000ddb54ffeb9de8a7` | APPROVED; Commander shown from behind |
| `images/lead_prompt.jpg` | `63dc3d2eff8c14eae2ea0cd8d68c9a973a55489debdd90d73cfd19813c2a3744` | APPROVED; Commander is a back-facing dark foreground silhouette |
| `images/final_choice.jpg` | `685c3c21c05c660aa43ac252329bbe7c145d9afa5182ae79d76393487954a547` | APPROVED; Commander shown from behind |
| `images/shower_lena.jpg` | `cd0981c0d0e8b31f589658a77591aa73996547707567016d0f6a2a4f119cd097` | APPROVED; solo Lena, Commander absent |

## Text and reproductive-role result

No current rendered or static runtime text assigns the Commander a gender, gendered possessive, sex-specific body, or gestational role. The pregnancy scene remains role-neutral: it begins from whether the Commander has been with anyone, describes a living pregnancy without assigning who carries it, and preserves all four choices.

The verifier also retains regressions for the five earlier L-025 text defects in the Amara afterglow, Lena promise, Tomas manifest, Tomas declined-romance, and debt-notice paths.

## Verification boundary

The four-profile render matrix is broad but is not a proof over every possible state permutation. The source-wide denylist and language scan supplement it so that currently unreachable branches are still audited. Any future runtime reference to a known face-revealing plate, or any byte drift in the approved Commander-safe plates, fails verification.

Unresolved lock: L-004 / ART-R2 remains held and was not wired by this ticket.

Next action: Manraj reviews the ticket PR and, if accepted, merge-commits it in the browser.
