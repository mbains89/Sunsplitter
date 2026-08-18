# GitHub Push Rules — Retired

**Status:** SUPERSEDED by [`/AGENTS.md`](../AGENTS.md) and [`ROADMAP.md` §6](ROADMAP.md).  
**Effective:** authority-bootstrap merge.

Do not use the former workflow from this path. It depended on direct/per-file API writes, one-file commits, ZIP-as-source reconstruction, marker-string verification, and branch labels as evidence. Those practices are retired.

The authority bootstrap itself is the roadmap's single documentation-only exception. After it merges, repository changes use:

1. `version/<semver>` from the exact approved predecessor;
2. one-concern ticket branches and PRs into that version branch;
3. merge commits for ticket PRs;
4. one consolidated version close-out PR to `main`;
5. exact-commit validation and release evidence defined by the roadmap.

The full chain-of-custody implementation, branch protection, required checks, release manifest, and deployment verification land in 0.28.3. Until then, follow `/AGENTS.md`, the active roadmap milestone, and the compact current status. This tombstone exists so old links fail visibly instead of silently teaching the retired process.
