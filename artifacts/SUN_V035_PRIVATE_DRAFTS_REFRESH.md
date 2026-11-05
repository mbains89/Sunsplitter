SOURCE main@8d23109 · RUNTIME a91a26d · TASK SUN-V035-PRIVATE-DRAFTS-REFRESH-01 · MODE implementation

Build / launch node. Authorized docs-only refresh of the non-public
store, support, privacy, and adult-classification drafts onto the Q3
private-package identity. **NO-PUBLISH / NOT_CERTIFIED.** Last certified
remains 0.28.1d. No public page.

## Binding

These drafts describe the PR 143 private package only. They do not
describe write-lane HEAD after PR 144, do not remint that package, and
do not invent a new ZIP.

| Field | Value |
|---|---|
| Package source commit | `a91a26d47ac76a976ca4406caf9b04511c11ba82` |
| Package source tree | `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895` |
| Archive SHA-256 | `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58` |
| Archive bytes | 29,596,520 |
| Archive entries | 160 |
| Package version stamp | `0.33` |
| Prior draft pin (PR 113) | `e3b7472` / `0ca55bf7d7bc3558ddec03f4a7ad5d2e05c0cff3abcba926afb819c58af3acd2` |
| Write-lane HEAD at dispatch | `3e3a6a6484b115b191112cc506bf1678109d4585` (PR 144 merge) |
| Live host / PIN-02 | unchanged; not this ticket |

Hunch check: after PR 144 (`index.html` / `src/engine.js` content-notice
revisit), two independent rebuilds of source `a91a26d` still produced
archive SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`.
The drafts can cite that digest honestly. The builder and verifier pins
are not rewritten.

Generated ZIP sidecars already cite `SOURCE …@a91a26d…`. This refresh
adds the archive digest to readable repo drafts so the package SHA and
digest are both citable without changing ZIP bytes.

ZIP sidecar hashes at that digest (unchanged by this ticket):

| Sidecar | Bytes | SHA-256 |
|---|---:|---|
| `PRIVATE_STORE_DRAFT.md` | 2380 | `f5bee0b2272db0e6739eb30f65553c2a5d78988f80625938a34d1dfdeef46512` |
| `PRIVATE_SUPPORT_DRAFT.md` | 2558 | `38b092ff04d3f881e6219aeb0ada8ede542d609738cf61189efa1ca8573522f5` |
| `PRIVATE_PRIVACY_DRAFT.md` | 2912 | `7695d24723999f0f9e430f72603b68ca1c07917c5e514e4dd98b67fc26dc7131` |

## Posture

**Status:** DRAFT · NON-PUBLIC · PRIVATE TEST PACKAGE · NO-PUBLISH / NOT_CERTIFIED.
**Use:** NOT FOR PUBLICATION.
**Publication:** `NOT_AUTHORIZED`
**Storefront submission:** `NOT_SUBMITTED`
**Price:** none. `paymentStatus: NOT_OFFERED_IN_THIS_DRAFT`
**Certification:** `NOT_CERTIFIED`
**Public URL:** none
**Support / privacy contacts:** unset

These drafts are internal review copy. They are not a live listing,
submission, offer for sale, public page, or commercial claim.

## Store draft

PACKAGE SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`
SOURCE `mbains89/Sunsplitter@a91a26d47ac76a976ca4406caf9b04511c11ba82`
TREE `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895`
PACKAGE VERSION `0.33`

Internal review copy only. It is not a live listing, submission, offer
for sale, publication authorization, certification, or rights-clearance
statement.

**Title:** Sunsplitter

**Short description:** Command a damaged colonization ark after Earth's
sudden cascade. Decide what—and who—the last ship will carry forward.

**Long description:** Sunsplitter is a short, grim narrative-survival
browser game. You are the Commander of a damaged colonization ark built
for thousands; nine people cleared the hatch after Earth failed. The
Future and the Living both make demands. Resources gate choices, early
orders return later, named characters can die, and the ending reflects
the run you actually played. This exact private candidate runs in a
browser, includes a private phone-opening path, keeps saves locally,
and contains permanent adult sexual content alongside death, medical
trauma, grief, reproductive themes, and lethal command decisions. The
accompanying content notice gives the current source-grounded draft
descriptors.

**Feature bullets**

- Choice-driven narrative survival with persistent consequences.
- Local save and Continue in the same browser.
- Private phone-opening instructions; later PC-readiness claims are not made here.
- Adult content is permanent; there is no reduced-content mode.

**Required companions inside the private ZIP:**
`PRIVATE_CONTENT_NOTICE.md`, `PRIVATE_PACKAGE_MANIFEST.json`,
`PRIVATE_PACKAGE_INVENTORY.md`, `PRIVATE_PHONE_PLAY.md`.

## Support draft

PACKAGE SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`
SOURCE `mbains89/Sunsplitter@a91a26d47ac76a976ca4406caf9b04511c11ba82`
TREE `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895`
PACKAGE VERSION `0.33`

Internal support-response draft for this exact private package. No
support channel, service level, refund policy, or commercial
availability is promised.

1. Keep the ZIP and its `.sha256` sidecar together and verify the
   checksum `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`
   before extracting.
2. Follow `PRIVATE_PHONE_PLAY.md` for the private phone path. Do not
   open `index.html` from Files, Downloads, Quick Look, or a `file://`
   address.
3. Use a regular browser window, keep the same full web address, and do
   not clear browser/site data if you need the local Continue slot.

If the checksum does not match: stop. Do not extract or run the ZIP.
Ask the sender for a clean copy and checksum.

If Continue is missing: return to the exact same full address in the
same regular browser.

For this private test, use the same private handoff channel through
which you received the package. No public support address or response
time is established here.

## Privacy / data-notes draft

PACKAGE SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`
SOURCE `mbains89/Sunsplitter@a91a26d47ac76a976ca4406caf9b04511c11ba82`
TREE `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895`
PACKAGE VERSION `0.33`

Internal review draft only. It is not a published legal policy, legal
advice, or a claim about any future storefront, public host, download
provider, browser, device, operating system, or network operator.

- The packaged game is static HTML, CSS, and JavaScript with no account
  system or backend. No analytics or telemetry integration was observed
  in the inspected runtime files.
- The manifest static scan covers every packaged text runtime file. It
  is not a comprehensive privacy audit.
- Normal play stores the content-notice acknowledgement and game save
  in that browser's local storage. No upload or sync behavior was
  observed in the inspected runtime files.
- Save export creates a JSON file only when the player requests it.
- The included private server uses HTTP, not HTTPS. It serves only
  included game files on a trusted local network, has no
  authentication, accepts no uploads, writes no application request
  log, and blocks the game page from making off-computer connections.
- Tracked CSS contains one external font stylesheet reference. The
  included private server blocks that request and uses system fallback
  fonts; another opening method may let the browser attempt the
  external request.

This draft does not declare privacy or legal review complete.

## Adult-classification draft

PACKAGE SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`
SOURCE `mbains89/Sunsplitter@a91a26d47ac76a976ca4406caf9b04511c11ba82`
TREE `dd9ea40d90ee08d52ff2c11c263a7d7cceb80895`

**Status:** `DRAFT_PRIVATE_METADATA_ONLY`
**Scope:** `PRIVATE_PACKAGE_ONLY`
**Platform / official rating / rating authority:** unset; not assigned here
**Submitted:** no
**Adult content:** present and permanent in this build
**Reduced-content mode:** none

This is draft private metadata for the exact package above. It is not a
platform age rating, storefront classification, publication
authorization, or commercial claim.

Player-facing descriptors from the packaged content notice:

- Optional and refusable explicit sexual text, sexualized imagery, and full nudity, including an optional multi-partner encounter.
- Sexual relationships within a commander/crew hierarchy; consent, refusal, boundaries, favoritism, and resource consequences are explicit themes.
- Intimate recording, disclosure, and loss-of-privacy themes.
- Pregnancy risk, post-coital prevention, embryos, and reproductive-resource triage.
- Blood, serious injury, medical trauma, suffocation/decompression, and named-character death.
- Mass death, grief, isolation, extinction themes, and moral distress.
- Resource scarcity and command decisions that can sacrifice or kill named characters.
- Brief use of an unspecified non-regulation drink.

Claim limits: `NO_PLATFORM_AGE_RATING_ASSIGNED`,
`NO_STOREFRONT_CLASSIFICATION_SUBMITTED`, `NO_PUBLICATION_AUTHORIZED`.

## Platform and rights notes recorded for 0.39

These items are recorded, not solved. 0.35 does not close L-012.

- Storefront-specific fields, current platform rules, and submission-time
  policy recheck remain 0.39 work. No public listing is opened here.
- Commercial terms, payment configuration, business/tax decisions, and
  public launch timing remain owner decisions. This draft offers no
  price and no payment.
- Final adult classification, generative-AI disclosure, cover and
  screenshot suitability, and marketing claims remain unset.
- Font, asset, and third-party rights evidence is
  `NOT_EVIDENCED_IN_REPOSITORY`. The package inventory records gaps and
  does not grant clearance.
- Support and privacy contacts, jurisdiction-specific notices,
  processor disclosures, public-host behavior, and retention/request
  procedures remain unset.
- A later named public storefront, including any post-1.0 store
  decision, is outside this ticket.
- Netlify is not treated as a commercial host here. Owner playtesting
  pin `a91a26d` is left alone; this ticket does not remint PIN-02.

`platformPolicyStatus` stays `DEFERRED_TO_0_39_SUBMISSION_TIME_RECHECK`.
`rightsClearanceStatus` stays `NOT_EVIDENCED_IN_REPOSITORY`.

## Honesty after PR 144

PR 144 added a title-utilities control that reopens the existing
content notice. Those bytes are on write-lane HEAD `3e3a6a6` and are
**not** inside archive `47d8d9c9…`. The private package and these
drafts remain bound to `a91a26d`. This ticket does not rebuild the
package to absorb that later lane change.

## Files

- this document only

No `src/**`, `css/**`, `images/**`, `index.html`, `scripts/**`,
STATUS, ROADMAP, LOCKS, Netlify, or public-listing edits.

## Boundaries

No public page, payment, price, named commercial storefront,
certification, tag, deploy, Netlify pin, remint of PRs 107–144, mint of
0.36, Amara-route work, ART-R2 campaign, PR 45/46, or L-025–L-028
reopen. No Q7 STATUS-DOCS on this branch.

Next action: required version-lane checks, then merge-commit this one
PR. Not squash. Then stop.
