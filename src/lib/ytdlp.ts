import { existsSync } from "fs";
import { join } from "path";
import { create, type Payload } from "youtube-dl-exec";

type YtdlpFn = ReturnType<typeof create>;

const SYSTEM_YTDLP_PATHS = [
  process.env.YT_DLP_PATH,
  "/opt/homebrew/bin/yt-dlp",
  "/usr/local/bin/yt-dlp",
  "/usr/bin/yt-dlp",
].filter((p): p is string => Boolean(p));

const SYSTEM_FFMPEG_PATHS = [
  "/opt/homebrew/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
  "/usr/bin/ffmpeg",
];

let cachedYtdlp: YtdlpFn | null = null;
let cachedFfmpeg: string | null | undefined;

export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

function bundledYtdlpPath(): string {
  return join(process.cwd(), "node_modules", "youtube-dl-exec", "bin", "yt-dlp");
}

/** Standalone Linux binary (no Python) — created during Vercel build */
function standaloneYtdlpPath(): string {
  return join(process.cwd(), "bin", "yt-dlp");
}

export function getYtdlp(): YtdlpFn {
  if (cachedYtdlp) return cachedYtdlp;

  if (isVercel()) {
    const standalone = standaloneYtdlpPath();
    if (existsSync(standalone)) {
      cachedYtdlp = create(standalone);
      return cachedYtdlp;
    }
    throw new Error(
      "Standalone yt-dlp missing. Redeploy after the latest build (bin/yt-dlp)."
    );
  }

  for (const binaryPath of SYSTEM_YTDLP_PATHS) {
    if (existsSync(binaryPath)) {
      cachedYtdlp = create(binaryPath);
      return cachedYtdlp;
    }
  }

  const bundled = bundledYtdlpPath();
  if (existsSync(bundled)) {
    if (/\s/.test(bundled)) {
      throw new Error(
        "yt-dlp cannot run from a folder path with spaces. Install: brew install yt-dlp ffmpeg"
      );
    }
    cachedYtdlp = create(bundled);
    return cachedYtdlp;
  }

  throw new Error("yt-dlp is not installed. Run: brew install yt-dlp ffmpeg");
}

export function getFfmpegPath(): string | null {
  if (cachedFfmpeg !== undefined) return cachedFfmpeg;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic = require("ffmpeg-static") as string | null;
    if (ffmpegStatic && existsSync(ffmpegStatic)) {
      cachedFfmpeg = ffmpegStatic;
      return cachedFfmpeg;
    }
  } catch {
    /* ffmpeg-static optional at import */
  }

  const system = SYSTEM_FFMPEG_PATHS.find((p) => existsSync(p));
  cachedFfmpeg = system ?? null;
  return cachedFfmpeg;
}

export function getDownloadTempDir(): string {
  return isVercel() ? "/tmp/vinyl-downloads" : join(process.cwd(), ".tmp-downloads");
}

export type { Payload };
