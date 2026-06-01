/**
 * Downloads standalone yt-dlp for Linux (no Python). Required on Vercel.
 */
import { chmod, mkdir, access, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";

const BIN_DIR = join(process.cwd(), "bin");
const OUT_PATH = join(BIN_DIR, "yt-dlp");

/** Direct GitHub redirect — no API rate limits */
const DIRECT_URL =
  "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux";

const isLinux = process.platform === "linux";
const isVercel = process.env.VERCEL === "1";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadFrom(url, label) {
  console.log(`[yt-dlp] Downloading (${label})...`);
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "vinyl-downloader-build" },
  });

  if (!res.ok) {
    throw new Error(`${label} failed: HTTP ${res.status}`);
  }

  await mkdir(BIN_DIR, { recursive: true });
  await pipeline(res.body, createWriteStream(OUT_PATH));
  await chmod(OUT_PATH, 0o755);

  const { size } = await stat(OUT_PATH);
  if (size < 1_000_000) {
    throw new Error(`${label}: file too small (${size} bytes), likely not a binary`);
  }

  console.log(`[yt-dlp] OK — bin/yt-dlp (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

async function main() {
  if (!isLinux && !isVercel) {
    console.log("[yt-dlp] Skip (not Linux/Vercel — use local brew yt-dlp).");
    return;
  }

  if ((await exists(OUT_PATH)) && process.env.FORCE_YTDLP_DOWNLOAD !== "1") {
    const { size } = await stat(OUT_PATH);
    console.log(`[yt-dlp] Already present (${(size / 1024 / 1024).toFixed(1)} MB), skip.`);
    return;
  }

  console.log("[yt-dlp] Platform:", process.platform, "| VERCEL:", process.env.VERCEL);

  try {
    await downloadFrom(DIRECT_URL, "direct");
  } catch (directErr) {
    console.warn("[yt-dlp] Direct download failed:", directErr.message);
    console.log("[yt-dlp] Trying GitHub API fallback...");

    const apiRes = await fetch(
      "https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "vinyl-downloader-build",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      }
    );

    if (!apiRes.ok) {
      throw new Error(`GitHub API ${apiRes.status} (and direct download failed)`);
    }

    const release = await apiRes.json();
    const asset = release.assets?.find((a) => a.name === "yt-dlp_linux");
    if (!asset?.browser_download_url) {
      throw new Error("yt-dlp_linux not found in release assets");
    }

    await downloadFrom(asset.browser_download_url, "api");
  }
}

main().catch((err) => {
  console.error("[yt-dlp] FATAL:", err.message);
  process.exit(1);
});
