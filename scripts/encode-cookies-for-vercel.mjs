/**
 * Validates cookies.txt and writes a single-line base64 file for Vercel.
 * Usage: node scripts/encode-cookies-for-vercel.mjs ~/Desktop/youtube-min.txt
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/encode-cookies-for-vercel.mjs <cookies.txt>");
  process.exit(1);
}

const text = readFileSync(resolve(input), "utf-8").replace(/^\uFEFF/, "").trim();
const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
const valid = lines.filter((l) => {
  const p = l.split("\t");
  return p.length >= 7 && p[0].includes("youtube.com");
});

if (valid.length < 3) {
  console.error("ERROR: Not a valid YouTube Netscape cookies file.");
  console.error("Export youtube.com only, then run minify-youtube-cookies.mjs first.");
  process.exit(1);
}

const header = `# Netscape HTTP Cookie File
# https://curl.haxx.se/rfc/cookie_spec.html
# This is a generated file!  Do not edit.
`;
const normalized = (text.startsWith("#") ? text : header + "\n" + text) + "\n";
const b64 = Buffer.from(normalized, "utf-8").toString("base64");
const outPath = join(dirname(resolve(input)), "youtube-cookies.b64.txt");

writeFileSync(outPath, b64, "utf-8");

console.log("OK:", valid.length, "YouTube cookies");
console.log("Base64 size:", (b64.length / 1024).toFixed(1), "KB");
console.log("Written:", outPath);
console.log("\nNext:");
console.log("1. Open youtube-cookies.b64.txt in TextEdit (Plain Text)");
console.log("2. Cmd+A, Cmd+C (copy ALL — one line)");
console.log("3. Vercel → YOUTUBE_COOKIES_BASE64 → paste → Save → Redeploy");

if (b64.length > 900_000) {
  console.warn("\nWARNING: Still over ~900KB. Run minify-youtube-cookies.mjs first.");
}
