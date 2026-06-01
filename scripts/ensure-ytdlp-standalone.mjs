/**
 * Downloads the standalone yt-dlp Linux binary (no Python required).
 * Runs on Vercel/Linux builds so serverless downloads work.
 */
import { chmod, mkdir, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";

const BIN_DIR = join(process.cwd(), "bin");
const OUT_PATH = join(BIN_DIR, "yt-dlp");
const RELEASE_API = "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest";

const isLinux = process.platform === "linux";
const isVercel = process.env.VERCEL === "1";

if (!isLinux && !isVercel) {
  console.log("[yt-dlp] Skipping standalone download (local dev uses system yt-dlp).");
  process.exit(0);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadStandalone() {
  console.log("[yt-dlp] Fetching latest standalone Linux binary...");

  const res = await fetch(RELEASE_API, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "vinyl-downloader" },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const release = await res.json();
  const asset = release.assets?.find((a) => a.name === "yt-dlp_linux");

  if (!asset?.browser_download_url) {
    throw new Error("yt-dlp_linux asset not found in latest release");
  }

  const binRes = await fetch(asset.browser_download_url);
  if (!binRes.ok) {
    throw new Error(`Download failed: ${binRes.status}`);
  }

  await mkdir(BIN_DIR, { recursive: true });
  await pipeline(binRes.body, createWriteStream(OUT_PATH));
  await chmod(OUT_PATH, 0o755);

  console.log("[yt-dlp] Standalone binary ready at bin/yt-dlp");
}

if (await exists(OUT_PATH) && process.env.FORCE_YTDLP_DOWNLOAD !== "1") {
  console.log("[yt-dlp] bin/yt-dlp already exists, skipping download.");
  process.exit(0);
}

await downloadStandalone();
