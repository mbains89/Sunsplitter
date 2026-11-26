// Sunsplitter — ship-gallery.js
// SUN-GALLERY-01 (L-054, design §3; owner rulings 2026-11-25 D4(a) D5(a) D6(a)): the plates this
// browser's ship memory recorded as seen, in the order they were first seen.
//
// - Reached from the title only. There is nothing in a run (L-047).
// - Shows exactly memory.plates: no locked tiles, no silhouettes, no gaps, and no count or total
//   anywhere (D4(a)). The title's Gallery button stays hidden until one plate has been seen.
// - A plate stays here once seen, even if someone in it died in a later run (D5(a)).
// - ART-R2 people-free fallback plates are never shown (D6(a)); the store does not record them.
// - Adult plates show once seen. "Cover nudity in pictures" (L-040) covers them here as it does in
//   play: every picture is set through setManagedImageSource, which applies the engine's own list.
// - 6 plates a page on a phone, 12 from 600px wide, so decoded plates stay bounded. Changing page
//   or leaving the gallery lets go of every picture it set.
//
// renderGallery is the only function here that reads the ship memory (design §2 allowlist). The
// paging and the viewer use the list it last read.

const GALLERY_PAGE_NARROW = 6;
const GALLERY_PAGE_WIDE = 12;
const GALLERY_WIDE_QUERY = "(min-width: 600px)";
const GALLERY_STEM_RE = /^[a-z0-9_]+$/;

let galleryStems = [];
let galleryPageStart = 0;
let galleryViewerIndex = -1;
let galleryTiles = [];

function galleryPlateSource(stem) {
  return `images/${stem}.jpg`;
}

function galleryPageSize() {
  try {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function"
      && window.matchMedia(GALLERY_WIDE_QUERY).matches) return GALLERY_PAGE_WIDE;
  } catch (e) { /* no media queries: the narrow page */ }
  return GALLERY_PAGE_NARROW;
}

function galleryScreenOpen() {
  const screen = document.getElementById("gallery-screen");
  return !!(screen && !screen.classList.contains("hidden"));
}

function galleryFocus(el) {
  if (!el || typeof el.focus !== "function") return false;
  try { el.focus({ preventScroll: true }); }
  catch (e) { el.focus(); }
  return true;
}

function galleryClear(el) {
  if (!el) return;
  if (typeof el.replaceChildren === "function") el.replaceChildren();
  else el.innerHTML = "";
}

// Reads the ship memory, shows or hides the title's Gallery button, and redraws the open page.
function renderGallery() {
  let plates = [];
  try {
    const memory = typeof shipMemoryRead === "function" ? shipMemoryRead() : null;
    if (memory && Array.isArray(memory.plates)) plates = memory.plates;
  } catch (e) {
    plates = [];
  }
  galleryStems = plates.filter((stem, index, list) => typeof stem === "string"
    && GALLERY_STEM_RE.test(stem) && !stem.startsWith("art_r2_") && list.indexOf(stem) === index);
  const entry = document.getElementById("btn-gallery");
  if (entry) entry.classList.toggle("hidden", !galleryStems.length);
  if (galleryScreenOpen()) renderGalleryPage();
  return galleryStems.slice();
}

// Every picture element the gallery has set, for the nudity setting and for release.
function galleryPictureElements() {
  const list = galleryTiles.map(tile => tile.img);
  const viewer = document.getElementById("gallery-viewer-image");
  if (viewer) list.push(viewer);
  return list.filter(Boolean);
}

function releaseGalleryTiles() {
  for (const tile of galleryTiles) {
    setManagedImageSource(tile.img, "");
    tile.img.alt = "";
    tile.button.onclick = null;
  }
  galleryTiles = [];
  galleryClear(document.getElementById("gallery-grid"));
}

function releaseGalleryViewer() {
  galleryViewerIndex = -1;
  const viewer = document.getElementById("gallery-viewer");
  if (viewer) {
    viewer.classList.add("hidden");
    viewer.classList.remove("visible");
  }
  const img = document.getElementById("gallery-viewer-image");
  setManagedImageSource(img, "");
  if (img) img.alt = "";
}

// Called by the engine whenever a screen other than the gallery is shown.
function releaseGalleryPictures() {
  releaseGalleryViewer();
  releaseGalleryTiles();
}

function renderGalleryPage() {
  releaseGalleryTiles();
  const grid = document.getElementById("gallery-grid");
  const size = galleryPageSize();
  if (galleryPageStart >= galleryStems.length) galleryPageStart = Math.max(0, galleryStems.length - 1);
  galleryPageStart -= galleryPageStart % size;
  const pageStems = galleryStems.slice(galleryPageStart, galleryPageStart + size);
  pageStems.forEach((stem, offset) => {
    const index = galleryPageStart + offset;
    const src = galleryPlateSource(stem);
    const item = document.createElement("li");
    item.className = "gallery-item";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-tile";
    button.setAttribute("aria-label", imageAlternative(src));
    button.setAttribute("data-gallery-stem", stem);
    button.onclick = () => openGalleryViewer(index);
    const frame = document.createElement("span");
    frame.className = "gallery-tile-frame";
    const img = document.createElement("img");
    img.className = "gallery-picture";
    img.alt = "";
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    frame.appendChild(img);
    button.appendChild(frame);
    item.appendChild(button);
    if (grid) grid.appendChild(item);
    setManagedImageSource(img, src);
    galleryTiles.push({ stem, index, button, img });
  });
  const earlier = document.getElementById("gallery-earlier");
  if (earlier) earlier.classList.toggle("hidden", galleryPageStart === 0);
  const more = document.getElementById("gallery-more");
  if (more) more.classList.toggle("hidden", galleryPageStart + size >= galleryStems.length);
}

function galleryTileFor(index) {
  return galleryTiles.find(tile => tile.index === index) || null;
}

function openGallery() {
  galleryPageStart = 0;
  galleryViewerIndex = -1;
  showScreen("gallery");
  renderGallery();
  if (!galleryStems.length) {
    closeGallery();
    return false;
  }
  return true;
}

function closeGallery() {
  showTitleScreen();
  const entry = document.getElementById("btn-gallery");
  if (entry && !entry.classList.contains("hidden")) galleryFocus(entry);
  return true;
}

function galleryPage(delta) {
  if (!galleryScreenOpen()) return false;
  const size = galleryPageSize();
  const start = galleryPageStart - (galleryPageStart % size) + (delta < 0 ? -size : size);
  if (start < 0 || start >= galleryStems.length) return false;
  galleryPageStart = start;
  renderGalleryPage();
  const main = document.getElementById("main");
  if (main) main.scrollTop = 0;
  const first = galleryTiles[0];
  if (first) galleryFocus(first.button);
  return true;
}

function showGalleryViewerPicture() {
  const src = galleryPlateSource(galleryStems[galleryViewerIndex]);
  const img = document.getElementById("gallery-viewer-image");
  setManagedImageSource(img, src);
  if (img) img.alt = imageAlternative(src);
  const prev = document.getElementById("gallery-viewer-prev");
  const next = document.getElementById("gallery-viewer-next");
  if (prev) prev.disabled = galleryViewerIndex <= 0;
  if (next) next.disabled = galleryViewerIndex >= galleryStems.length - 1;
  // A control that just went inert must not keep focus.
  const active = typeof document !== "undefined" ? document.activeElement : null;
  if (active && active.disabled && (active === prev || active === next)) {
    const other = active === prev ? next : prev;
    galleryFocus(other && !other.disabled ? other : document.getElementById("gallery-viewer-close"));
  }
}

function openGalleryViewer(index) {
  if (!galleryScreenOpen() || !Number.isInteger(index) || index < 0 || index >= galleryStems.length) return false;
  galleryViewerIndex = index;
  const viewer = document.getElementById("gallery-viewer");
  if (viewer) {
    viewer.classList.remove("hidden");
    viewer.classList.add("visible");
  }
  showGalleryViewerPicture();
  galleryFocus(document.getElementById("gallery-viewer-close"));
  return true;
}

function stepGalleryViewer(delta) {
  if (galleryViewerIndex < 0) return false;
  const index = galleryViewerIndex + (delta < 0 ? -1 : 1);
  if (index < 0 || index >= galleryStems.length) return false;
  galleryViewerIndex = index;
  showGalleryViewerPicture();
  return true;
}

// Close the viewer and return focus to the tile of the picture it showed last, turning to that
// tile's page when Previous or Next went past the page the viewer was opened from.
function closeGalleryViewer() {
  if (galleryViewerIndex < 0) return false;
  const index = galleryViewerIndex;
  releaseGalleryViewer();
  const size = galleryPageSize();
  const start = index - (index % size);
  if (start !== galleryPageStart) {
    galleryPageStart = start;
    renderGalleryPage();
  }
  const tile = galleryTileFor(index);
  galleryFocus(tile ? tile.button : document.getElementById("gallery-heading"));
  return true;
}

// Escape leaves the viewer, then the gallery. Arrow keys step the viewer. While the viewer is open
// the shared dialog handler (src/validate.js) also keeps Tab inside it and takes Escape first.
function handleGalleryKeydown(event) {
  if (!event || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return false;
  if (!galleryScreenOpen()) return false;
  const key = event.key || "";
  if (galleryViewerIndex >= 0 && (key === "ArrowLeft" || key === "ArrowRight")) {
    if (typeof event.preventDefault === "function") event.preventDefault();
    stepGalleryViewer(key === "ArrowLeft" ? -1 : 1);
    return true;
  }
  if (key !== "Escape") return false;
  if (typeof event.preventDefault === "function") event.preventDefault();
  if (event.repeat) return true;
  if (galleryViewerIndex >= 0) closeGalleryViewer();
  else closeGallery();
  return true;
}

(function wireGallery() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  document.addEventListener("keydown", handleGalleryKeydown);
  // A window that crosses the wide breakpoint redraws with the other page size, from the same plate.
  try {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const query = window.matchMedia(GALLERY_WIDE_QUERY);
      const redraw = () => { if (galleryScreenOpen() && galleryViewerIndex < 0) renderGalleryPage(); };
      if (typeof query.addEventListener === "function") query.addEventListener("change", redraw);
      else if (typeof query.addListener === "function") query.addListener(redraw);
    }
  } catch (e) { /* no media queries */ }
})();
