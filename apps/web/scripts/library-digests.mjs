// Renders each library category in src/data/library/*.json to two PDF digests:
// - public edition (summaries, no links) in public/downloads/library/
// - member edition (with links to every original) in member-downloads/library/ (not served publicly)
// Run locally after updating the data: `npm run library-digests` (needs Playwright with Chromium).
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { documentHtml, esc, loadPlaywright, longDate, membersBox, renderPdf } from "./pdf-kit.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "src/data/library");
const outDirs = { public: path.join(root, "public/downloads/library"), member: path.join(root, "member-downloads/library") };
Object.values(outDirs).forEach((d) => mkdirSync(d, { recursive: true }));

function body(c, edition) {
  return [
    `<h2><span>—</span>Overview</h2><p class="summary">${esc(c.intro)}</p>`,
    `<h2><span>01</span>Documents in this digest (${c.documents.length})</h2>`,
    c.documents
      .map(
        (d) => `<div class="card"><div class="tags"><span class="t1">${esc(d.topic)}</span><span class="t2">${esc(d.status)}</span></div>
<h3>${esc(d.title)}</h3><p class="sub">${[d.number, d.issuer, longDate(d.date)].filter(Boolean).map(esc).join(" · ")}</p>
<p>${esc(d.summary)}</p><p class="why"><strong>Why it matters:</strong> ${esc(d.relevance)}</p>
${edition === "member" ? `<p class="sub">Original document: <a href="${esc(d.url)}">${esc(d.url)}</a> (accessed ${esc(d.accessed)})</p>` : ""}</div>`,
      )
      .join(""),
    edition === "member" ? "" : membersBox("digest").replace("The full list of sources, with document titles, dates, page references and direct links,", "Direct links to every original document are"),
  ].join("\n");
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
for (const file of readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const c = JSON.parse(readFileSync(path.join(dataDir, file), "utf8"));
  for (const edition of ["public", "member"]) {
    const doc = documentHtml({
      title: c.name,
      kicker: "Regulations and research digest · Ethiopia",
      lede: "Plain-English summaries of the official documents that shape investing in Ethiopia, with what each one means for investors and businesses.",
      edition,
      asOf: c.asOf,
      body: body(c, edition),
    });
    const base = `Kenna-Digest-${c.slug}${edition === "member" ? "-member" : ""}`;
    const htmlPath = path.join(outDirs[edition], `${base}.html`);
    await renderPdf(page, doc, htmlPath, path.join(outDirs[edition], `${base}.pdf`), `Digest · ${c.name}`, writeFileSync);
    rmSync(htmlPath);
  }
  console.log("rendered", c.slug);
}
await browser.close();
