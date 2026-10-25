// Shared layout for Kenna Ventures PDF reports: cover page, typography and the two editions.
// Public edition: no source references. Member edition: full references and links,
// written outside public/ so it is never served openly (it is for signed-in members).
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

export function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {
    return require(path.join(execSync("npm root -g").toString().trim(), "playwright"));
  }
}

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const longDate = (d) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d || "")
    ? new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    : d || "";

const css = `
@page{size:A4;margin:20mm 18mm 20mm}
@page cover{margin:0}
.cover{page:cover}
*{box-sizing:border-box}
body{font-family:"Inter","Helvetica Neue",Arial,sans-serif;color:#1c2833;font-size:9.8pt;line-height:1.55;margin:0}
p,li,.just{text-align:justify;hyphens:auto;-webkit-hyphens:auto}
.cover{width:210mm;height:297mm;background:linear-gradient(150deg,#08291f 0%,#0f5242 55%,#1d7a5f 100%);color:#fff;padding:24mm 22mm;display:flex;flex-direction:column;page-break-after:always;position:relative;overflow:hidden}
.cover:after{content:"";position:absolute;right:-40mm;top:60mm;width:150mm;height:150mm;border-radius:50%;border:1px solid rgba(233,196,106,.25)}
.mark{display:flex;align-items:center;gap:10px;font-weight:800;font-size:15pt;letter-spacing:.5px}
.mark i{font-style:normal;display:inline-flex;width:30px;height:30px;border-radius:7px;background:#cf9a2e;color:#08291f;align-items:center;justify-content:center}
.cover .kicker{margin-top:70mm;color:#e9c46a;text-transform:uppercase;letter-spacing:2.5px;font-size:9pt;font-weight:700}
.cover h1{font-size:32pt;line-height:1.1;margin:5mm 0 6mm;font-weight:800;max-width:150mm}
.cover .rule{width:30mm;height:1.2mm;background:#cf9a2e;margin-bottom:6mm}
.cover .lede{font-size:11.5pt;color:#d5ece2;max-width:145mm;text-align:left}
.cover .edition{display:inline-block;margin-top:8mm;border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:1.5mm 4mm;font-size:8.5pt;letter-spacing:1px;text-transform:uppercase}
.cover .foot{margin-top:auto;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.25);padding-top:5mm;font-size:8.5pt;color:#d5ece2}
h2{font-size:13pt;color:#0f5242;margin:8mm 0 3mm;padding-bottom:1.5mm;border-bottom:1.5px solid #d5ece2;break-after:avoid;font-weight:700}
h2 span{color:#cf9a2e;margin-right:2.5mm}
h3{font-size:10.5pt;margin:0 0 1mm;color:#1c2833;break-after:avoid}
.summary{font-size:10.6pt;line-height:1.6;margin:0 0 5mm}
.glance{display:grid;grid-template-columns:repeat(2,1fr);gap:3.5mm;margin:2mm 0 4mm}
.glance div{background:#eef7f3;border-left:3px solid #0f5242;border-radius:1.5mm;padding:3mm 3.5mm;break-inside:avoid}
.glance b{display:block;font-size:7.5pt;text-transform:uppercase;letter-spacing:.8px;color:#52606d;margin-bottom:1mm}
.glance span{font-weight:700;color:#0a3329;font-size:9.6pt}
table{width:100%;border-collapse:collapse;font-size:9pt;margin:1mm 0 3mm}
thead th{text-align:left;background:#0f5242;color:#fff;padding:2mm 2.5mm;font-weight:600}
tbody td{padding:2mm 2.5mm;border-bottom:1px solid #e4e8ec;vertical-align:top}
tbody tr:nth-child(even) td{background:#f8faf9}
tr{break-inside:avoid}
ul.items{margin:0;padding-left:5mm}
ul.items li{margin-bottom:2mm}
sup{color:#156550;font-weight:700;font-size:6.8pt}
.note{background:#fbf1db;border-left:3px solid #cf9a2e;padding:3mm 3.5mm;border-radius:1.5mm;margin:2mm 0 3mm;font-size:9.2pt}
.members{text-align:justify;border:1px dashed #1d7a5f;background:#f4faf7;border-radius:2mm;padding:4mm;margin-top:4mm;font-size:9.2pt}
.members strong{color:#0f5242}
ol.sources li{font-size:8pt;color:#52606d;text-align:left;margin-bottom:1.2mm;word-break:break-word}
.card{border:1px solid #d5ece2;border-radius:2mm;padding:4mm 4.5mm;margin-bottom:3.5mm;break-inside:avoid}
.card .tags span{display:inline-block;font-size:7.3pt;font-weight:700;border-radius:8px;padding:.4mm 2mm;margin-right:1.5mm}
.t1{background:#eef7f3;color:#0f5242}.t2{background:#fbf1db;color:#1c2833}
.card .sub{color:#52606d;font-size:8.4pt;margin:.5mm 0 2mm;text-align:left}
.card p{margin:0 0 1.5mm}
.card .why{color:#3d4b57}
.card a{color:#156550;font-size:8pt;word-break:break-all}
.disclaimer{font-size:7.4pt;color:#8a96a3;border-top:1px solid #e4e8ec;margin-top:7mm;padding-top:2.5mm}
`;

export function documentHtml({ title, kicker, lede, edition, asOf, body }) {
  const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)} · Kenna Ventures</title><style>${css}</style></head><body>`;
  const editionLabel = edition === "member" ? "Member edition · with full references" : "Public edition";
  const cover = `${head}<section class="cover"><div class="mark"><i>KV</i>Kenna Ventures</div>
<div class="kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><div class="rule"></div>
<p class="lede">${esc(lede)}</p><div><span class="edition">${editionLabel}</span></div>
<div class="foot"><span>Kenna Ventures · Powering Smarter Business Decisions<br>Erudite Africa Investments PLC · Addis Ababa</span><span style="text-align:right">Updated ${esc(longDate(asOf))}<br>Refreshed monthly</span></div></section></body></html>`;
  const main = `${head}${body}
<p class="disclaimer">Prepared by Erudite Africa Investments PLC for Kenna Ventures, Addis Ababa · info@kenna.et · Registration no. MT/AA/2/0063282/2018. This publication summarizes information published by international institutions and the Government of Ethiopia for general guidance only. It is not investment, legal or tax advice, nor an offer of securities. Reported returns do not guarantee future results. Verify figures against the original documents before making decisions.</p>
</body></html>`;
  return { cover, main };
}

export const membersBox = (what) =>
  `<div class="members"><strong>References for members.</strong> Every figure and statement in this ${what} is drawn from documents published by international institutions and the Government of Ethiopia. The full list of sources, with document titles, dates, page references and direct links, is included in the member edition, available free to registered Kenna Ventures members on the platform.</div>`;

export async function renderPdf(page, doc, htmlPath, pdfPath, footerLabel, writeFileSync) {
  const coverPdf = pdfPath + ".cover.pdf";
  const mainPdf = pdfPath + ".main.pdf";
  writeFileSync(htmlPath, doc.cover);
  await page.goto("file://" + htmlPath);
  await page.pdf({ path: coverPdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  writeFileSync(htmlPath, doc.main);
  await page.goto("file://" + htmlPath);
  await page.pdf({
    path: mainPdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:6.8pt;color:#8a96a3;width:100%;padding:0 18mm;display:flex;justify-content:space-between;font-family:Helvetica,Arial"><span style="color:#0f5242;font-weight:700">Kenna Ventures</span><span>${esc(footerLabel)}</span></div>`,
    footerTemplate: `<div style="font-size:6.8pt;color:#8a96a3;width:100%;padding:0 18mm;display:flex;justify-content:space-between;font-family:Helvetica,Arial"><span>© 2026 Erudite Africa Investments PLC</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });
  // Join cover and body (needs Python with pypdf).
  execSync(
    `python3 -c "import sys,pypdf;w=pypdf.PdfWriter();[w.append(f) for f in sys.argv[1:3]];w.write(sys.argv[3])" "${coverPdf}" "${mainPdf}" "${pdfPath}"`,
  );
  rmSync(coverPdf);
  rmSync(mainPdf);
}
