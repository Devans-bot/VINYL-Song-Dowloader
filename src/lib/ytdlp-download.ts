import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { create } from "youtube-dl-exec";
import {
  CookiesFormatError,
  decodeCookiesFromEnv,
  isCookiesError,
  normalizeNetscapeCookies,
} from "@/lib/cookies";
import { getDownloadTempDir } from "@/lib/ytdlp";

type YtdlpFn = ReturnType<typeof create>;

const EXTRACTOR_STRATEGIES = [
  "youtube:player_client=android,web",
  "youtube:player_client=tv_embedded,web",
  "youtube:player_client=mweb,web",
  "youtube:player_client=ios,web",
] as const;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function isYoutubeBotError(err: unknown): boolean {
  const text =
    err instanceof Error
      ? `${err.message} ${(err as Error & { stderr?: string }).stderr ?? ""}`
      : String(err);
  return /not a bot|sign in to confirm|cookies-from-browser|LOGIN_REQUIRED|Requested format is not available/i.test(
    text
  );
}

async function prepareCookiesFile(tmpDir: string): Promise<string | undefined> {
  mkdirSync(tmpDir, { recursive: true });
  const cookiesPath = join(tmpDir, "youtube-cookies.txt");

  const url = process.env.YOUTUBE_COOKIES_URL?.trim();
  if (url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch cookies URL: ${res.status}`);
    const text = normalizeNetscapeCookies(await res.text());
    writeFileSync(cookiesPath, text, "utf-8");
    return cookiesPath;
  }

  if (!process.env.YOUTUBE_COOKIES_BASE64?.trim()) return undefined;

  const text = decodeCookiesFromEnv();
  writeFileSync(cookiesPath, text, "utf-8");
  return cookiesPath;
}

export async function downloadAudioAsMp3(
  youtubedl: YtdlpFn,
  videoUrl: string,
  outputBase: string,
  ffmpegPath: string
): Promise<void> {
  const tmpDir = getDownloadTempDir();
  const cookies = await prepareCookiesFile(tmpDir);

  const baseFlags = {
    format: "m4a/bestaudio/best",
    extractAudio: true,
    output: `${outputBase}.m4a`,
    noPlaylist: true,
    noWarnings: true,
    preferFreeFormats: false,
    ffmpegLocation: ffmpegPath,
    userAgent: USER_AGENT,
    referer: "https://www.youtube.com/",
    ...(cookies ? { cookies } : {}),
  };

  let lastError: unknown;

  for (const extractorArgs of EXTRACTOR_STRATEGIES) {
    try {
      await youtubedl(videoUrl, {
        ...baseFlags,
        extractorArgs,
      } as Parameters<YtdlpFn>[1]);
      return;
    } catch (err) {
      lastError = err;
      if (!isYoutubeBotError(err)) throw err;
    }
  }

  throw lastError;
}

export function formatDownloadError(err: unknown): { message: string; code: string } {
  if (err instanceof CookiesFormatError || isCookiesError(err)) {
    return {
      code: "COOKIES_INVALID",
      message:
        err instanceof Error
          ? err.message
          : "Invalid cookies file. Re-encode with scripts/encode-cookies-for-vercel.mjs",
    };
  }

  if (isYoutubeBotError(err)) {
    return {
      code: "YOUTUBE_BOT_BLOCK",
      message:
        "YouTube blocked this download from the cloud server. Add YouTube cookies in Vercel env (see README) or use the app locally.",
    };
  }

  if (err instanceof Error) {
    const withStderr = err as Error & { stderr?: string };
    const detail = withStderr.stderr?.trim() || err.message;
    if (detail) {
      return { code: "DOWNLOAD_FAILED", message: detail.split("\n").slice(-2).join(" ") };
    }
  }

  return { code: "DOWNLOAD_FAILED", message: "Download failed. Try again or another video." };
}
