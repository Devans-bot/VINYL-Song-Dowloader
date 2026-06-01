export function CookiesHelp() {
  return (
    <div className="space-y-3 text-left">
      <p className="font-medium">YouTube blocked downloads from Vercel (bot check).</p>
      <p className="text-red-200/90">
        Cloud servers are often flagged by YouTube. Fix it by adding your browser
        cookies to Vercel, or run the app locally with{" "}
        <code className="rounded bg-black/30 px-1">npm run dev</code>.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-red-200/90">
        <li>
          Install a cookies extension (e.g. &quot;Get cookies.txt LOCALLY&quot; for Chrome).
        </li>
        <li>
          While logged into{" "}
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            YouTube
          </a>
          , export cookies for <strong>youtube.com</strong> as Netscape{" "}
          <code className="rounded bg-black/30 px-1">cookies.txt</code>.
        </li>
        <li>
          Base64-encode the file (Terminal):
          <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-[0.4rem] text-zinc-200">
            base64 -i cookies.txt | tr -d &apos;\n&apos; | pbcopy
          </pre>
        </li>
        <li>
          In{" "}
          <a
            href="https://vercel.com/docs/projects/environment-variables"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Vercel → Settings → Environment Variables
          </a>
          , add <code className="rounded bg-black/30 px-1">YOUTUBE_COOKIES_BASE64</code>{" "}
          (paste the value) for Production, then redeploy.
        </li>
      </ol>
      <p className="text-[0.45rem] text-red-200/70">
        Cookies expire — re-export if downloads stop again. Never commit cookies to GitHub.
      </p>
    </div>
  );
}
