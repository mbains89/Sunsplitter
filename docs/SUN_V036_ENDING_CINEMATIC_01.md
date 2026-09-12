# SUN-V036-ENDING-CINEMATIC-01

Playable checkpoint after PACK-NEXT #2.

**Reuse ruling (this PR):** keep `images/onboarding_background.jpg` as the shared ending cinematic bookend. No new JPEG. No ART-R2. Cinematic ≠ ending screen (`currentEndingArt` unchanged on Skip/complete).

Proof:
- `showCinematic("ending")` still sets cinematic image to `onboarding_background.jpg`
- Alt names the bookend so it is not mistaken for outcome art
- `scripts/cinematic-checks.mjs` still asserts corridor bookend + ending-screen plate custody

NO-PUBLISH · certified 0.28.1d · art PARKED · no Netlify.
