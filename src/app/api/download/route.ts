import { NextRequest, NextResponse } from "next/server";
import { getAudioStreamUrl } from "@/lib/invidious";

export const runtime = "edge"; // Switch to Edge runtime for speed since we just redirect/proxy now!

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 120) || "audio";
}

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId")?.trim();
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "song";

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  try {
    const streamUrl = await getAudioStreamUrl(videoId);
    
    // We fetch the stream from Invidious/GoogleVideo and pipe it to the client
    // This allows us to set the exact filename!
    const audioRes = await fetch(streamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
      }
    });

    if (!audioRes.ok || !audioRes.body) {
      throw new Error("Failed to fetch audio stream");
    }

    const filename = `${sanitizeFilename(title)}.m4a`;

    return new NextResponse(audioRes.body, {
      headers: {
        "Content-Type": "audio/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": audioRes.headers.get("Content-Length") || "",
      },
    });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { 
        error: err instanceof Error ? err.message : "Download failed. Try another video.", 
        code: "DOWNLOAD_FAILED" 
      }, 
      { status: 500 }
    );
  }
}
