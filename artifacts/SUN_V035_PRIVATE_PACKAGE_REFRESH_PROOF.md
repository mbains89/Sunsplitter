SOURCE main@8d23109 · RUNTIME a91a26d · TASK SUN-V035-PRIVATE-PACKAGE-REFRESH-01 · MODE implementation

Build / launch node, sole isolated writer. Owner-authorized refresh of the
deterministic private package to the exact current version-lane SHA after
PR 142 ART-R2 playtest close. This is not a remint of PR 110 identity and
not a failure retry. **NO-PUBLISH / NOT_CERTIFIED**; last certified remains
0.28.1d. Do not mint 0.36.

## Authority

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact write-lane HEAD packaged: `a91a26d47ac76a976ca4406caf9b04511c11ba82`
  (owner merge of PR 142 ART-R2 playtest close).
- Source tree: `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895`.
- AGENTS, ROADMAP, PROJECT_STATUS, LOCKS read from GitHub `main@8d23109`
  in this session. Lane ROADMAP §4 / §0.35 authorize a private package
  refresh after ART drain. Lane STATUS is newer than the stale main copy;
  no authority file was rewritten.

## Canonical ZIP method

Documented and enforced by `scripts/build-private-package.mjs`:

- Source bytes: Git blobs from the exact commit above; dirty and untracked
  working-tree files are ignored.
- Paths: UTF-8 bytewise ascending order at the archive root, preserving
  tracked runtime paths.
- ZIP entries: STORE (no compression); timestamp fixed to
  1980-01-01 00:00:00; mode normalized to 100644; no directory entries,
  extras, comments, or platform timestamps.
- Integrity: CRC-32 per ZIP entry, SHA-256 per payload file, and an
  external SHA-256 sidecar for the completed archive.

Two independent builds of `a91a26d` produced byte-identical archives.
No non-reproducibility factors were observed under this method.

## Exact package proof

| Field | Value |
|---|---|
| Source commit | `a91a26d47ac76a976ca4406caf9b04511c11ba82` |
| Source tree | `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895` |
| Archive SHA-256 | `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58` |
| Archive bytes | 29,596,520 |
| Archive entries | 160 (152 exact runtime files plus 8 generated evidence files) |
| Runtime path-list SHA-256 | `5900313bf0dd17700edb159733bb0521a85ff077d596476274a5c6435654ab11` |
| Prior pin (PR 113 drafts) | `e3b7472c7c8e740078155c0a7489fc4031cdfb3b` / `0ca55bf7d7bc3558ddec03f4a7ad5d2e05c0cff3abcba926afb819c58af3acd2` |

Generated ZIPs remain outside the repository. The verifier rebuilds the
archive twice from the pinned source SHA and requires byte equality.

## Inventory (existing in-tree files only)

This ticket added no fonts, licenses, or assets. The inventory is generated
from tracked blobs at `a91a26d` only.

| Kind | Count |
|---|---:|
| Tracked font binaries | 0 |
| Tracked LICENSE / LICENCE / COPYING / NOTICE files | 0 |
| External font stylesheet requests in tracked CSS | 1 |
| Tracked assets inventoried | 169 |
| Assets included by static runtime reference | 91 |
| Duplicate-byte asset pairs recorded | 3 |

External stylesheet observed in `css/style.css`:

`https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap`

Rights posture remains `NOT_EVIDENCED_IN_REPOSITORY` /
`PROJECT_LOCK_NOT_RIGHTS_EVIDENCE`. Inventory is not a clearance claim.

Runtime-closure delta versus the prior `e3b7472` pin (already landed on
the lane; not created by this ticket):

- Added: `images/corridor_variant_2.jpg`,
  `images/observation_bridge_alt_2.jpg`, `images/vess.jpg`,
  `images/work_elias.jpg`
- Removed from package: `images/shower_amara.jpg` (unwired leftover;
  file remains tracked and inventoried)

## Files

- `scripts/verify.mjs` — pin exact-source SHA, tree, archive digest,
  runtime-path digest, and summary counts to `a91a26d`.
- `scripts/verify-private-phone.mjs` — default phone-verifier source
  follows the same pin.
- this proof.

No `src/**`, `css/**`, `images/**`, `index.html`, STATUS, ROADMAP, or
LOCKS edits. Builder method unchanged.

## Boundaries

No public package, itch.io, Steam, price, payment, certification, tag,
Netlify, PIN-02 remint, main close-out, or 0.36 claim. No remint of
PRs 107–142. L-045 / L-046 untouched. ART-R2 campaign not reopened.

Next action: required version-lane checks, then merge-commit this one PR.
Not squash.
