import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-CACHE-BUST-FOLLOW-02 — residual paint/cache honesty after PR197.
export function playtestCacheBustFollow02Checks() {
  const errors = [];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_CACHE_BUST_FOLLOW_02.md");
  if (!existsSync(note)) errors.push("cache-bust honesty note missing");
  const version = readFileSync(resolve(ROOT, "VERSION.md"), "utf8");
  if (!version.startsWith("0.33\n")) errors.push("VERSION.md first line is not 0.33");
  if (version.includes("0.36")) errors.push("VERSION.md invented 0.36 paint");
  const state = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  if (!state.includes('const VERSION = "0.33"')) errors.push("state.js VERSION is not 0.33");
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!index.includes(">v0.33</div>")) errors.push("title subtitle lost v0.33");
  if (/href="css\/[^"?]+\?v=/.test(index) || /src="src\/[^"?]+\?v=/.test(index)) {
    errors.push("index invented a cache-bust query that claims a newer mint");
  }
  const netlify = readFileSync(resolve(ROOT, "netlify.toml"), "utf8");
  if (!netlify.includes('ignore = "exit 0"')) errors.push("netlify ignore-exit-0 lock missing");
  return errors;
}
