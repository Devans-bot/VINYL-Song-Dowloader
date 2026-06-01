import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, mkdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { Readable } from "node:stream";
import { getFfmpegHint, getYtdlp } from "@/lib/ytdlp";

export const runtime = "nodejs";
export const maxDuration = 300;

const TMP_DIR = join(process.cwd(), ".tmp-downloads");

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 120) || "audio";
}

function formatYtdlpError(err: unknown): string {
  if (err instanceof Error) {
    const withStderr = err as Error & { stderr?: string };
    const detail = withStderr.stderr?.trim() || err.message;
    if (detail) return detail.split("\n").slice(-3).join(" ");
  }
  return "Download failed. Ensure yt-dlp and ffmpeg are installed.";
}

export async function GET(request: NextRequest) {
  const ffmpegHint = getFfmpegHint();
  if (ffmpegHint) {
    return NextResponse.json({ error: ffmpegHint, code: "FFMPEG_MISSING" }, { status: 500 });
  }

  const videoId = request.nextUrl.searchParams.get("videoId")?.trim();
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "song";

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  let youtubedl;
  try {
    youtubedl = getYtdlp();
  } catch (err) {
    return NextResponse.json(
      { error: formatYtdlpError(err), code: "YTDLP_MISSING" },
      { status: 500 }
    );
  }

  mkdirSync(TMP_DIR, { recursive: true });

  const outputBase = join(TMP_DIR, randomUUID());
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: `${outputBase}.%(ext)s`,
      noPlaylist: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    const mp3Path = `${outputBase}.mp3`;
    if (!existsSync(mp3Path)) {
      return NextResponse.json(
        {
          error: "Audio file was not created. Try again or pick another video.",
          code: "NO_OUTPUT",
        },
        { status: 500 }
      );
    }

    const filename = `${sanitizeFilename(title)}.mp3`;
    const nodeStream = createReadStream(mp3Path);
    nodeStream.on("close", () => {
      try {
        unlinkSync(mp3Path);
      } catch {
        /* ignore cleanup errors */
      }
    });

    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const { size } = statSync(mp3Path);

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": String(size),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: formatYtdlpError(err), code: "DOWNLOAD_FAILED" },
      { status: 500 }
    );
  }
}
