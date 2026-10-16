// Renders each sector fact file in src/data/sectors/*.json to a PDF in public/downloads/sectors/.
// Run locally after updating the data: `npm run sector-reports` (needs Playwright with Chromium).
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "src/data/sectors");
const outDir = path.join(root, "public/downloads/sectors");
mkdirSync(outDir, { recursive: true });

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {
    const globalRoot = execSync("npm root -g").toString().trim();
    return require(path.join(globalRoot, "playwright"));
  }
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const longDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function sourceIndex(report) {
  const order = new Map(report.sources.map((s, i) => [s.id, i + 1]));
  return (id) => (order.has(id) ? `<sup>[${order.get(id)}]</sup>` : "");
}

function table(head, rows) {
  if (!rows.length) return "";
  return `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function render(report) {
  const ref = sourceIndex(report);
  const items = (list) =>
    list.length
      ? `<ul>${list.map((x) => `<li>${x.title ? `<strong>${esc(x.title)}.</strong> ` : ""}${esc(x.detail)}${ref(x.source)}</li>`).join("")}</ul>`
      : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(report.name)} · EABIX Sector Report</title><style>
@page{size:A4;margin:16mm 16mm 18mm}
body{font-family:"Inter","Helvetica Neue",Arial,sans-serif;color:#14212b;font-size:9.8pt;line-height:1.5;margin:0}
header{background:linear-gradient(140deg,#0a3329,#0f5242 60%,#1d7a5f);color:#fff;border-radius:3mm;padding:9mm 9mm 8mm;margin-bottom:6mm}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:12pt}
.brand i{font-style:normal;display:inline-flex;width:24px;height:24px;border-radius:6px;background:#cf9a2e;color:#0a3329;align-items:center;justify-content:center}
.eyebrow{color:#e9c46a;text-transform:uppercase;letter-spacing:1.5px;font-size:8pt;font-weight:700;margin:6mm 0 1.5mm}
h1{font-size:22pt;margin:0;line-height:1.15}
.meta{color:#d5ece2;font-size:8.5pt;margin-top:2mm}
h2{color:#0f5242;font-size:12.5pt;margin:6mm 0 2mm;break-after:avoid}
p.summary{font-size:11pt;margin:0 0 2mm}
table{width:100%;border-collapse:collapse;font-size:9pt;margin:1mm 0 2mm;break-inside:auto}
th{text-align:left;background:#eef7f3;color:#0f5242;padding:1.8mm 2mm;font-weight:700}
td{padding:1.8mm 2mm;border-bottom:1px solid #e4e8ec;vertical-align:top}
tr{break-inside:avoid}
ul{margin:0;padding-left:5mm}li{margin-bottom:1.5mm}
sup{color:#156550;font-weight:700;font-size:7pt}
.note{background:#fbf1db;border-left:3px solid #cf9a2e;padding:2.5mm 3mm;border-radius:1.5mm;margin:2mm 0}
.sources li{font-size:8pt;color:#52606d;word-break:break-word}
.disclaimer{font-size:7.5pt;color:#8a96a3;border-top:1px solid #e4e8ec;margin-top:6mm;padding-top:2mm}
</style></head><body>
<header><div class="brand"><i>E</i>EABIX</div>
<div class="eyebrow">Sector investment report · Ethiopia</div>
<h1>${esc(report.name)}</h1>
<div class="meta">Updated ${esc(longDate(report.asOf))} · Figures only from international institutions and the Ethiopian government · Refreshed monthly</div></header>
<p class="summary">${esc(report.summary)}</p>
${report.indicators.length ? `<h2>Key indicators</h2>${table(["Indicator", "Value", "Period"], report.indicators.map((i) => [esc(i.label), `<strong>${esc(i.value)}</strong>${ref(i.source)}`, esc(i.period)]))}` : ""}
<h2>Returns and yields</h2>
${table(["Measure", "Value", "Period", "What it measures"], report.returns.map((r) => [esc(r.label), `<strong>${esc(r.value)}</strong>${ref(r.source)}`, esc(r.period), esc(r.basis)]))}
${report.returnsNote ? `<div class="note">${esc(report.returnsNote)}</div>` : ""}
${report.opportunities.length ? `<h2>Investment opportunities</h2>${items(report.opportunities)}` : ""}
${report.incentives.length ? `<h2>Incentives</h2>${items(report.incentives)}` : ""}
${report.risks.length ? `<h2>Risks to consider</h2>${items(report.risks)}` : ""}
<h2>Sources</h2>
<ol class="sources">${report.sources
    .map((s) => `<li>${esc(s.publisher)}, <em>${esc(s.title)}</em> (${esc(s.date)})${s.location ? `, ${esc(s.location)}` : ""}. ${esc(s.url)} (accessed ${esc(s.accessed)})</li>`)
    .join("")}</ol>
<p class="disclaimer">Prepared by Erudite Africa Investments PLC for EABIX (Erudite Africa Business &amp; Investment Exchange), Addis Ababa · contact@ebba.et. This report summarizes published information for general guidance only. It is not investment advice or an offer of securities, and past or reported returns do not guarantee future results. Figures are reproduced as published by the sources listed; check the original documents before making decisions.</p>
</body></html>`;
}

const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
for (const file of files) {
  const report = JSON.parse(readFileSync(path.join(dataDir, file), "utf8"));
  const html = render(report);
  const htmlPath = path.join(outDir, `${report.slug}.html`);
  writeFileSync(htmlPath, html);
  await page.goto("file://" + htmlPath);
  await page.pdf({
    path: path.join(outDir, `EABIX-Sector-Report-${report.slug}.pdf`),
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:7pt;color:#8a96a3;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>EABIX Sector Report · ${esc(report.name)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
  });
  console.log("rendered", report.slug);
}
await browser.close();
// Keep only the PDFs in the published folder.
for (const file of files) {
  const slug = JSON.parse(readFileSync(path.join(dataDir, file), "utf8")).slug;
  execSync(`rm -f "${path.join(outDir, slug + ".html")}"`);
}
