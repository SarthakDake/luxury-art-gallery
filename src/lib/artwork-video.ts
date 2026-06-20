import type { ArtworkVideo } from "@/types/artwork";

export type ArtworkVideoSource = "file" | "youtube" | "instagram";

export interface ResolvedArtworkVideo extends ArtworkVideo {
  source: ArtworkVideoSource;
  embedUrl?: string;
  youtubeId?: string;
  posterUrl?: string;
}

const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const INSTAGRAM_PATTERN =
  /instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/;

const FILE_EXTENSION_PATTERN = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i;

export function detectVideoSource(
  url: string,
  explicit?: ArtworkVideoSource,
): ArtworkVideoSource {
  if (explicit) {
    return explicit;
  }

  if (YOUTUBE_ID_PATTERN.test(url)) {
    return "youtube";
  }

  if (INSTAGRAM_PATTERN.test(url)) {
    return "instagram";
  }

  return "file";
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match?.[1] ?? null;
}

export function extractInstagramEmbedPath(
  url: string,
): { kind: "reel" | "p" | "tv"; shortcode: string } | null {
  const match = url.match(INSTAGRAM_PATTERN);
  if (!match) {
    return null;
  }

  return {
    kind: match[1] as "reel" | "p" | "tv",
    shortcode: match[2],
  };
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; muted?: boolean; loop?: boolean } = {},
): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    controls: "0",
    iv_load_policy: "3",
  });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }

  if (options.muted ?? true) {
    params.set("mute", "1");
  } else {
    params.set("mute", "0");
  }

  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function buildInstagramEmbedUrl(
  kind: "reel" | "p" | "tv",
  shortcode: string,
): string {
  const params = new URLSearchParams({
    cr: "1",
    v: "14",
    wp: "1",
  });

  return `https://www.instagram.com/${kind}/${shortcode}/embed/?${params.toString()}`;
}

export function getYouTubePosterUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function isLocalVideoUrl(url: string): boolean {
  return url.startsWith("/") || FILE_EXTENSION_PATTERN.test(url);
}

export function resolveArtworkVideo(
  video: ArtworkVideo,
): ResolvedArtworkVideo | null {
  const trimmedUrl = video.url.trim();
  if (!trimmedUrl) {
    return null;
  }

  const source = detectVideoSource(trimmedUrl, video.type);

  if (source === "youtube") {
    const youtubeId = extractYouTubeId(trimmedUrl);
    if (!youtubeId) {
      return null;
    }

    return {
      ...video,
      source,
      youtubeId,
      posterUrl: video.poster ?? getYouTubePosterUrl(youtubeId),
      embedUrl: buildYouTubeEmbedUrl(youtubeId, {
        autoplay: false,
        muted: true,
        loop: true,
      }),
    };
  }

  if (source === "instagram") {
    const instagram = extractInstagramEmbedPath(trimmedUrl);
    if (!instagram) {
      return null;
    }

    return {
      ...video,
      source,
      embedUrl: buildInstagramEmbedUrl(instagram.kind, instagram.shortcode),
      posterUrl: video.poster,
    };
  }

  if (!isLocalVideoUrl(trimmedUrl) && !trimmedUrl.startsWith("http")) {
    return null;
  }

  return {
    ...video,
    source: "file",
    posterUrl: video.poster,
  };
}

export function getResolvedArtworkVideos(
  videos: ArtworkVideo[] | undefined,
): ResolvedArtworkVideo[] {
  if (!videos) {
    return [];
  }

  return videos
    .map((video) => resolveArtworkVideo(video))
    .filter((video): video is ResolvedArtworkVideo => video !== null);
}

export function sendYouTubeCommand(
  iframe: HTMLIFrameElement,
  func: "mute" | "unMute" | "playVideo" | "pauseVideo",
) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  );
}
