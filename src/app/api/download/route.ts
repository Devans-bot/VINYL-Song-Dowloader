import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, mkdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { Readable } from "node:stream";
import { downloadAudioAsMp3, formatDownloadError } from "@/lib/ytdlp-download";
import {
  getDownloadTempDir,
  getFfmpegPath,
  getYtdlp,
  isVercel,
} from "@/lib/ytdlp";

export const runtime = "nodejs";
export const maxDuration = 300;

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 120) || "audio";
}

export async function GET(request: NextRequest) {
  const ffmpegPath = getFfmpegPath();
  if (!ffmpegPath) {
    return NextResponse.json(
      {
        error: isVercel()
          ? "Audio converter missing in deployment."
          : "Install ffmpeg: brew install ffmpeg",
        code: "FFMPEG_MISSING",
      },
      { status: 500 }
    );
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
    const { message, code } = formatDownloadError(err);
    return NextResponse.json({ error: message, code }, { status: 500 });
  }

  const tmpDir = getDownloadTempDir();
  mkdirSync(tmpDir, { recursive: true });

  const outputBase = join(tmpDir, randomUUID());
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await downloadAudioAsMp3(youtubedl, url, outputBase, ffmpegPath);

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
    const { message, code } = formatDownloadError(err);
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}
