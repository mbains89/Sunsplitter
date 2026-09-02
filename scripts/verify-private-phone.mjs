#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { request as httpRequest } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { buildPrivatePackage, readCanonicalZip } from "./build-private-package.mjs";

const DEFAULT_SOURCE = "e3b7472c7c8e740078155c0a7489fc4031cdfb3b";
const DEFAULT_DEVICES = ["Pixel 7"];
const FIXED_NOW = 1735689600000;

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function parseOptions(args) {
  const options = {
    sourceRef: DEFAULT_SOURCE,
    devices: [],
    playwrightModule: process.env.SUNSPLITTER_PLAYWRIGHT_MODULE || null,
    browserPath: process.env.SUNSPLITTER_CHROMIUM_BIN || null
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--source") options.sourceRef = args[++index];
    else if (arg === "--device") options.devices.push(args[++index]);
    else if (arg === "--playwright-module") options.playwrightModule = args[++index];
    else if (arg === "--browser") options.browserPath = args[++index];
    else if (arg === "--help") options.help = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (!/^[0-9a-f]{40}$/.test(options.sourceRef || "")) throw new Error("--source must be a full lowercase commit SHA");
  options.devices = options.devices.length ? options.devices : DEFAULT_DEVICES;
  return options;
}

async function loadPlaywright(modulePath) {
  const candidates = modulePath
    ? [pathToFileURL(resolve(modulePath)).href]
    : ["playwright"];
  let lastError = null;
  for (const candidate of candidates) {
    try { return await import(candidate); }
    catch (error) { lastError = error; }
  }
  throw new Error(`Playwright is required; set SUNSPLITTER_PLAYWRIGHT_MODULE to its index.mjs (${lastError?.message || "not found"})`);
}

function findBrowser(requested) {
  if (requested) {
    const exact = resolve(requested);
    if (!existsSync(exact)) throw new Error(`browser executable not found: ${exact}`);
    return exact;
  }
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("Chromium browser not found; set SUNSPLITTER_CHROMIUM_BIN");
}

function playwrightIdentity(modulePath) {
  if (!modulePath) return { module: "playwright", version: "MODULE_RESOLVED" };
  try {
    const packageJson = JSON.parse(readFileSync(resolve(dirname(resolve(modulePath)), "package.json"), "utf8"));
    return { module: resolve(modulePath), version: packageJson.version || "UNKNOWN" };
  } catch {
    return { module: resolve(modulePath), version: "UNKNOWN" };
  }
}

function extractCanonicalPackage(archive, destination) {
  const entries = readCanonicalZip(archive);
  const rootPrefix = `${resolve(destination)}${sep}`;
  for (const entry of entries) {
    const target = resolve(destination, entry.path);
    if (!target.startsWith(rootPrefix)) throw new Error(`archive path escaped extraction root: ${entry.path}`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, entry.data);
  }
  return entries;
}

function startPackagedServer(packageRoot) {
  return new Promise((resolveReady, rejectReady) => {
    const child = spawn(process.execPath, [
      resolve(packageRoot, "PRIVATE_PHONE_SERVER.mjs"),
      "--host", "127.0.0.1",
      "--port", "0",
      "--json"
    ], { cwd: packageRoot, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      rejectReady(new Error(`private server did not become ready: ${stderr || stdout}`));
    }, 10_000);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.stdout.on("data", chunk => {
      stdout += chunk;
      const newline = stdout.indexOf("\n");
      if (settled || newline < 0) return;
      try {
        const ready = JSON.parse(stdout.slice(0, newline));
        const url = ready.urls && ready.urls[0];
        if (!url || !url.startsWith("http://127.0.0.1:")) throw new Error(`unexpected private URL: ${url}`);
        settled = true;
        clearTimeout(timer);
        resolveReady({ child, ready, url, stderr: () => stderr });
      } catch (error) {
        settled = true;
        clearTimeout(timer);
        child.kill("SIGTERM");
        rejectReady(error);
      }
    });
    child.once("error", error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectReady(error);
    });
    child.once("exit", code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectReady(new Error(`private server exited before ready (${code}): ${stderr || stdout}`));
    });
  });
}

async function stopServer(server) {
  if (!server || server.child.exitCode !== null) return;
  await new Promise(resolveDone => {
    const timer = setTimeout(() => { server.child.kill("SIGKILL"); resolveDone(); }, 5_000);
    server.child.once("exit", () => { clearTimeout(timer); resolveDone(); });
    server.child.kill("SIGTERM");
  });
}

function rawHttpStatus(baseUrl, path, method = "GET") {
  return new Promise((resolveStatus, rejectStatus) => {
    const base = new URL(baseUrl);
    const request = httpRequest({
      protocol: base.protocol,
      hostname: base.hostname,
      port: base.port,
      method,
      path
    }, response => {
      response.resume();
      response.on("end", () => resolveStatus(response.statusCode));
    });
    request.once("error", rejectStatus);
    request.end();
  });
}

async function serverContractChecks(baseUrl, manifest) {
  const oneImage = manifest.payloadFiles.find(file => file.mime === "image/jpeg")?.packagePath;
  assert.ok(oneImage, "package manifest has no image payload");
  for (const [path, mime] of [
    ["", "text/html"],
    ["css/style.css", "text/css"],
    ["src/engine.js", "text/javascript"],
    [oneImage, "image/jpeg"]
  ]) {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 200, `${path || "/"} did not return 200`);
    assert.ok((response.headers.get("content-type") || "").startsWith(mime), `${path || "/"} MIME drifted`);
    assert.equal(response.headers.get("cache-control"), "no-store", `${path || "/"} cache boundary drifted`);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer", `${path || "/"} referrer boundary drifted`);
    assert.match(response.headers.get("content-security-policy") || "", /default-src 'self'.*connect-src 'none'/);
    await response.arrayBuffer();
  }
  const head = await fetch(baseUrl, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal((await fetch(baseUrl, { method: "POST" })).status, 405);
  assert.equal((await fetch(new URL("PRIVATE_PACKAGE_MANIFEST.json", baseUrl))).status, 404);
  assert.equal((await fetch(new URL("PRIVATE_PHONE_PLAY.md", baseUrl))).status, 404);
  assert.equal((await fetch(new URL("PRIVATE_STORE_DRAFT.md", baseUrl))).status, 404);
  assert.equal((await fetch(new URL("PRIVATE_SUPPORT_DRAFT.md", baseUrl))).status, 404);
  assert.equal((await fetch(new URL("PRIVATE_PRIVACY_DRAFT.md", baseUrl))).status, 404);
  for (const path of [
    "/%2e%2e%2fPRIVATE_PHONE_PLAY.md",
    "/%5cPRIVATE_PHONE_PLAY.md",
    "/%00PRIVATE_PHONE_PLAY.md"
  ]) assert.equal(await rawHttpStatus(baseUrl, path), 404, `unsafe path was not denied: ${path}`);
}

function attachBrowserDiagnostics(page, baseOrigin, diagnostics) {
  page.on("pageerror", error => diagnostics.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("fonts.googleapis.com") && text.includes("Content Security Policy")) return;
    diagnostics.push(`console: ${text}`);
  });
  page.on("requestfailed", request => {
    if (new URL(request.url()).origin === baseOrigin) diagnostics.push(`request failed: ${request.url()} :: ${request.failure()?.errorText || "unknown"}`);
  });
  page.on("response", response => {
    if (new URL(response.url()).origin === baseOrigin && response.status() >= 400) diagnostics.push(`HTTP ${response.status()}: ${response.url()}`);
  });
}

async function installPrivateNetworkBoundary(context, allowedOrigins, externalAttempts) {
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.protocol === "data:" || url.protocol === "blob:" || allowedOrigins.has(url.origin)) return route.continue();
    externalAttempts.push(route.request().url());
    return route.abort("blockedbyclient");
  });
}

async function runDeviceProof({ browser, playwright, deviceName, url, alternateUrl }) {
  const device = playwright.devices[deviceName];
  if (!device) throw new Error(`unknown Playwright device profile: ${deviceName}`);
  if (device.defaultBrowserType !== "chromium") {
    throw new Error(`${deviceName} is a ${device.defaultBrowserType} profile; this verifier provides Chromium emulation only`);
  }
  const context = await browser.newContext({ ...device, serviceWorkers: "block" });
  await context.addInitScript(now => { Date.now = () => now; }, FIXED_NOW);
  const baseOrigin = new URL(url).origin;
  const alternateOrigin = new URL(alternateUrl).origin;
  assert.notEqual(alternateOrigin, baseOrigin);
  const externalAttempts = [];
  await installPrivateNetworkBoundary(context, new Set([baseOrigin, alternateOrigin]), externalAttempts);
  const diagnostics = [];
  try {
    const page = await context.newPage();
    attachBrowserDiagnostics(page, baseOrigin, diagnostics);
    const response = await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200);
    assert.equal(new URL(page.url()).origin, baseOrigin);
    const initial = await page.evaluate(() => ({
      errors: window.validateSunsplitter().errors,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      toneVisible: !document.getElementById("tone-screen").classList.contains("hidden")
    }));
    assert.deepEqual(initial.errors, []);
    assert.ok(initial.toneVisible, "content notice did not open");
    assert.ok(initial.scrollWidth <= initial.width, `initial horizontal overflow ${initial.scrollWidth} > ${initial.width}`);

    await page.getByRole("button", { name: "I understand — continue" }).click();
    await page.getByRole("button", { name: "Begin", exact: true }).click();
    const started = await page.evaluate(() => ({
      scene: state.scene,
      save: JSON.parse(localStorage.getItem("sunsplitter_save_v3")),
      staging: localStorage.getItem("sunsplitter_save_v3_staging"),
      backup: localStorage.getItem("sunsplitter_save_v3_backup")
    }));
    assert.equal(started.scene, "wake");
    assert.equal(started.save.v, 3);
    assert.equal(started.save.gameVersion, "0.33");
    assert.equal(started.save.scene, "wake");
    assert.equal(started.save.sceneEntered, true);
    assert.equal(started.staging, null);
    assert.equal(started.backup, null);

    const firstChoice = page.locator(".choice-btn:not(:disabled)").first();
    assert.match((await firstChoice.textContent()) || "", /^Sit up\. Take command\./);
    await firstChoice.click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.locator("#save-status").filter({ hasText: "Saved" }).waitFor({ state: "visible" });
    const saved = await page.evaluate(() => ({
      raw: localStorage.getItem("sunsplitter_save_v3"),
      scene: state.scene,
      cohesion: state.cohesion,
      staging: localStorage.getItem("sunsplitter_save_v3_staging"),
      backup: localStorage.getItem("sunsplitter_save_v3_backup")
    }));
    assert.equal(saved.scene, "intro_lena");
    assert.equal(saved.cohesion, 51);
    assert.equal(JSON.parse(saved.raw).scene, "intro_lena");
    assert.equal(saved.staging, null);
    assert.equal(saved.backup, null);

    const changedOrigin = await context.newPage();
    const changedOriginResponse = await changedOrigin.goto(alternateUrl, { waitUntil: "networkidle" });
    assert.equal(changedOriginResponse?.status(), 200);
    assert.equal(await changedOrigin.evaluate(() => localStorage.getItem("sunsplitter_save_v3")), null);
    assert.equal(await changedOrigin.getByRole("button", { name: "Continue", exact: true }).count(), 0);
    await changedOrigin.close();

    await page.close();
    const reopened = await context.newPage();
    attachBrowserDiagnostics(reopened, baseOrigin, diagnostics);
    const reopenResponse = await reopened.goto(url, { waitUntil: "networkidle" });
    assert.equal(reopenResponse?.status(), 200);
    assert.equal(await reopened.evaluate(() => localStorage.getItem("sunsplitter_save_v3")), saved.raw);
    await reopened.getByRole("button", { name: "Continue", exact: true }).waitFor({ state: "visible" });
    await reopened.getByRole("button", { name: "Continue", exact: true }).click();
    await reopened.locator("#save-status").filter({ hasText: "Resumed" }).waitFor({ state: "visible" });
    const resumed = await reopened.evaluate(() => ({
      raw: localStorage.getItem("sunsplitter_save_v3"),
      scene: state.scene,
      cohesion: state.cohesion,
      gameVisible: !document.getElementById("game-screen").classList.contains("hidden"),
      story: document.getElementById("story").textContent,
      status: {
        survivors: document.getElementById("stat-survivors").textContent,
        integrity: document.getElementById("stat-integrity").textContent,
        cohesion: document.getElementById("stat-cohesion").textContent,
        supplies: document.getElementById("stat-supplies").textContent,
        embryos: document.getElementById("stat-embryos").textContent
      },
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    assert.equal(resumed.raw, saved.raw);
    assert.equal(resumed.scene, "intro_lena");
    assert.equal(resumed.cohesion, 51);
    assert.equal(resumed.gameVisible, true);
    assert.match(resumed.story, /Dr\. Lena Voss does not waste words\./);
    assert.doesNotMatch(resumed.story, /Scene missing:/);
    assert.deepEqual(resumed.status, { survivors: "8", integrity: "62%", cohesion: "51%", supplies: "41%", embryos: "100%" });
    assert.ok(resumed.scrollWidth <= resumed.width, `resumed horizontal overflow ${resumed.scrollWidth} > ${resumed.width}`);
    const sizes = await reopened.locator(".choice-btn:not(:disabled)").evaluateAll(buttons => buttons.map(button => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    assert.ok(sizes.length > 0);
    assert.ok(sizes.every(size => size.width >= 48 && size.height >= 48), `touch target below 48px: ${JSON.stringify(sizes)}`);
    assert.deepEqual(externalAttempts, [], `off-origin request escaped package CSP: ${externalAttempts.join(", ")}`);
    assert.deepEqual(diagnostics, []);
    return {
      deviceProfile: deviceName,
      browserEngine: "chromium",
      emulationOnly: true,
      viewport: device.viewport,
      userAgent: device.userAgent,
      savedScene: saved.scene,
      savedCohesion: saved.cohesion,
      changedOriginIsolated: true,
      reopenedSameOrigin: true,
      continueResumed: true,
      minimumTouchTarget: sizes.reduce((minimum, size) => Math.min(minimum, size.height), Infinity)
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) {
    process.stdout.write("Usage: node scripts/verify-private-phone.mjs [--source <sha>] [--device <Playwright device>] [--playwright-module <index.mjs>] [--browser <executable>]\n");
    return;
  }
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "sunsplitter-private-phone-"));
  let server = null;
  let alternateServer = null;
  let browser = null;
  try {
    const archiveName = `sunsplitter-private-${options.sourceRef.slice(0, 8)}.zip`;
    const first = buildPrivatePackage({ sourceRef: options.sourceRef, outputPath: resolve(temporaryRoot, "first", archiveName) });
    const second = buildPrivatePackage({ sourceRef: options.sourceRef, outputPath: resolve(temporaryRoot, "second", archiveName) });
    const firstArchive = readFileSync(first.outputPath);
    const secondArchive = readFileSync(second.outputPath);
    assert.ok(firstArchive.equals(secondArchive), "exact-source package builds are not byte-identical");
    assert.equal(first.archiveSha256, sha256(firstArchive));
    assert.equal(first.archiveSha256, second.archiveSha256);
    const packageRoot = resolve(temporaryRoot, "extracted");
    mkdirSync(packageRoot, { recursive: true });
    const entries = extractCanonicalPackage(firstArchive, packageRoot);
    const manifest = JSON.parse(readFileSync(resolve(packageRoot, "PRIVATE_PACKAGE_MANIFEST.json"), "utf8"));
    assert.equal(manifest.sourceCommit, options.sourceRef);
    assert.equal(manifest.phoneResume.requiredOrigin, "STABLE_PRIVATE_HTTP_OR_HTTPS");
    assert.equal(manifest.phoneResume.publicHostRequired, false);
    assert.equal(manifest.phoneResume.directFileModeClaimed, false);

    const tamperedRoot = resolve(temporaryRoot, "tampered");
    mkdirSync(tamperedRoot, { recursive: true });
    extractCanonicalPackage(firstArchive, tamperedRoot);
    const tamperedPayloadPath = resolve(tamperedRoot, "src/engine.js");
    writeFileSync(tamperedPayloadPath, Buffer.concat([
      readFileSync(tamperedPayloadPath),
      Buffer.from("\n// deliberate verifier tamper\n", "utf8")
    ]));
    await assert.rejects(
      startPackagedServer(tamperedRoot),
      /package payload failed manifest verification: src\/engine\.js/,
      "private server accepted payload bytes that differ from the manifest"
    );

    server = await startPackagedServer(packageRoot);
    alternateServer = await startPackagedServer(packageRoot);
    assert.notEqual(new URL(server.url).origin, new URL(alternateServer.url).origin);
    assert.equal(server.ready.sourceCommit, options.sourceRef);
    await serverContractChecks(server.url, manifest);

    const playwright = await loadPlaywright(options.playwrightModule);
    const executablePath = findBrowser(options.browserPath);
    browser = await playwright.chromium.launch({ headless: true, executablePath });
    const devices = [];
    for (const deviceName of options.devices) devices.push(await runDeviceProof({ browser, playwright, deviceName, url: server.url, alternateUrl: alternateServer.url }));
    const playwrightInfo = playwrightIdentity(options.playwrightModule);
    const report = {
      result: "PASS",
      posture: "NO-PUBLISH / NOT_CERTIFIED",
      sourceCommit: options.sourceRef,
      sourceTree: first.sourceTree,
      archiveSha256: first.archiveSha256,
      archiveBytes: first.archiveBytes,
      archiveEntries: entries.length,
      runtimeFiles: first.runtimeFiles,
      originType: "LOOPBACK_HTTP_FROM_EXTRACTED_EXACT_PACKAGE",
      browserExecutable: executablePath,
      browserVersion: browser.version(),
      playwrightModule: playwrightInfo.module,
      playwrightVersion: playwrightInfo.version,
      tamperedPayloadRejected: true,
      deviceProofs: devices,
      privateTransferEvidence: "NOT_EXERCISED",
      physicalDeviceEvidence: "PHYSICAL_DEVICE_NOT_AVAILABLE"
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    if (browser) await browser.close();
    await stopServer(alternateServer);
    await stopServer(server);
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`PRIVATE PHONE VERIFY FAIL\n${error.stack || error.message}`);
  process.exitCode = 1;
});
