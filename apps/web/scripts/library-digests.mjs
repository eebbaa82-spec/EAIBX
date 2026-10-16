// Renders each library category in src/data/library/*.json to a PDF digest in public/downloads/library/.
// Run locally after updating the data: `npm run library-digests` (needs Playwright with Chromium).
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "src/data/library");
const outDir = path.join(root, "public/downloads/library");
mkdirSync(outDir, { recursive: true });

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {
    return require(path.join(execSync("npm root -g").toString().trim(), "playwright"));
  }
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const longDate = (d) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d)
    ? new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    : d;

function render(c) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.name)} · EABIX Digest</title><style>
body{font-family:"Inter","Helvetica Neue",Arial,sans-serif;color:#14212b;font-size:9.6pt;line-height:1.5;margin:0}
header{background:linear-gradient(140deg,#0a3329,#0f5242 60%,#1d7a5f);color:#fff;border-radius:3mm;padding:9mm 9mm 8mm;margin-bottom:5mm}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:12pt}
.brand i{font-style:normal;display:inline-flex;width:24px;height:24px;border-radius:6px;background:#cf9a2e;color:#0a3329;align-items:center;justify-content:center}
.eyebrow{color:#e9c46a;text-transform:uppercase;letter-spacing:1.5px;font-size:8pt;font-weight:700;margin:6mm 0 1.5mm}
h1{font-size:21pt;margin:0;line-height:1.15}
.meta{color:#d5ece2;font-size:8.5pt;margin-top:2mm}
p.intro{font-size:10.5pt;margin:0 0 4mm}
.doc{border:1px solid #d5ece2;border-radius:2.5mm;padding:4mm 4.5mm;margin-bottom:3.5mm;break-inside:avoid}
.tags span{display:inline-block;font-size:7.5pt;font-weight:700;border-radius:8px;padding:0.5mm 2mm;margin-right:1.5mm}
.t1{background:#eef7f3;color:#0f5242}.t2{background:#fbf1db;color:#14212b}
h2{font-size:11pt;margin:2mm 0 0.5mm}
.sub{color:#52606d;font-size:8.5pt;margin:0 0 2mm}
.doc p{margin:0 0 1.5mm}
.why{color:#52606d}
a{color:#156550;word-break:break-all;font-size:8pt}
.disclaimer{font-size:7.5pt;color:#8a96a3;border-top:1px solid #e4e8ec;margin-top:5mm;padding-top:2mm}
</style></head><body>
<header><div class="brand"><i>E</i>EABIX</div>
<div class="eyebrow">Regulations and research digest · Ethiopia</div>
<h1>${esc(c.name)}</h1>
<div class="meta">Updated ${esc(longDate(c.asOf))} · ${c.documents.length} documents · Each linked to the official original · Refreshed monthly</div></header>
<p class="intro">${esc(c.intro)}</p>
${c.documents
    .map(
      (d) => `<div class="doc"><div class="tags"><span class="t1">${esc(d.topic)}</span><span class="t2">${esc(d.status)}</span></div>
<h2>${esc(d.title)}</h2><p class="sub">${[d.number, d.issuer, longDate(d.date)].filter(Boolean).map(esc).join(" · ")}</p>
<p>${esc(d.summary)}</p><p class="why"><strong>Why it matters:</strong> ${esc(d.relevance)}</p>
<p>Original: <a href="${esc(d.url)}">${esc(d.url)}</a> (accessed ${esc(d.accessed)})</p></div>`,
    )
    .join("")}
<p class="disclaimer">Prepared by Erudite Africa Investments PLC for EABIX, Addis Ababa · contact@ebba.et. Summaries help you find and understand official documents; they are not legal advice and do not replace the original text. Laws and directives change often, so check the original and take professional advice before acting.</p>
</body></html>`;
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
for (const file of readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const c = JSON.parse(readFileSync(path.join(dataDir, file), "utf8"));
  const htmlPath = path.join(outDir, `${c.slug}.html`);
  writeFileSync(htmlPath, render(c));
  await page.goto("file://" + htmlPath);
  await page.pdf({
    path: path.join(outDir, `EABIX-Digest-${c.slug}.pdf`),
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:7pt;color:#8a96a3;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>EABIX Digest · ${esc(c.name)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
  });
  rmSync(htmlPath);
  console.log("rendered", c.slug);
}
await browser.close();
