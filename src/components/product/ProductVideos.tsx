"use client";

import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { Reveal } from "@/components/motion/Reveal";
import {
  buildYouTubeEmbedUrl,
  getResolvedArtworkVideos,
  sendYouTubeCommand,
  type ResolvedArtworkVideo,
} from "@/lib/artwork-video";
import type { Artwork } from "@/types/artwork";
import { Play, Volume2, VolumeX } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

interface ProductVideosProps {
  artwork: Artwork;
}

interface VideoControlsProps {
  showPlay: boolean;
  showMute: boolean;
  muted: boolean;
  onPlay: () => void;
  onToggleMute: () => void;
}

function VideoControls({
  showPlay,
  showMute,
  muted,
  onPlay,
  onToggleMute,
}: VideoControlsProps) {
  return (
    <>
      {showPlay ? (
        <button
          type="button"
          className="product-video-play-btn"
          aria-label="Play video"
          onClick={(event) => {
            event.stopPropagation();
            onPlay();
          }}
        >
          <Play className="product-video-play-icon" strokeWidth={1.5} fill="currentColor" />
        </button>
      ) : null}

      {showMute ? (
        <button
          type="button"
          className="product-video-mute-btn"
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMute();
          }}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Volume2 className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      ) : null}
    </>
  );
}

function VideoClickLayer({ onPause }: { onPause: () => void }) {
  return (
    <button
      type="button"
      className="product-video-click-layer"
      aria-label="Pause video"
      onClick={(event) => {
        event.stopPropagation();
        onPause();
      }}
    />
  );
}

function VideoPoster({
  posterUrl,
  title,
}: {
  posterUrl?: string;
  title?: string;
}) {
  if (!posterUrl) {
    return <div className="product-video-poster product-video-poster-empty" aria-hidden />;
  }

  return (
    <ArtworkImage
      src={posterUrl}
      alt={title ? `${title} preview` : "Video preview"}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="product-video-poster object-cover"
    />
  );
}

interface StreamVideoCardProps {
  streamUrl: string;
  posterUrl?: string;
  title?: string;
}

function StreamVideoCard({ streamUrl, posterUrl, title }: StreamVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const resolvedPosterUrl = posterUrl ? getArtworkImageSrc(posterUrl) : undefined;

  useEffect(() => {
    const element = videoRef.current;
    if (!element) {
      return;
    }

    element.muted = true;
    setMuted(true);

    const playPromise = element.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [streamUrl]);

  function handlePlay() {
    const element = videoRef.current;
    if (!element) {
      return;
    }

    element.muted = muted;
    void element.play();
  }

  function handlePause() {
    videoRef.current?.pause();
  }

  function handleToggleMute() {
    const element = videoRef.current;
    if (!element) {
      return;
    }

    const nextMuted = !element.muted;
    element.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted && element.paused) {
      void element.play();
    }
  }

  return (
    <article className="space-y-4" data-reveal="scale-in">
      <div
        className={`art-image-frame product-video-frame${isPlaying ? "" : " product-video-frame--paused"}`}
        onClick={isPlaying ? handlePause : undefined}
        role="button"
        tabIndex={isPlaying ? 0 : -1}
        aria-label={isPlaying ? "Pause video" : undefined}
        onKeyDown={(event) => {
          if (isPlaying && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            handlePause();
          }
        }}
      >
        {!isPlaying ? (
          <VideoPoster posterUrl={posterUrl} title={title} />
        ) : null}

        <video
          ref={videoRef}
          src={streamUrl}
          poster={resolvedPosterUrl}
          muted
          loop
          playsInline
          preload="auto"
          className="product-video-player"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {isPlaying ? <VideoClickLayer onPause={handlePause} /> : null}

        <VideoControls
          showPlay={!isPlaying}
          showMute={isPlaying}
          muted={muted}
          onPlay={handlePlay}
          onToggleMute={handleToggleMute}
        />
      </div>

      {title ? (
        <div className="space-y-2">
          <h3 className="font-serif text-lg leading-snug tracking-wide text-[var(--foreground)]">
            {title}
          </h3>
        </div>
      ) : null}
    </article>
  );
}

function LocalVideoCard({ video }: { video: ResolvedArtworkVideo }) {
  return (
    <StreamVideoCard
      streamUrl={video.url}
      posterUrl={video.posterUrl}
      title={video.title}
    />
  );
}

function fetchInstagramStream(url: string): Promise<string> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Instagram video fetch is client-only."));
  }

  return fetch(`/api/instagram-video?url=${encodeURIComponent(url)}`).then(
    async (response) => {
      const payload = (await response.json()) as {
        videoUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.videoUrl) {
        throw new Error(payload.error ?? "Could not load Instagram video.");
      }

      return payload.videoUrl;
    },
  );
}

function InstagramVideoFallback({
  video,
  showPlay,
  loadFailed,
  onRetry,
}: {
  video: ResolvedArtworkVideo;
  showPlay: boolean;
  loadFailed: boolean;
  onRetry: () => void;
}) {
  return (
    <article className="space-y-4" data-reveal="scale-in">
      <div className="art-image-frame product-video-frame product-video-frame--paused">
        <VideoPoster posterUrl={video.posterUrl} title={video.title} />

        <VideoControls
          showPlay={showPlay}
          showMute={false}
          muted
          onPlay={onRetry}
          onToggleMute={() => {}}
        />
      </div>

      {video.title ? (
        <div className="space-y-2">
          <h3 className="font-serif text-lg leading-snug tracking-wide text-[var(--foreground)]">
            {video.title}
          </h3>
          {loadFailed ? (
            <p className="text-sm text-[var(--muted)]">
              Could not load this Instagram video. Tap play to try again.
            </p>
          ) : null}
        </div>
      ) : loadFailed ? (
        <p className="text-sm text-[var(--muted)]">
          Could not load this Instagram video. Tap play to try again.
        </p>
      ) : null}
    </article>
  );
}

function InstagramVideoLoader({
  video,
  onRetry,
}: {
  video: ResolvedArtworkVideo;
  onRetry: () => void;
}) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchInstagramStream(video.url)
      .then((url) => {
        if (cancelled) {
          return;
        }

        setStreamUrl(url);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [video.url]);

  if (streamUrl) {
    return (
      <StreamVideoCard
        streamUrl={streamUrl}
        posterUrl={video.posterUrl}
        title={video.title}
      />
    );
  }

  return (
    <InstagramVideoFallback
      video={video}
      showPlay={failed}
      loadFailed={failed}
      onRetry={onRetry}
    />
  );
}

function InstagramVideoCard({ video }: { video: ResolvedArtworkVideo }) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <InstagramVideoLoader
      key={retryKey}
      video={video}
      onRetry={() => setRetryKey((current) => current + 1)}
    />
  );
}

function YouTubeVideoCard({ video }: { video: ResolvedArtworkVideo }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const youtubeId = video.youtubeId;
  if (!youtubeId) {
    return null;
  }

  function handlePlay() {
    const iframe = iframeRef.current;
    if (iframe) {
      sendYouTubeCommand(iframe, "playVideo");
      sendYouTubeCommand(iframe, muted ? "mute" : "unMute");
    }

    setIsPlaying(true);
  }

  function handlePause() {
    const iframe = iframeRef.current;
    if (iframe) {
      sendYouTubeCommand(iframe, "pauseVideo");
    }

    setIsPlaying(false);
  }

  function handleToggleMute() {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const nextMuted = !muted;
    sendYouTubeCommand(iframe, nextMuted ? "mute" : "unMute");
    setMuted(nextMuted);

    if (!isPlaying) {
      handlePlay();
    }
  }

  return (
    <article className="space-y-4" data-reveal="scale-in">
      <div
        className={`art-image-frame product-video-frame${isPlaying ? "" : " product-video-frame--paused"}`}
        onClick={isPlaying ? handlePause : undefined}
        role="button"
        tabIndex={isPlaying ? 0 : -1}
        aria-label={isPlaying ? "Pause video" : undefined}
        onKeyDown={(event) => {
          if (isPlaying && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            handlePause();
          }
        }}
      >
        {!isPlaying ? (
          <VideoPoster posterUrl={video.posterUrl} title={video.title} />
        ) : null}

        <iframe
          ref={iframeRef}
          src={buildYouTubeEmbedUrl(youtubeId, {
            autoplay: true,
            muted: true,
            loop: true,
          })}
          title={video.title ?? "YouTube video"}
          className="product-video-embed"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => {
            const iframe = iframeRef.current;
            if (iframe) {
              sendYouTubeCommand(iframe, "mute");
              sendYouTubeCommand(iframe, "playVideo");
            }
          }}
        />

        {isPlaying ? <VideoClickLayer onPause={handlePause} /> : null}

        <VideoControls
          showPlay={!isPlaying}
          showMute={isPlaying}
          muted={muted}
          onPlay={handlePlay}
          onToggleMute={handleToggleMute}
        />
      </div>

      {video.title ? (
        <div className="space-y-2">
          <h3 className="font-serif text-lg leading-snug tracking-wide text-[var(--foreground)]">
            {video.title}
          </h3>
        </div>
      ) : null}
    </article>
  );
}

function ProductVideoCard({ video }: { video: ResolvedArtworkVideo }) {
  if (video.source === "youtube") {
    return <YouTubeVideoCard video={video} />;
  }

  if (video.source === "instagram") {
    return <InstagramVideoCard video={video} />;
  }

  return <LocalVideoCard video={video} />;
}

export function ProductVideos({ artwork }: ProductVideosProps) {
  const videos = getResolvedArtworkVideos(artwork.videos);

  if (videos.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="surface-section section-block">
      <div className="site-container">
        <div className="mb-10 space-y-3">
          <p className="eyebrow">In Motion</p>
          <h2 className="section-title">Artwork Videos</h2>
        </div>

        <div className="product-grid" data-reveal-stagger>
          {videos.map((video, index) => (
            <ProductVideoCard key={`${video.source}-${video.url}-${index}`} video={video} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
