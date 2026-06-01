"use client";

import Image from "next/image";
import type { YouTubeVideo } from "@/types/youtube";

interface VideoCardProps {
  video: YouTubeVideo;
  onDownload: (video: YouTubeVideo) => void;
  isDownloading: boolean;
}

export function VideoCard({ video, onDownload, isDownloading }: VideoCardProps) {
  return (
    <article className="retro-panel group flex flex-col overflow-hidden transition hover:border-[var(--crt-cyan)]">
      <button
        type="button"
        onClick={() => onDownload(video)}
        disabled={isDownloading}
        className="relative aspect-video w-full overflow-hidden border-b-4 border-[var(--border)] text-left disabled:cursor-wait"
        aria-label={`Download MP3: ${video.title}`}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition group-hover:brightness-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="font-pixel flex h-full items-center justify-center bg-[#061830] text-[0.5rem] text-[var(--muted)]">
            NO SIGNAL
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a2848]/70 opacity-0 transition group-hover:opacity-100">
          <span className="font-pixel retro-btn border-[var(--crt-cyan)] bg-[var(--crt-cyan)] px-3 py-2 text-[#061830] shadow-none">
            {isDownloading ? "RIPPING..." : "GET MP3"}
          </span>
        </div>
        {isDownloading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#061830]/85">
            <div
              className="h-10 w-10 rounded-full border-4 border-[var(--crt-cyan)] border-t-transparent"
              style={{ animation: "spin-vinyl 1s linear infinite" }}
            />
            <span className="font-pixel text-[0.45rem] text-[var(--crt-yellow)]">
              30-60 SEC...
            </span>
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3
          className="font-pixel line-clamp-2 text-[0.45rem] leading-5 text-[var(--crt-cyan)]"
          title={video.title}
        >
          {video.title}
        </h3>
        <p className="font-pixel text-[0.4rem] text-[var(--muted)]">{video.channelTitle}</p>
        <button
          type="button"
          onClick={() => onDownload(video)}
          disabled={isDownloading}
          className="font-pixel retro-btn mt-1 w-full border-[var(--border)] bg-[#163560] py-2 disabled:opacity-50"
        >
          {isDownloading ? "RIPPING..." : "▶ DOWNLOAD"}
        </button>
      </div>
    </article>
  );
}
