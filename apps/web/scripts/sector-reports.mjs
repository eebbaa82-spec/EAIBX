// Renders each sector fact file in src/data/sectors/*.json to two PDFs:
// - public edition (no references) in public/downloads/sectors/
// - member edition (full references) in member-downloads/sectors/ (not served publicly)
// Run locally after updating the data: `npm run sector-reports` (needs Playwright with Chromium).
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { documentHtml, esc, loadPlaywright, membersBox, renderPdf } from "./pdf-kit.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "src/data/sectors");
const outDirs = { public: path.join(root, "public/downloads/sectors"), member: path.join(root, "member-downloads/sectors") };
Object.values(outDirs).forEach((d) => mkdirSync(d, { recursive: true }));

function table(head, rows) {
  if (!rows.length) return "";
  return `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

// Public edition drops pinpoint references such as "(para. 28)" or "(Table 5, Section II.C)".
const stripRefs = (t, edition) =>
  edition === "member" ? t : t.replace(/\s*\((?:[^()]*\b(?:para|paras|Section|Table|Box|p\.|pp\.|Annex|footnote)\b[^()]*)\)/gi, "");

function body(r, edition) {
  const order = new Map(r.sources.map((s, i) => [s.id, i + 1]));
  const ref = (id) => (edition === "member" && order.has(id) ? `<sup>[${order.get(id)}]</sup>` : "");
  const items = (list) =>
    `<ul class="items">${list.map((x) => `<li>${x.title ? `<strong>${esc(x.title)}.</strong> ` : ""}${esc(x.detail)}${ref(x.source)}</li>`).join("")}</ul>`;
  let n = 0;
  const h = (t) => `<h2><span>${String(++n).padStart(2, "0")}</span>${esc(t)}</h2>`;
  const glance = r.indicators.slice(0, 4).map((i) => `<div><b>${esc(i.label)}</b><span>${esc(i.value)}</span></div>`).join("");
  return [
    `<h2><span>—</span>Executive summary</h2><p class="summary">${esc(r.summary)}</p>`,
    glance ? `<div class="glance">${glance}</div>` : "",
    r.indicators.length
      ? h("Key indicators") + table(["Indicator", "Value", "Period"], r.indicators.map((i) => [esc(i.label), `<strong>${esc(i.value)}</strong>${ref(i.source)}`, esc(i.period)]))
      : "",
    h("Returns and yields") +
      table(["Measure", "Value", "Period", "Basis"], r.returns.map((x) => [esc(x.label), `<strong>${esc(x.value)}</strong>${ref(x.source)}`, esc(x.period), esc(stripRefs(x.basis, edition))])) +
      (r.returnsNote ? `<div class="note just">${esc(r.returnsNote)}</div>` : ""),
    r.opportunities.length ? h("Investment opportunities") + items(r.opportunities) : "",
    r.incentives.length ? h("Incentives") + items(r.incentives) : "",
    h("Points to consider") +
      (r.risks.length ? items(r.risks) : "") +
      `<div class="note just">A detailed risk and outlook assessment for a specific business or investment is part of Erudite Africa Connect's analyst due diligence. Contact us to arrange one.</div>`,
    edition === "member"
      ? h("Sources") +
        `<ol class="sources">${r.sources
          .map((s) => `<li>${esc(s.publisher)}, <em>${esc(s.title)}</em> (${esc(s.date)})${s.location ? `, ${esc(s.location)}` : ""}. ${esc(s.url)} (accessed ${esc(s.accessed)})</li>`)
          .join("")}</ol>`
      : membersBox("report"),
  ].join("\n");
}

const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
for (const file of files) {
  const r = JSON.parse(readFileSync(path.join(dataDir, file), "utf8"));
  for (const edition of ["public", "member"]) {
    const doc = documentHtml({
      title: r.name,
      kicker: "Sector investment report · Ethiopia",
      lede: "Opportunities, published returns and incentives, drawn exclusively from reports by international institutions and the Government of Ethiopia.",
      edition,
      asOf: r.asOf,
      body: body(r, edition),
    });
    const base = `Erudite-Connect-Sector-Report-${r.slug}${edition === "member" ? "-member" : ""}`;
    const htmlPath = path.join(outDirs[edition], `${base}.html`);
    await renderPdf(page, doc, htmlPath, path.join(outDirs[edition], `${base}.pdf`), `Sector Report · ${r.name}`, writeFileSync);
    rmSync(htmlPath);
  }
  console.log("rendered", r.slug);
}
await browser.close();
