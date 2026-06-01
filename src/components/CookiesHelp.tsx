export function CookiesHelp({ invalidFormat = false }: { invalidFormat?: boolean }) {
  return (
    <div className="space-y-3 text-left">
      <p className="font-medium">
        {invalidFormat
          ? "Cookies in Vercel are corrupted or wrong format."
          : "YouTube blocked downloads from Vercel (bot check)."}
      </p>
      <p className="text-red-200/90">
        {invalidFormat
          ? "Do not paste raw cookies or use Copy from the extension. Follow these steps exactly:"
          : "Add minified YouTube cookies to Vercel, or run locally with npm run dev."}
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-red-200/90">
        <li>
          Export <strong>youtube.com only</strong> → save <strong>cookies.txt</strong> on
          Desktop.
        </li>
        <li>
          Minify:
          <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-[0.4rem] text-zinc-200">
            node scripts/minify-youtube-cookies.mjs ~/Desktop/cookies.txt
          </pre>
        </li>
        <li>
          Encode (creates <strong>youtube-cookies.b64.txt</strong>):
          <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-[0.4rem] text-zinc-200">
            node scripts/encode-cookies-for-vercel.mjs ~/Desktop/youtube-min.txt
          </pre>
        </li>
        <li>
          Open <strong>youtube-cookies.b64.txt</strong> in TextEdit (Plain Text) → Cmd+A →
          Cmd+C → paste into Vercel <code className="rounded bg-black/30 px-1">YOUTUBE_COOKIES_BASE64</code> → Save → Redeploy.
        </li>
      </ol>
      <p className="text-[0.45rem] text-red-200/70">
        Cookies expire — re-export if downloads stop again. Never commit cookies to GitHub.
      </p>
    </div>
  );
}
