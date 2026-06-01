import { NextRequest, NextResponse } from "next/server";
import type { SearchResponse, YouTubeVideo } from "@/types/youtube";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "YouTube API key is missing",
        code: "MISSING_API_KEY",
      },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const pageToken = searchParams.get("pageToken") ?? undefined;

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "12",
    q: query,
    key: apiKey,
  });

  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  try {
    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        "YouTube API request failed";
      const isBlocked =
        /blocked|not enabled|accessNotConfigured|API_KEY_SERVICE_BLOCKED/i.test(
          message
        ) ||
        JSON.stringify(err).includes("API_KEY_SERVICE_BLOCKED");
      return NextResponse.json(
        {
          error: message,
          code: isBlocked ? "API_NOT_ENABLED" : "YOUTUBE_API_ERROR",
        },
        { status: isBlocked ? 403 : res.status }
      );
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: { videoId: string };
        snippet: {
          title: string;
          description: string;
          channelTitle: string;
          publishedAt: string;
          thumbnails: {
            medium?: { url: string };
            high?: { url: string };
            default?: { url: string };
          };
        };
      }>;
      nextPageToken?: string;
    };

    const videos: YouTubeVideo[] =
      data.items?.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.high?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
      })) ?? [];

    const response: SearchResponse = {
      videos,
      nextPageToken: data.nextPageToken,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
