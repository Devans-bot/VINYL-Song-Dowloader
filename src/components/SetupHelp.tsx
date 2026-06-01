export function ApiKeySetupHelp() {
  return (
    <div className="space-y-3 text-left">
      <p className="font-medium">YouTube API key is not set up yet.</p>
      <ol className="list-decimal space-y-1 pl-5 text-red-200/90">
        <li>
          Open{" "}
          <a
            href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Google Cloud Console
          </a>{" "}
          and enable <strong>YouTube Data API v3</strong>.
        </li>
        <li>
          Go to{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Credentials
          </a>{" "}
          → Create credentials → <strong>API key</strong>.
        </li>
        <li>
          Paste the key in{" "}
          <code className="rounded bg-black/30 px-1 py-0.5">.env.local</code>:
          <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-2 text-xs text-zinc-200">
            YOUTUBE_API_KEY=your_key_here
          </pre>
        </li>
        <li>
          Restart the dev server: stop it (Ctrl+C), then run{" "}
          <code className="rounded bg-black/30 px-1">npm run dev</code> again.
        </li>
      </ol>
    </div>
  );
}

export function ApiNotEnabledHelp() {
  return (
    <div className="space-y-3 text-left">
      <p className="font-medium">Your API key cannot call YouTube search yet.</p>
      <p className="text-red-200/90">
        The API may already be <strong>Enabled</strong> — the usual fix is to update{" "}
        <strong>API key restrictions</strong> so this key is allowed to use YouTube Data API
        v3.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-red-200/90">
        <li>
          Open{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Credentials
          </a>{" "}
          and click your <strong>API key</strong>.
        </li>
        <li>
          Under <strong>API restrictions</strong>, choose either:
          <ul className="mt-1 list-disc pl-5">
            <li>
              <strong>Don&apos;t restrict key</strong> (easiest for local testing), or
            </li>
            <li>
              <strong>Restrict key</strong> → check <strong>YouTube Data API v3</strong> only.
            </li>
          </ul>
        </li>
        <li>
          Under <strong>Application restrictions</strong>, choose{" "}
          <strong>None</strong> for now (HTTP referrer blocks server-side requests from this
          app).
        </li>
        <li>
          Click <strong>Save</strong>, wait 1–2 minutes, then search again.
        </li>
      </ol>
    </div>
  );
}
