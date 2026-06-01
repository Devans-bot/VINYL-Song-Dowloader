# VINYL DOWNLOADER

Retro 90s-style YouTube search and MP3 ripper. Built with Next.js, YouTube Data API v3, and yt-dlp.

## Features

- Keyword search powered by YouTube Data API v3
- Video results with thumbnails, titles, and channel names
- One-click MP3 download (audio extraction via yt-dlp)
- Load more results with pagination

## Prerequisites

1. **YouTube API key** — [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project
   - Enable **YouTube Data API v3**
   - Create an API key under Credentials

2. **yt-dlp** and **ffmpeg** (required for MP3 downloads)

   ```bash
   brew install yt-dlp ffmpeg   # macOS
   ```

   > If your project folder path contains **spaces**, you must use the Homebrew `yt-dlp` (not only the bundled binary).

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set your key:

```
YOUTUBE_API_KEY=your_actual_api_key
```

Run the dev server (opens your browser automatically):

```bash
cd "/Users/divyansh/Desktop/Ecommerce-test/SOng downloader"
npm install
npm run dev
```

Use **http://127.0.0.1:3003** or **http://localhost:3003** (not port 3000).

If the page does not load, check the terminal for errors and ensure nothing else is using port 3003.

## How it works

| Step | What happens |
|------|----------------|
| Search | Browser calls `/api/search` → YouTube Data API returns video metadata |
| Download | Click a video → `/api/download` uses yt-dlp to extract audio as MP3 |

## Deployment on Vercel

1. Add `YOUTUBE_API_KEY` in [Vercel Project Settings → Environment Variables](https://vercel.com/docs/projects/environment-variables).
2. Redeploy after pushing the latest code (downloads use bundled **yt-dlp** + **ffmpeg-static**).
3. Downloads can take **30–60 seconds**; Hobby plan allows up to **60s** per function (`vercel.json`).

Search works on Vercel; MP3 download needs this bundled setup (not `brew install` on the server).

### YouTube “bot” block on Vercel

YouTube often blocks datacenter IPs. If downloads fail with “Sign in to confirm you're not a bot”:

1. Export `cookies.txt` from your browser while logged into YouTube (Netscape format).
2. Base64-encode: `base64 -i cookies.txt | tr -d '\n' | pbcopy`
3. Add env var **`YOUTUBE_COOKIES_BASE64`** in Vercel → Settings → Environment Variables.
4. Redeploy.

Or run locally: `npm run dev` (home IP usually works without cookies).

## Legal

Only download content you have the right to use. Respect YouTube’s Terms of Service and copyright laws in your region.
