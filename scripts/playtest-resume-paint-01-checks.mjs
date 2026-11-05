// SUN-V036-RESUME-PAINT-01
import fs from "fs";
const eng = fs.readFileSync("src/engine.js", "utf8");
const st = fs.readFileSync("src/state.js", "utf8");
const ver = fs.readFileSync("VERSION.md", "utf8").split("\n")[0].trim();
let fail = 0;
function need(c, m) { if (!c) { console.error("FAIL", m); fail = 1; } }
need(ver === "0.36", "VERSION.md first line 0.36 got " + ver);
need(st.includes('const VERSION = "0.36"'), "state VERSION 0.36");
need(eng.includes('data-paint'), "resumeMeta data-paint");
need(eng.includes('v" + paint'), "resumeMeta paint prefix");
if (fail) process.exit(1);
console.log("RESUME_PAINT_OK");
