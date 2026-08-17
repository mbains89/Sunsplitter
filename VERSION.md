# Sunsplitter v0.28.1c

**Minimal Safe Scene Split**

## Changes
Pure size hygiene for reliable auto-push. No story, flag, or behavior changes.

Split the four largest scene files so every scene file stays under ~25–31 kB:

- `scenes-late.js` → `scenes-late-a.js` / `scenes-late-b.js` / `scenes-late-c.js`
- `scenes-mid-b.js` → `scenes-mid-b-a.js` / `scenes-mid-b-b.js`
- `scenes-mid-a.js` → `scenes-mid-a-a.js` / `scenes-mid-a-b.js`
- `scenes-crises.js` → `scenes-crises-a.js` / `scenes-crises-b.js` / `scenes-crises-c.js`

`index.html` load order updated. Scene count unchanged (207). All existing scene IDs and logic preserved.

No new story volume. No art. No 0.29.
