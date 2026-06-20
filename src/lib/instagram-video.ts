import { extractInstagramEmbedPath } from "@/lib/artwork-video";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function extractInstagramVideoUrlFromHtml(html: string): string | null {
  const secureMatch = html.match(
    /property="og:video:secure_url" content="([^"]+)"/,
  );
  const fallbackMatch = html.match(/property="og:video" content="([^"]+)"/);
  const rawUrl = secureMatch?.[1] ?? fallbackMatch?.[1];

  if (!rawUrl) {
    return null;
  }

  return decodeHtmlEntities(rawUrl);
}

export async function fetchInstagramVideoUrl(
  postUrl: string,
): Promise<string | null> {
  const instagram = extractInstagramEmbedPath(postUrl);
  if (!instagram) {
    return null;
  }

  const response = await fetch(postUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ColorsNJoy/1.0)",
      Accept: "text/html",
    },
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  return extractInstagramVideoUrlFromHtml(html);
}
