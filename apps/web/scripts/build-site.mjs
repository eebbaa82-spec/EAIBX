// Builds an upload zip for one of the two sites made from this code:
//
//   node scripts/build-site.mjs coe <zip>          the course site, Erudite Africa
//                                                  Center of Excellence (eruditeafrica.et)
//   node scripts/build-site.mjs kenna <zip>        www.kenna.et, with its Academy pages
//                                                  redirected to eruditeafrica.et
//
// Each zip holds the static site and its .htaccess, ready to extract into
// public_html in cPanel File Manager.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [site, zipArg] = process.argv.slice(2);
if (!["coe", "kenna"].includes(site) || !zipArg) {
  console.error("Usage: node scripts/build-site.mjs coe|kenna <output.zip>");
  process.exit(1);
}
const zip = resolve(zipArg);
const out = join(root, "out");

execSync("npx next build", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_ALLOW_INDEXING: "true", NEXT_PUBLIC_SITE: site === "coe" ? "coe" : "" },
});

let htaccess = readFileSync(join(out, ".htaccess"), "utf8");

if (site === "coe") {
  // The course site serves only the Academy; everything else lives on kenna.et.
  const keep = new Set(["academy", "am", "_next", "api", "404.html", "404", "robots.txt", "sitemap.xml", "favicon.ico", ".htaccess"]);
  for (const entry of readdirSync(out)) if (!keep.has(entry)) rmSync(join(out, entry), { recursive: true, force: true });
  for (const entry of readdirSync(join(out, "am"))) if (entry !== "academy") rmSync(join(out, "am", entry), { recursive: true, force: true });
  // Kenna Ventures' own server files stay on kenna.et.
  for (const f of ["identity.php", "_identity-codes.php"]) rmSync(join(out, "api", f), { force: true });
  htaccess = htaccess
    .replace("the address the certificate covers (www.kenna.et).\n  # Other names this site answers to (kenna.et, investopia.et) redirect there.", "the address the certificate covers (eruditeafrica.et, no www).")
    .replace("RewriteCond %{HTTP_HOST} !^www\\.kenna\\.et$ [NC]", "RewriteCond %{HTTP_HOST} !^eruditeafrica\\.et$ [NC]")
    .replace("RewriteRule ^ https://www.kenna.et%{REQUEST_URI} [R=301,L]", [
      "RewriteRule ^ https://eruditeafrica.et%{REQUEST_URI} [R=301,L]",
      "  # The home page is the Academy.",
      "  RewriteRule ^$ /academy/ [R=302,L]",
      "  # Pages outside the Academy belong to Kenna Ventures.",
      "  RewriteCond %{REQUEST_URI} !^/(academy|am/academy|_next|api|404|404\\.html|robots\\.txt|sitemap\\.xml|favicon\\.ico)(/|$)",
      "  RewriteRule ^ https://www.kenna.et%{REQUEST_URI} [R=301,L]",
    ].join("\n"));
} else {
  htaccess = htaccess.replace("RewriteRule ^ https://www.kenna.et%{REQUEST_URI} [R=301,L]", [
    "RewriteRule ^ https://www.kenna.et%{REQUEST_URI} [R=301,L]",
    "  # The courses moved to the Erudite Africa Center of Excellence.",
    "  RewriteRule ^(am/)?academy(/.*)?$ https://eruditeafrica.et/$1academy$2 [R=301,L]",
  ].join("\n"));
}
if (!htaccess.includes(site === "coe" ? "eruditeafrica\\.et$" : "eruditeafrica.et/$1academy")) throw new Error(".htaccess rewrite did not apply");
writeFileSync(join(out, ".htaccess"), htaccess);

if (existsSync(zip)) rmSync(zip);
execSync(`zip -qr "${zip}" .`, { cwd: out, stdio: "inherit" });
const dist = join(root, `out-${site}`);
rmSync(dist, { recursive: true, force: true });
cpSync(out, dist, { recursive: true });
console.log(`Wrote ${zip} (site also kept in ${dist})`);
