const NETSCAPE_HEADER = `# Netscape HTTP Cookie File
# https://curl.haxx.se/rfc/cookie_spec.html
# This is a generated file!  Do not edit.
`;

export class CookiesFormatError extends Error {
  code = "COOKIES_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "CookiesFormatError";
  }
}

function isNetscapeContent(text: string): boolean {
  const dataLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (dataLines.length === 0) return false;

  const validLines = dataLines.filter((line) => {
    const parts = line.split("\t");
    return parts.length >= 7 && parts[0].includes("youtube.com");
  });

  return validLines.length >= 3;
}

export function normalizeNetscapeCookies(text: string): string {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();

  if (!isNetscapeContent(normalized)) {
    throw new CookiesFormatError(
      "Invalid cookies format. Re-export youtube.com cookies and run: node scripts/encode-cookies-for-vercel.mjs ~/Desktop/youtube-min.txt"
    );
  }

  const body = normalized.startsWith("#")
    ? normalized
    : `${NETSCAPE_HEADER}\n${normalized}`;

  return `${body}\n`;
}

/** Decode YOUTUBE_COOKIES_BASE64 from Vercel (plain text or base64). */
export function decodeCookiesFromEnv(): string {
  const raw = process.env.YOUTUBE_COOKIES_BASE64?.trim();
  if (!raw) {
    throw new CookiesFormatError("YOUTUBE_COOKIES_BASE64 is not set.");
  }

  // User pasted raw cookies.txt into the env var (no base64)
  if (raw.includes(".youtube.com") && raw.includes("\t")) {
    return normalizeNetscapeCookies(raw);
  }

  const cleaned = raw.replace(/\s+/g, "");
  if (cleaned.length < 100) {
    throw new CookiesFormatError("Cookies value is too short — paste was likely truncated.");
  }

  let decoded: string;
  try {
    decoded = Buffer.from(cleaned, "base64").toString("utf-8");
  } catch {
    throw new CookiesFormatError("Invalid base64. Use scripts/encode-cookies-for-vercel.mjs");
  }

  // Reject obvious garbage (binary decode of wrong data)
  if (!decoded.includes("youtube.com") || decoded.includes("\uFFFD")) {
    throw new CookiesFormatError(
      "Decoded cookies are corrupted. Re-run encode script and paste the full .b64.txt file."
    );
  }

  return normalizeNetscapeCookies(decoded);
}

export function isCookiesError(err: unknown): boolean {
  return (
    err instanceof CookiesFormatError ||
    (err instanceof Error &&
      /Netscape format cookies|invalid length.*cookie/i.test(
        `${err.message} ${(err as Error & { stderr?: string }).stderr ?? ""}`
      ))
  );
}
