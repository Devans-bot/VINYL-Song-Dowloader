import { existsSync } from "fs";
import { join } from "path";
import { create, type Payload } from "youtube-dl-exec";

type YtdlpFn = ReturnType<typeof create>;

const SYSTEM_PATHS = [
  process.env.YT_DLP_PATH,
  "/opt/homebrew/bin/yt-dlp",
  "/usr/local/bin/yt-dlp",
  "/usr/bin/yt-dlp",
].filter((p): p is string => Boolean(p));

let cached: YtdlpFn | null = null;

export function getYtdlp(): YtdlpFn {
  if (cached) return cached;

  for (const binaryPath of SYSTEM_PATHS) {
    if (existsSync(binaryPath)) {
      cached = create(binaryPath);
      return cached;
    }
  }

  const bundled = join(
    process.cwd(),
    "node_modules",
    "youtube-dl-exec",
    "bin",
    "yt-dlp"
  );

  if (existsSync(bundled)) {
    if (/\s/.test(bundled)) {
      throw new Error(
        "yt-dlp cannot run from a folder path with spaces. Install globally: brew install yt-dlp ffmpeg"
      );
    }
    cached = create(bundled);
    return cached;
  }

  throw new Error(
    "yt-dlp is not installed. Run: brew install yt-dlp ffmpeg"
  );
}

export function getFfmpegHint(): string | null {
  const paths = [
    "/opt/homebrew/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/usr/bin/ffmpeg",
  ];
  if (paths.some(existsSync)) return null;
  return "Install ffmpeg: brew install ffmpeg";
}

export type { Payload };
