export function VinylLogo() {
  return (
    <header className="mb-10 text-center animate-crt-flicker">
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div
            className="h-20 w-20 rounded-full border-4 border-[var(--crt-cyan)] bg-[#0a0a12] shadow-[0_0_20px_rgba(94,252,255,0.4),4px_4px_0_var(--pixel-shadow)] sm:h-24 sm:w-24"
            style={{ animation: "spin-vinyl 8s linear infinite" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-[var(--crt-pink)] bg-[var(--crt-yellow)] sm:h-7 sm:w-7" />
            </div>
            <div
              className="absolute inset-2 rounded-full opacity-30"
              style={{
                background:
                  "repeating-conic-gradient(#1a1a2e 0deg 8deg, #2a2a4e 8deg 16deg)",
              }}
            />
          </div>
          <div className="absolute -bottom-1 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-black/40 blur-sm" />
        </div>
      </div>

      <h1 className="font-pixel text-pixel-glow text-lg leading-relaxed sm:text-xl md:text-2xl">
        <span className="text-[var(--crt-cyan)]">VINYL</span>
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>
        <span className="text-pixel-pink">DOWNLOADER</span>
      </h1>

      <p className="font-pixel mt-4 text-[0.5rem] leading-6 text-[var(--muted)] sm:text-[0.55rem]">
        <span className="text-[var(--crt-yellow)]">▶</span> SEARCH YOUTUBE
        <span className="mx-2 text-[var(--border)]">|</span>
        RIP TO MP3
        <span className="mx-2 text-[var(--border)]">|</span>
        <span className="text-[var(--crt-cyan)]">STEREO</span>
      </p>

      <div className="mx-auto mt-3 flex max-w-xs justify-center gap-1">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-[var(--crt-cyan)] opacity-60"
            style={{ height: `${8 + (i % 4) * 4}px` }}
          />
        ))}
      </div>
    </header>
  );
}
