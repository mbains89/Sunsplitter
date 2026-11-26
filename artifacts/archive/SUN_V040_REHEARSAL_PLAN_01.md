# SUN-V040-REHEARSAL-PLAN-01

SOURCE main@8d23109b · RUNTIME a527e02bd1053c1928b460e85153184b996d66a1 · TASK SUN-V040-REHEARSAL-PLAN-01 · MODE proposal

AUTO-OPEN planning for 0.40 Launch Rehearsal (L-013). Not 1.0.
Does not rewrite `artifacts/ROADMAP.md` (full body preserved; LOCKS digest stays `48076076…`).
Does not mint 0.40. Does not certify. Does not invent OPEN implementation tickets.
Does not tag, Release, deploy, or remint PIN-02. Netlify HOLD.

## Authority already on tip

`artifacts/ROADMAP.md` §0.40: execute §13 rehearsal against one frozen identity.
Rehearsal prepares drafts and private evidence. It does not authorize publication.
1.0 stays a separate Manraj go/no-go.

Inputs already on this tip (do not remint): playtest response #285;
0.39 store-copy / disclosures / license / locks-digest PRs 280–284.

## Freeze-candidate checklist (paper only)

Later freeze, not this PR:
- exact governed-lane SHA to freeze
- player-facing paint remains `0.33`
- last certified remains `0.28.1d`
- `NO-PUBLISH / NOT_CERTIFIED`
- not `main` close-out; not 1.0 identity

## Verifier dry-run fields (paper only)

At the frozen SHA, later:
- `version-verify`
- `version-simulation-smoke`
- V1–V6 gates

Rerun on exact merged `main` only if close-out is separately authorized.
This PR does not run those gates and does not treat a green check as certify.

## Packaging / digest / tag drafts (paper only)

Draft fields for a later rehearsal ticket. Empty until freeze:
- private package identity
- artifact digest
- tag name draft
- Release title draft
- rollback note
- private-install path
- save-migration check
- content-descriptor set (from 0.39 disclosures)
- support contact field
- deployment dry-run host (not Netlify PIN-02)

No tag. No Release. No public host. No paying customers from this file.

Holds: PR 45/46, ART-R2 unless opened, main close-out, certification,
auto-Netlify, 0.40 mint, 1.0 launch.
