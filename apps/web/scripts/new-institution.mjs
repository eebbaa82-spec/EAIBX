// Signs up a bank or MFI for an institutional Academy subscription.
// Usage: node scripts/new-institution.mjs <ID> "<Name>" <seats> <expires YYYY-MM-DD>
// Prints the training department's admin key (send it to them privately; it is
// not stored anywhere) and adds the institution to public/api/_institutions.php.
import { createHash, randomInt } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [id, name, seats, expires] = process.argv.slice(2);
if (!/^[A-Z0-9-]{2,40}$/.test(id ?? "") || !name || !(Number(seats) > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(expires ?? "")) {
  console.error('Usage: node scripts/new-institution.mjs BANK-A "Bank A" 50 2027-12-31');
  process.exit(1);
}
const file = new URL("../public/api/_institutions.php", import.meta.url);
const php = readFileSync(file, "utf8");
if (php.includes(`'${id}' =>`)) {
  console.error(`${id} is already listed in _institutions.php`);
  process.exit(1);
}
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const block = () => Array.from({ length: 5 }, () => alphabet[randomInt(32)]).join("");
const key = `ADM-${block()}-${block()}-${block()}-${block()}`;
const hash = createHash("sha256").update(key).digest("hex");
const entry = `    '${id}' => ['name' => '${name.replace(/'/g, "\\'")}', 'seats' => ${Number(seats)}, 'expires' => '${expires}', 'key_hash' => '${hash}'],\n`;
writeFileSync(file, php.replace("];\n", entry + "];\n"));
console.log(`Added ${id} (${name}), ${seats} seats until ${expires}.`);
console.log(`Admin key for the training department: ${key}`);
