"use client";

import { useCallback, useState } from "react";
import { CookiesHelp } from "@/components/CookiesHelp";
import { ApiKeySetupHelp, ApiNotEnabledHelp } from "@/components/SetupHelp";
import { SearchBar } from "@/components/SearchBar";
import { VideoCard } from "@/components/VideoCard";
import { VinylLogo } from "@/components/VinylLogo";
import type { SearchResponse, YouTubeVideo } from "@/types/youtube";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [lastQuery, setLastQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(
    async (query: string, pageToken?: string, append = false) => {
      const params = new URLSearchParams({ q: query });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = (await res.json()) as SearchResponse & {
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        const err = new Error(data.error ?? "Search failed") as Error & {
          code?: string;
        };
        err.code = data.code;
        throw err;
      }

      setVideos((prev) => (append ? [...prev, ...data.videos] : data.videos));
      setNextPageToken(data.nextPageToken);
    },
    []
  );

  async function handleSearch(query: string) {
    setError(null);
    setErrorCode(null);
    setIsSearching(true);
    setHasSearched(true);
    setLastQuery(query);

    try {
      await fetchResults(query);
    } catch (err) {
      setVideos([]);
      if (err instanceof Error) {
        setError(err.message);
        setErrorCode((err as Error & { code?: string }).code ?? null);
      } else {
        setError("Something went wrong");
        setErrorCode(null);
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLoadMore() {
    if (!nextPageToken || !lastQuery) return;
    setIsLoadingMore(true);
    setError(null);

    try {
      await fetchResults(lastQuery, nextPageToken, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleDownload(video: YouTubeVideo) {
    if (downloadingId) return;
    setDownloadingId(video.id);
    setError(null);
    setErrorCode(null);

    const params = new URLSearchParams({
      videoId: video.id,
      title: video.title,
    });

    try {
      const res = await fetch(`/api/download?${params.toString()}`);

      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || contentType.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        const err = new Error(data.error ?? "Download failed") as Error & {
          code?: string;
        };
        err.code = data.code;
        throw err;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.title.replace(/[<>:"/\\|?*]/g, "").slice(0, 80)}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setErrorCode((err as Error & { code?: string }).code ?? null);
      } else {
        setError("Download failed — this can take 30–60 seconds. Try again.");
        setErrorCode(null);
      }
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="tv-screen">
      <main className="tv-content mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <VinylLogo />

      <div className="mb-10 flex justify-center">
        <SearchBar onSearch={handleSearch} isLoading={isSearching} />
      </div>

      {error && (
        <div
          role="alert"
          className="retro-panel font-pixel mb-6 border-[#ff6eb4] px-4 py-3 text-[0.5rem] leading-6 text-[#ffb3d9]"
        >
          {errorCode === "API_NOT_ENABLED" || /blocked/i.test(error) ? (
            <ApiNotEnabledHelp />
          ) : errorCode === "MISSING_API_KEY" ||
            (errorCode !== "DOWNLOAD_FAILED" && error.includes("API key")) ? (
            <ApiKeySetupHelp />
          ) : errorCode === "COOKIES_INVALID" ||
            /Netscape format cookies|invalid length.*cookie/i.test(error) ? (
            <CookiesHelp invalidFormat />
          ) : errorCode === "YOUTUBE_BOT_BLOCK" ||
            /not a bot|Sign in to confirm|cookies-from-browser/i.test(error) ? (
            <CookiesHelp />
          ) : /python3|No such file or directory/i.test(error) ? (
            <div className="space-y-2 text-left">
              <p className="font-medium">Server needs a fresh deploy.</p>
              <p className="text-red-200/90">
                Push the latest code to GitHub and redeploy on Vercel. The build
                installs a standalone yt-dlp (no Python).
              </p>
            </div>
          ) : errorCode === "FFMPEG_MISSING" && /brew install/i.test(error) ? (
            <div className="space-y-2 text-left">
              <p className="font-medium">
                Downloads on Vercel need a redeploy with the latest code.
              </p>
              <p className="text-red-200/90">
                Push the latest commit to GitHub and redeploy. MP3 conversion uses
                bundled ffmpeg on Vercel (not Homebrew).
              </p>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      {isSearching && (
        <p className="font-pixel animate-pulse-ring text-center text-[0.5rem] text-[var(--crt-yellow)]">
          TUNING FREQUENCY...
        </p>
      )}

      {!isSearching && hasSearched && videos.length === 0 && !error && (
        <p className="font-pixel text-center text-[0.5rem] text-[var(--muted)]">
          NO TRACKS FOUND — TRY ANOTHER KEYWORD
        </p>
      )}

      {videos.length > 0 && (
        <>
          <p className="font-pixel mb-4 text-[0.45rem] text-[var(--crt-cyan)]">
            {videos.length} TRACK{videos.length !== 1 ? "S" : ""} — CLICK TO RIP MP3
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDownload={handleDownload}
                isDownloading={downloadingId === video.id}
              />
            ))}
          </div>
          {nextPageToken && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="font-pixel retro-btn border-[var(--crt-cyan)] bg-[#163560] px-6 py-2 disabled:opacity-50"
              >
                {isLoadingMore ? "LOADING..." : "LOAD MORE"}
              </button>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="retro-panel mx-auto mt-12 max-w-md p-6 text-center">
          <p className="font-pixel text-[0.5rem] text-[var(--crt-yellow)]">
            INSERT CASSETTE — SEARCH TO BEGIN
          </p>
          <p className="font-pixel mt-4 text-[0.45rem] leading-6 text-[var(--muted)]">
            TRY: &quot;LOFI&quot; / &quot;90S HITS&quot; / &quot;JAZZ&quot;
          </p>
        </div>
      )}
      </main>
    </div>
  );
}
