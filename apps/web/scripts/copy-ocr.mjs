// Copies the OCR engine and English language data into public/vendor/ocr, so the
// credit analysis workspace reads scanned statements without calling a CDN.
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const out = path.join("public", "vendor", "ocr");
mkdirSync(out, { recursive: true });
const files = [
  ["node_modules/tesseract.js/dist/worker.min.js", "worker.min.js"],
  ["node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js"],
  ["node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js", "tesseract-core-lstm.wasm.js"],
  ["node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"],
  ["node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz", "eng.traineddata.gz"],
];
for (const [from, to] of files) copyFileSync(from, path.join(out, to));
console.log(`Copied ${files.length} OCR files to ${out}`);
