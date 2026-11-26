// SUN-GALLERY-01 (L-054, design §3 and §7 ticket 2; owner rulings 2026-11-25 D4(a) D5(a) D6(a)).
// The title's Gallery shows exactly the plates the ship memory recorded, in recorded order.
//
// Headless (simulate.loadGame, with a small focus and child-list model on the DOM stub):
//   A  the Gallery button is hidden while memory has no plate, shows once one is seen, and is
//      reached from the title only (nothing in a run, L-047);
//   B  exactly the recorded stems show, in order, across pages (6 a page narrow, 12 wide);
//   C  no count or total anywhere: the gallery's words are all in index.html and none has a digit,
//      and ship-gallery.js writes no text of its own;
//   D  an adult plate shows once seen in play; a plate of someone who died later stays (D5);
//   E  ART-R2 people-free fallbacks never show (D6), even if a stored list names one;
//   F  paging: Earlier/More appear only when there is a page that way;
//   G  viewer: opens on a tile, Previous/Next stop at the ends, Escape (the gallery's own key
//      handler and the shared dialog handler) closes it and focus returns to the tile, on the
//      tile's own page; a second Escape leaves to the title with focus on the Gallery button;
//   H  pictures are released on page change and when the gallery is left;
//   I  "Cover nudity in pictures" on: every picture on the engine's NUDITY_PICTURES list is covered
//      in the grid and in the viewer, nothing else is, toggling updates the open gallery, and off
//      covers nothing. The list is read from the engine, never copied here;
//   J  layout rules that keep the grid inside the window (static, always run).
// Browser (only where Playwright resolves; CI has none, so it prints NOT_AVAILABLE there):
//   K  no horizontal scroll at 360×640 and 1280×800 on the title, grid and viewer; 6 and 12 tiles.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_ship_memory_v1";
const COVER_KEY = "sunsplitter_cover_nudity_v1";
const INDEX = readFileSync(resolve(ROOT, "index.html"), "utf8");
const GALLERY_JS = readFileSync(resolve(ROOT, "src/ship-gallery.js"), "utf8");
const GALLERY_CSS = readFileSync(resolve(ROOT, "css/gallery.css"), "utf8");
// Recorded order is deliberately not alphabetical.
const STEMS = ["vault", "romance_lena_1", "ending_ship", "shower_lena", "lena", "act2_tether_dock", "medical_bay",
  "corridor_variant_3", "observation_bridge", "ending_fracture", "rear_mira", "ship_exterior_2", "ending_landfall", "debris_field"];

function memoryWith(plates, extra = {}) {
  return JSON.stringify(Object.assign({ v: 1, runs: 1, plates }, extra));
}

// Fresh engine with focus, child-list and media-query models on the DOM stub.
function boot({ wide = false } = {}) {
  const runtime = loadGame(ROOT);
  runtime.evaluate(`(() => {
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    proto.contains = function (node) { return node === this; };
    proto.replaceChildren = function () { this.children = []; };
    window.matchMedia = query => ({ matches: ${wide ? "true" : "false"} && query === "(min-width: 600px)" });
    globalThis.__key = (key, extra = {}) => {
      const event = Object.assign({ type: "keydown", key, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false,
        metaKey: false, shiftKey: false, target: document.activeElement || null,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, stopImmediatePropagation() {} }, extra);
      document.dispatchEvent(event);
      return event;
    };
    globalThis.__tiles = () => galleryTiles.map(tile => tile.stem);
    globalThis.__hidden = id => document.getElementById(id).classList.contains("hidden");
    globalThis.__focus = () => { const el = document.activeElement; return el ? (el.id && el.id !== "button" ? el.id : "tile:" + el.getAttribute("data-gallery-stem")) : null; };
  })()`);
  return runtime;
}

function setMemory(runtime, raw) {
  runtime.evaluate(`localStorage.clear(); ${raw === null ? "" : `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(raw)});`}`);
}

// Every page's stems, walking More from the first page.
function walkPages(runtime) {
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const pages = [__tiles()];
    let guard = 0;
    while (!__hidden("gallery-more") && guard++ < 50) { galleryPage(1); pages.push(__tiles()); }
    return pages;
  })())`));
}

function checkEntry(errors) {
  const rt = boot();
  setMemory(rt, null);
  const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
    const o = {};
    showTitleScreen(); o.emptyHidden = __hidden("btn-gallery");
    o.openEmpty = openGallery(); o.titleAfterEmpty = !__hidden("title-screen") && __hidden("gallery-screen");
    localStorage.setItem(${JSON.stringify(KEY)}, "{not json"); showTitleScreen(); o.corruptHidden = __hidden("btn-gallery");
    localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(memoryWith(["art_r2_corridor_empty"]))}); showTitleScreen(); o.onlyR2Hidden = __hidden("btn-gallery");
    localStorage.clear(); showTitleScreen();
    // A plate on screen in play is what makes the button appear.
    resetRunState(); showScreen("game"); setManagedImageSource(document.getElementById("scene-image"), "images/vault.jpg");
    o.inRunScreenHidden = __hidden("gallery-screen");
    showTitleScreen(); o.afterSeenHidden = __hidden("btn-gallery");
    return o;
  })())`));
  if (!out.emptyHidden) errors.push("A: the Gallery button shows with an empty memory");
  if (out.openEmpty !== false || !out.titleAfterEmpty) errors.push("A: opening the gallery with nothing seen must stay on the title");
  if (!out.corruptHidden) errors.push("A: the Gallery button shows with an unreadable memory");
  if (!out.onlyR2Hidden) errors.push("A: the Gallery button shows when the only stored plate is an ART-R2 fallback");
  if (!out.inRunScreenHidden) errors.push("A: the gallery screen showed in a run");
  if (out.afterSeenHidden) errors.push("A: the Gallery button stays hidden after a plate was seen");
  // Title only (L-047): one entry, inside the title; nothing in the run bar.
  const calls = [...INDEX.matchAll(/openGallery\(/g)].length;
  const title = INDEX.slice(INDEX.indexOf('<div id="title-screen"'), INDEX.indexOf('<section id="cinematic-screen"'));
  if (calls !== 1 || !/<div class="title-actions">[\s\S]*id="btn-gallery"[^>]*onclick="openGallery\(\)"/.test(title)) errors.push("A: the gallery must have exactly one entry, the title's Gallery button");
  if (!/id="btn-gallery" class="btn hidden"/.test(INDEX)) errors.push("A: the Gallery button must start hidden in the markup");
  const meta = INDEX.slice(INDEX.indexOf('<div id="meta"'), INDEX.indexOf("<script"));
  if (/gallery/i.test(meta)) errors.push("A: the in-run bar names the gallery");
  return out;
}

function checkOrderAndPaging(errors) {
  const results = {};
  for (const wide of [false, true]) {
    const size = wide ? 12 : 6;
    const rt = boot({ wide });
    setMemory(rt, memoryWith(STEMS));
    rt.evaluate(`showTitleScreen(); openGallery();`);
    const first = JSON.parse(rt.evaluate(`JSON.stringify({ earlier: __hidden("gallery-earlier"), more: __hidden("gallery-more"), focus: __focus(),
      gridKids: document.getElementById("gallery-grid").children.length })`));
    const pages = walkPages(rt);
    const flat = pages.flat();
    if (JSON.stringify(flat) !== JSON.stringify(STEMS)) errors.push(`B: ${wide ? "wide" : "narrow"} pages show ${JSON.stringify(flat)}, recorded ${JSON.stringify(STEMS)}`);
    if (pages.slice(0, -1).some(page => page.length !== size) || pages.at(-1).length > size) errors.push(`B: ${wide ? "wide" : "narrow"} page sizes ${pages.map(p => p.length)} (want ${size} a page)`);
    if (first.gridKids !== Math.min(size, STEMS.length)) errors.push(`B: the grid holds ${first.gridKids} tiles on the first page`);
    if (!first.earlier || first.more) errors.push("F: on the first page Earlier must be hidden and More shown");
    if (first.focus !== "gallery-heading") errors.push(`G: opening the gallery focuses ${first.focus}, not its heading`);
    const end = JSON.parse(rt.evaluate(`JSON.stringify((() => {
      const o = { earlier: __hidden("gallery-earlier"), more: __hidden("gallery-more"), moreAgain: galleryPage(1) };
      const before = __tiles(); o.back = galleryPage(-1); o.backTiles = __tiles(); o.focus = __focus(); o.before = before;
      return o;
    })())`));
    if (end.earlier || !end.more) errors.push("F: on the last page Earlier must be shown and More hidden");
    if (end.moreAgain !== false) errors.push("F: More past the last page must do nothing");
    if (end.back !== true || JSON.stringify(end.backTiles) !== JSON.stringify(pages.at(-2))) errors.push("F: Earlier does not return to the previous page");
    if (end.focus !== "tile:" + pages.at(-2)[0]) errors.push(`F: after a page turn focus is ${end.focus}, not the page's first tile`);
    results[wide ? "wide" : "narrow"] = pages.map(p => p.length).join("+");
  }
  // The stored order is the order shown, whatever it is.
  const rt = boot();
  const reversed = STEMS.slice(0, 5).reverse();
  setMemory(rt, memoryWith(reversed));
  rt.evaluate(`showTitleScreen(); openGallery();`);
  const shown = walkPages(rt).flat();
  if (JSON.stringify(shown) !== JSON.stringify(reversed)) errors.push(`B: a reversed record shows ${JSON.stringify(shown)}`);
  // Recorded in play, in first-seen order: the order the gallery then shows.
  const played = boot();
  setMemory(played, null);
  const seen = JSON.parse(played.evaluate(`JSON.stringify((() => {
    const img = document.getElementById("scene-image");
    for (const stem of ["medical_bay", "vault", "medical_bay", "ending_ship"]) setManagedImageSource(img, "images/" + stem + ".jpg");
    showTitleScreen(); openGallery(); return __tiles();
  })())`));
  if (JSON.stringify(seen) !== JSON.stringify(["medical_bay", "vault", "ending_ship"])) errors.push(`B: plates seen in play show as ${JSON.stringify(seen)}`);
  return results;
}

function checkNoCount(errors) {
  const gallery = INDEX.slice(INDEX.indexOf('<section id="gallery-screen"'), INDEX.indexOf("</section>", INDEX.indexOf('<div id="gallery-viewer"')) + 10);
  const words = [...gallery.matchAll(/>([^<>]+)</g)].map(m => m[1].trim()).filter(Boolean)
    .concat([...gallery.matchAll(/aria-label="([^"]*)"/g)].map(m => m[1]));
  const entry = (/<button id="btn-gallery"[^>]*>([^<]*)</.exec(INDEX) || [])[1];
  words.push(entry || "");
  for (const word of words) if (/\d/.test(word)) errors.push(`C: gallery wording "${word}" holds a number`);
  if (entry !== "Gallery") errors.push(`C: the title button reads "${entry}", not "Gallery"`);
  const code = GALLERY_JS.replace(/\/\/[^\n]*/g, "");
  if (/\b(?:textContent|innerText|insertAdjacentHTML)\b|innerHTML\s*=(?!\s*""\s*;)/.test(code)) errors.push("C: ship-gallery.js writes text of its own; the gallery's words live in index.html");
  for (const label of ["aria-valuenow", "aria-setsize", "aria-posinset"]) if (code.includes(label)) errors.push(`C: ship-gallery.js sets ${label}, which reads out a count`);
  // At run time: the tiles' names are the engine's picture descriptions, with no "n of N" in them.
  const rt = boot();
  setMemory(rt, memoryWith(STEMS));
  rt.evaluate(`showTitleScreen(); openGallery();`);
  const labels = JSON.parse(rt.evaluate(`JSON.stringify((() => { const all = [];
    for (let guard = 0; guard < 10; guard++) { for (const tile of galleryTiles) all.push(tile.button.getAttribute("aria-label")); if (!galleryPage(1)) break; }
    openGalleryViewer(0); all.push(document.getElementById("gallery-viewer-image").alt); return all; })())`));
  for (const label of labels) {
    if (!/^(?:Scene illustration: |Portrait of )/.test(label || "")) errors.push(`C: a tile is named "${label}"`);
    if (/\b\d+\s*(?:of|\/)\s*\d+\b|\b\d+\s+(?:plates?|pictures?|images?)\b/i.test(label || "")) errors.push(`C: "${label}" reads as a count`);
  }
}

function checkAdultAndDead(errors) {
  const rt = boot();
  setMemory(rt, null);
  const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
    const o = { tried: 0 };
    // Real play: the first scene whose plate is on the nudity list, rendered by showScene.
    for (const id of Object.keys(scenes)) {
      let src = "";
      resetRunState();
      try { src = resolveSceneImage(id, scenes[id]) || ""; } catch (e) { src = ""; }
      if (!pictureShowsNudity(src)) continue;
      o.tried++;
      showScreen("game");
      try { showScene(id, { skipOnEnter: true }); } catch (e) { continue; }
      const shown = document.getElementById("scene-image").__ssManagedSource || "";
      if (!pictureShowsNudity(shown)) continue;
      o.scene = id; o.shown = shown; break;
    }
    o.stem = (o.shown || "").split("/").pop().replace(/\\.jpg$/, "");
    showTitleScreen(); openGallery(); o.tiles = __tiles();
    // A later run in which Lena dies, recorded at its end: her plates stay.
    showTitleScreen(); resetRunState(); kill("lena", "gallery check"); state.flags.final = "endure";
    shipMemoryRecordRun("The Long Dark"); o.lost = shipMemoryRead().lost;
    showTitleScreen(); openGallery(); o.after = __tiles();
    return o;
  })())`));
  if (!out.scene) errors.push(`D: no scene put a listed adult plate on screen (tried ${out.tried})`);
  else if (!out.tiles.includes(out.stem)) errors.push(`D: ${out.stem}, seen at ${out.scene}, is not in the gallery`);
  if (!out.lost || !out.lost.lena) errors.push("D: the later run did not record Lena lost");
  if (JSON.stringify(out.after) !== JSON.stringify(out.tiles)) errors.push(`D: after Lena died in a later run the gallery changed from ${JSON.stringify(out.tiles)} to ${JSON.stringify(out.after)}`);
  return out;
}

function checkArtR2(errors) {
  const rt = boot();
  setMemory(rt, memoryWith(["vault", "art_r2_corridor_empty", "medical_bay"]));
  const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
    const img = document.getElementById("scene-image");
    setManagedImageSource(img, "images/art_r2_hold_empty.jpg");
    showTitleScreen(); openGallery();
    const all = []; for (let g = 0; g < 10; g++) { all.push(...__tiles()); if (!galleryPage(1)) break; }
    return { all, stored: shipMemoryRead().plates };
  })())`));
  if (out.all.some(stem => stem.startsWith("art_r2_"))) errors.push(`E: an ART-R2 fallback shows in the gallery: ${out.all.join(", ")}`);
  if (JSON.stringify(out.all) !== JSON.stringify(["vault", "medical_bay"])) errors.push(`E: the gallery shows ${JSON.stringify(out.all)}`);
  if (!/startsWith\("art_r2_"\)/.test(GALLERY_JS)) errors.push("E: renderGallery must drop art_r2_ stems itself, not only rely on the store");
}

function checkViewer(errors) {
  const rt = boot();
  setMemory(rt, memoryWith(STEMS));
  const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
    const o = {};
    const viewer = () => document.getElementById("gallery-viewer");
    const vimg = () => document.getElementById("gallery-viewer-image");
    showTitleScreen(); openGallery();
    galleryTiles[1].button.onclick();
    o.open = viewer().classList.contains("visible") && !__hidden("gallery-viewer");
    o.modal = openModalDialogElement() === viewer();
    o.src = vimg().__ssManagedSource; o.alt = vimg().alt; o.focus = __focus();
    o.prevAtStart = document.getElementById("gallery-viewer-prev").disabled;
    __key("Escape");
    o.closed = !viewer().classList.contains("visible") && __hidden("gallery-viewer");
    o.released = vimg().__ssManagedSource === "" && vimg().alt === "";
    o.returned = __focus();
    o.stillGallery = !__hidden("gallery-screen");
    // Step past the page with Next and the arrow key, then close with the shared dialog handler.
    galleryTiles[4].button.onclick();
    stepGalleryViewer(1); __key("ArrowRight");
    o.stepped = vimg().__ssManagedSource;
    __key("ArrowLeft"); __key("ArrowRight");
    const esc = { key: "Escape", shiftKey: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false, defaultPrevented: false,
      target: document.activeElement, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} };
    o.sharedTook = handleModalDialogKeydown(esc);
    o.pageAfter = __tiles(); o.returned2 = __focus();
    // The last picture: Next stops, and focus does not stay on a disabled control.
    galleryTiles[galleryTiles.length - 1].button.onclick();
    let guard = 0; while (stepGalleryViewer(1) && guard++ < 50) {}
    o.nextAtEnd = document.getElementById("gallery-viewer-next").disabled;
    document.getElementById("gallery-viewer-next").focus(); stepGalleryViewer(-1); stepGalleryViewer(1);
    o.focusAtEnd = __focus();
    o.lastSrc = vimg().__ssManagedSource;
    __key("Escape");
    // Held Escape does not fall through from the viewer to the title.
    o.repeatStays = (__key("Escape", { repeat: true }), !__hidden("gallery-screen"));
    __key("Escape");
    o.left = __hidden("gallery-screen") && !__hidden("title-screen");
    o.leftFocus = __focus();
    return o;
  })())`));
  if (!out.open || !out.modal) errors.push("G: a tile does not open the viewer as the open dialog");
  if (out.src !== "images/romance_lena_1.jpg" || !/^Scene illustration: /.test(out.alt)) errors.push(`G: the viewer shows ${out.src} with alt "${out.alt}"`);
  if (out.focus !== "gallery-viewer-close") errors.push(`G: the viewer opens with focus on ${out.focus}`);
  if (out.prevAtStart !== false) errors.push("G: Previous is disabled on the second picture");
  if (!out.closed || !out.released) errors.push("G: Escape does not close the viewer and let go of its picture");
  if (out.returned !== "tile:romance_lena_1") errors.push(`G: closing the viewer focuses ${out.returned}, not its tile`);
  if (!out.stillGallery) errors.push("G: Escape in the viewer also left the gallery");
  if (out.stepped !== "images/medical_bay.jpg") errors.push(`G: Next and ArrowRight from the fifth picture show ${out.stepped}`);
  if (out.sharedTook !== true) errors.push("G: the shared dialog handler does not close the viewer on Escape");
  if (JSON.stringify(out.pageAfter) !== JSON.stringify(STEMS.slice(6, 12)) || out.returned2 !== "tile:medical_bay") errors.push(`G: after stepping onto the next page and closing, the page is ${JSON.stringify(out.pageAfter)} and focus ${out.returned2}`);
  if (!out.nextAtEnd || out.lastSrc !== "images/" + STEMS.at(-1) + ".jpg") errors.push("G: Next does not stop at the last picture");
  if (out.focusAtEnd === "gallery-viewer-next") errors.push("G: focus stayed on the disabled Next control");
  if (!out.repeatStays) errors.push("G: a held Escape left the gallery");
  if (!out.left || out.leftFocus !== "btn-gallery") errors.push(`G: Escape on the grid must return to the title with focus on the Gallery button (focus ${out.leftFocus})`);
}

function checkRelease(errors) {
  const rt = boot();
  setMemory(rt, memoryWith(STEMS));
  const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
    const o = {};
    const imgs = [];
    showTitleScreen(); openGallery();
    imgs.push(...galleryTiles.map(t => t.img));
    o.lazy = galleryTiles.every(t => t.img.getAttribute("loading") === "lazy" && t.img.getAttribute("decoding") === "async");
    o.firstSet = imgs.every(img => /^images\\/[a-z0-9_]+\\.jpg$/.test(img.__ssManagedSource));
    galleryPage(1);
    o.pageReleased = imgs.every(img => img.__ssManagedSource === "");
    imgs.push(...galleryTiles.map(t => t.img));
    galleryTiles[0].button.onclick();
    closeGallery();
    o.allReleased = imgs.every(img => img.__ssManagedSource === "");
    o.viewerReleased = document.getElementById("gallery-viewer-image").__ssManagedSource === "";
    o.viewerHidden = __hidden("gallery-viewer");
    o.gridEmpty = document.getElementById("gallery-grid").children.length === 0 && galleryTiles.length === 0;
    // Leaving by any other screen change releases too.
    openGallery(); const more = galleryTiles.map(t => t.img); showScreen("tone");
    o.otherScreen = more.every(img => img.__ssManagedSource === "") && galleryTiles.length === 0;
    return o;
  })())`));
  if (!out.lazy) errors.push("H: tiles must load lazily and decode asynchronously");
  if (!out.firstSet) errors.push("H: tiles were not given their plate");
  if (!out.pageReleased) errors.push("H: a page turn kept the previous page's pictures");
  if (!out.allReleased || !out.viewerReleased || !out.viewerHidden || !out.gridEmpty) errors.push(`H: leaving the gallery kept pictures (${JSON.stringify(out)})`);
  if (!out.otherScreen) errors.push("H: showing another screen kept the gallery's pictures");
  if (/\.src\s*=/.test(GALLERY_JS.replace(/\/\/[^\n]*/g, ""))) errors.push("H: ship-gallery.js sets a picture without setManagedImageSource");
}

function checkNudity(errors) {
  const rt = boot();
  const listed = JSON.parse(rt.evaluate(`JSON.stringify([...NUDITY_PICTURES])`));
  for (const name of listed) if (GALLERY_JS.includes(name)) errors.push(`I: ship-gallery.js names ${name}; use the engine's list`);
  // Every listed picture, plus clothed plates between them, in a recorded order.
  const clothed = ["vault", "medical_bay", "lena", "ending_ship", "corridor_variant_3", "observation_bridge"];
  const stems = [];
  listed.forEach((name, index) => { stems.push(name.replace(/\.jpg$/, "")); if (index < clothed.length) stems.push(clothed[index]); });
  const summary = {};
  for (const on of [true, false]) {
    setMemory(rt, memoryWith(stems));
    rt.evaluate(`setCoverNudity(${on});`);
    const out = JSON.parse(rt.evaluate(`JSON.stringify((() => {
      const bad = []; let covered = 0; let viewerCovered = 0; let seen = 0;
      showTitleScreen(); openGallery();
      for (let guard = 0; guard < 40; guard++) {
        for (const tile of galleryTiles) {
          seen++;
          const want = ${on} && pictureShowsNudity(tile.img.__ssManagedSource);
          const got = tile.img.classList.contains("nudity-covered");
          if (got) covered++;
          if (want !== got) bad.push("grid " + tile.stem + " covered=" + got);
          tile.button.onclick();
          const v = document.getElementById("gallery-viewer-image");
          const vGot = v.classList.contains("nudity-covered");
          if (vGot) viewerCovered++;
          if (want !== vGot) bad.push("viewer " + tile.stem + " covered=" + vGot);
          closeGalleryViewer();
        }
        if (!galleryPage(1)) break;
      }
      // Toggling while the gallery is open updates what is on screen.
      galleryPage(-1); while (galleryPage(-1)) {}
      const tile = galleryTiles.find(t => pictureShowsNudity(t.img.__ssManagedSource));
      const live = [];
      if (tile) { setCoverNudity(true); live.push(tile.img.classList.contains("nudity-covered")); setCoverNudity(false); live.push(tile.img.classList.contains("nudity-covered")); setCoverNudity(${on}); }
      closeGallery();
      return { bad, covered, viewerCovered, seen, live };
    })())`));
    for (const line of out.bad.slice(0, 12)) errors.push(`I: setting ${on ? "on" : "off"}: ${line}`);
    if (out.seen !== stems.length) errors.push(`I: walked ${out.seen} tiles of ${stems.length}`);
    if (on && (out.covered !== listed.length || out.viewerCovered !== listed.length)) errors.push(`I: with the setting on ${out.covered} tiles and ${out.viewerCovered} viewer pictures were covered, the list has ${listed.length}`);
    if (!on && (out.covered || out.viewerCovered)) errors.push("I: with the setting off a gallery picture was covered");
    if (JSON.stringify(out.live) !== "[true,false]") errors.push(`I: toggling the setting does not update the open gallery (${JSON.stringify(out.live)})`);
    summary[on ? "on" : "off"] = `${out.covered}/${out.seen} tiles, ${out.viewerCovered} viewer`;
  }
  // The stored setting (not only this session's) covers the gallery from boot.
  const stored = boot();
  stored.evaluate(`localStorage.setItem(${JSON.stringify(COVER_KEY)}, "1"); localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(memoryWith([listed[0].replace(/\.jpg$/, "")]))});`);
  const fromBoot = stored.evaluate(`showTitleScreen(); openGallery(); galleryTiles[0].img.classList.contains("nudity-covered")`);
  if (fromBoot !== true) errors.push("I: the stored setting does not cover the gallery");
  if (!/\.gallery-tile-frame\.picture-covered::after[\s\S]*content: "Covered";/.test(GALLERY_CSS)) errors.push("I: a covered tile must carry the short Covered label");
  if (!/#gallery-viewer-frame\.picture-covered::after[\s\S]*content: "Picture covered · Cover nudity is on";/.test(GALLERY_CSS)) errors.push("I: the covered viewer must name the setting as the scene picture does");
  const cover = readFileSync(resolve(ROOT, "css/paced-reveal.css"), "utf8");
  if (!/img\.nudity-covered\s*\{\s*filter:\s*blur/.test(cover.replace(/,\s*\n\s*img\.nudity-covered/, "\nimg.nudity-covered"))) errors.push("I: css/paced-reveal.css no longer covers every img.nudity-covered");
  return summary;
}

function checkLayoutRules(errors) {
  const base = GALLERY_CSS.slice(0, GALLERY_CSS.indexOf("@media"));
  const wide = GALLERY_CSS.slice(GALLERY_CSS.indexOf("@media (min-width: 600px)"));
  if (!/\.gallery-grid\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[^}]*gap: 16px;/.test(base)) errors.push("J: the phone grid must be 2 shrinkable columns with 16px gutters");
  if (!/\.gallery-grid\s*\{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/.test(wide)) errors.push("J: the wide grid must be 4 shrinkable columns");
  if (!GALLERY_JS.includes('"(min-width: 600px)"')) errors.push("J: the page size and the grid must switch at the same width");
  if (!/aspect-ratio: 784 \/ 1168;/.test(GALLERY_CSS)) errors.push("J: tiles must keep the plates' 784×1168 frame");
  if (/object-fit:\s*cover/.test(GALLERY_CSS)) errors.push("J: the gallery must not crop a plate (object-fit: cover)");
  if (/(?:^|[;{\s])(?:min-)?width:\s*(?:[4-9]\d{2}|\d{4,})px/m.test(GALLERY_CSS)) errors.push("J: a fixed width wider than a phone");
  if (!/#gallery-viewer\s*\{[^}]*position: fixed;[^}]*inset: 0;/.test(GALLERY_CSS)) errors.push("J: the viewer must cover the window");
  if (!/<link rel="stylesheet" href="css\/paced-reveal\.css">\s*<link rel="stylesheet" href="css\/gallery\.css">/.test(INDEX)) errors.push("J: css/gallery.css must load after css/paced-reveal.css");
}

async function browserChecks(errors) {
  let chromium;
  try { ({ chromium } = createRequire(import.meta.url)("playwright")); }
  catch (e) { return "NOT_AVAILABLE (playwright does not resolve here)"; }
  let browser;
  try { browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] }); }
  catch (e) { return `NOT_AVAILABLE (chromium did not launch: ${String(e.message).split("\n")[0]})`; }
  const lines = [];
  try {
    for (const [width, height, size] of [[360, 640, 6], [1280, 800, 12]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.addInitScript(([key, raw]) => {
        localStorage.setItem("sunsplitter_tone_ack_v1", "1");
        localStorage.setItem(key, raw);
      }, [KEY, memoryWith(STEMS)]);
      await page.goto(pathToFileURL(resolve(ROOT, "index.html")).href);
      const overflow = () => page.evaluate(() => {
        const doc = document.documentElement;
        const main = document.getElementById("main");
        return { doc: doc.scrollWidth - doc.clientWidth, main: main.scrollWidth - main.clientWidth, body: document.body.scrollWidth - document.body.clientWidth };
      });
      const states = {};
      await page.waitForSelector("#btn-gallery:not(.hidden)", { timeout: 5000 });
      states.title = await overflow();
      await page.click("#btn-gallery");
      await page.waitForSelector(".gallery-tile", { timeout: 5000 });
      states.grid = await overflow();
      const tiles = await page.locator(".gallery-tile").count();
      const box = await page.locator(".gallery-tile").first().boundingBox();
      await page.click("#gallery-more");
      states.page2 = await overflow();
      await page.locator(".gallery-tile").first().click();
      await page.waitForSelector("#gallery-viewer.visible", { timeout: 5000 });
      states.viewer = await overflow();
      const fits = await page.evaluate(() => {
        const r = document.getElementById("gallery-viewer-next").getBoundingClientRect();
        return r.right <= window.innerWidth && r.bottom <= window.innerHeight;
      });
      await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
      const trapped = await page.evaluate(() => document.getElementById("gallery-viewer").contains(document.activeElement));
      await page.keyboard.press("Escape");
      const back = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-gallery-stem"));
      await page.keyboard.press("Escape");
      const left = await page.evaluate(() => ({ id: document.activeElement && document.activeElement.id, imgs: document.querySelectorAll("#gallery-grid img").length }));
      for (const [name, o] of Object.entries(states)) {
        if (o.doc > 0 || o.main > 0 || o.body > 0) errors.push(`K: ${width}×${height} ${name} scrolls sideways (${JSON.stringify(o)})`);
      }
      if (tiles !== size) errors.push(`K: ${width}×${height} shows ${tiles} tiles a page, want ${size}`);
      if (!fits) errors.push(`K: ${width}×${height} the viewer's Next control is off screen`);
      if (!trapped) errors.push(`K: ${width}×${height} Tab left the open viewer`);
      if (back !== STEMS[size]) errors.push(`K: ${width}×${height} Escape returned focus to ${back}, not ${STEMS[size]}`);
      if (left.id !== "btn-gallery" || left.imgs !== 0) errors.push(`K: ${width}×${height} leaving the gallery: focus ${left.id}, ${left.imgs} pictures kept`);
      lines.push(`${width}×${height}: ${tiles} tiles ${Math.round(box.width)}×${Math.round(box.height)}, no sideways scroll`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return lines.join("; ");
}

export async function sunPlayerflowGalleryChecks() {
  const errors = [];
  checkEntry(errors);
  const pages = checkOrderAndPaging(errors);
  checkNoCount(errors);
  const adult = checkAdultAndDead(errors);
  checkArtR2(errors);
  checkViewer(errors);
  checkRelease(errors);
  const nudity = checkNudity(errors);
  checkLayoutRules(errors);
  const browser = await browserChecks(errors);
  return { errors, pages, adult, nudity, browser };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, pages, adult, nudity, browser } = await sunPlayerflowGalleryChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-gallery");
    for (const line of errors) console.error("  " + line);
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-gallery: hidden when empty; ${STEMS.length} recorded stems in order (narrow pages ${pages.narrow}, wide ${pages.wide}); no count text; adult plate ${adult.stem} seen at ${adult.scene} shows and stays after Lena dies later; art_r2 absent; viewer Escape/focus return; pictures released; cover nudity on ${nudity.on}, off ${nudity.off}; browser: ${browser}`);
}
