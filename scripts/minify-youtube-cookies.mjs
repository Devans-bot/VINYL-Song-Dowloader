/**
 * Keeps only YouTube auth cookies (small enough for Vercel env vars).
 * Usage: node scripts/minify-youtube-cookies.mjs ~/Desktop/cookies.txt
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/minify-youtube-cookies.mjs <cookies.txt>");
  process.exit(1);
}

const KEEP_NAMES = new Set([
  "SID",
  "HSID",
  "SSID",
  "APISID",
  "SAPISID",
  "LOGIN_INFO",
  "VISITOR_INFO1_LIVE",
  "YSC",
  "PREF",
  "__Secure-1PSID",
  "__Secure-3PSID",
  "__Secure-1PAPISID",
  "__Secure-3PAPISID",
  "__Secure-1PSIDTS",
  "__Secure-3PSIDTS",
  "__Secure-1PSIDCC",
  "__Secure-3PSIDCC",
  "__Secure-YNID",
]);

const raw = readFileSync(resolve(input), "utf-8");
const lines = raw.split("\n");
const header = lines.filter((l) => l.startsWith("#") || l.trim() === "");
const dataLines = lines.filter((l) => l.trim() && !l.startsWith("#"));

const kept = dataLines.filter((line) => {
  const parts = line.split("\t");
  if (parts.length < 7) return false;
  const domain = parts[0];
  const name = parts[5];
  const isYoutube = domain.includes("youtube.com");
  return isYoutube && KEEP_NAMES.has(name);
});

const out = [...header, ...kept].join("\n") + "\n";
const outPath = join(dirname(resolve(input)), "youtube-min.txt");
writeFileSync(outPath, out);

const kb = (Buffer.byteLength(out, "utf-8") / 1024).toFixed(1);
const b64Len = Buffer.from(out, "utf-8").toString("base64").length;

console.log(`Wrote ${outPath}`);
console.log(`Cookies kept: ${kept.length} / ${dataLines.length}`);
console.log(`File size: ${kb} KB | Base64 length: ${(b64Len / 1024).toFixed(1)} KB`);

if (b64Len > 900_000) {
  console.warn("WARNING: Still large for Vercel. Export youtube.com only, not all sites.");
} else {
  console.log("OK for Vercel env var. Run:");
  console.log(`  base64 -i "${outPath}" | tr -d '\\n' | pbcopy`);
}
