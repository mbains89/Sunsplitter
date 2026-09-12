// SUN-V036-WHAT-REMAINS-ENTRY-01
import fs from "fs";
const html = fs.readFileSync("index.html", "utf8");
const eng = fs.readFileSync("src/engine.js", "utf8");
const css = fs.readFileSync("css/style.css", "utf8");
let fail = 0;
function need(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    fail = 1;
  }
}
need(html.includes('id="btn-what-remains"'), "btn-what-remains");
need(html.includes('id="ending-next-hint"'), "ending-next-hint");
need(html.includes("showWhatRemains()"), "onclick showWhatRemains");
need(eng.includes("What remains of this run is thin"), "empty-facts fallback");
need(eng.includes('what-remains-heading'), "focus heading");
need(css.includes("ending-next-hint"), "css hint");
if (fail) process.exit(1);
console.log("WHAT_REMAINS_ENTRY_OK");
