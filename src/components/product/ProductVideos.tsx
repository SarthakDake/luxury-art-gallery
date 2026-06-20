"use client";

import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { Reveal } from "@/components/motion/Reveal";
import {
  buildYouTubeEmbedUrl,
  getResolvedArtworkVideos,
  sendYouTubeCommand,
  type ResolvedArtworkVideo,
} from "@/lib/artwork-video";
import type { Artwork } from "@/types/artwork";
import { Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

  if (posterUrl.startsWith("http")) {
    return (
      <Image
        src={posterUrl}
        alt={title ? `${title} preview` : "Video preview"}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="product-video-poster object-cover"
      />
    );
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
          poster={posterUrl}
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

function InstagramVideoCard({ video }: { video: ResolvedArtworkVideo }) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadStream = useCallback(async () => {
    setIsLoading(true);
    setLoadFailed(false);
    setStreamUrl(null);

    try {
      const response = await fetch(
        `/api/instagram-video?url=${encodeURIComponent(video.url)}`,
      );
      const payload = (await response.json()) as { videoUrl?: string };

      if (!response.ok || !payload.videoUrl) {
        setLoadFailed(true);
        return;
      }

      setStreamUrl(payload.videoUrl);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [video.url]);

  useEffect(() => {
    void loadStream();
  }, [loadStream]);

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
    <article className="space-y-4" data-reveal="scale-in">
      <div className="art-image-frame product-video-frame product-video-frame--paused">
        <VideoPoster posterUrl={video.posterUrl} title={video.title} />

        <VideoControls
          showPlay={!isLoading}
          showMute={false}
          muted
          onPlay={() => {
            void loadStream();
          }}
          onToggleMute={() => {}}
        />
      </div>

      {video.title ? (
        <div className="space-y-2">
          <h3 className="font-serif text-lg leading-snug tracking-wide text-[var(--foreground)]">
            {video.title}
          </h3>
          {loadFailed ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Could not load this Instagram video. Tap play to try again.
            </p>
          ) : null}
        </div>
      ) : loadFailed ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Could not load this Instagram video. Tap play to try again.
        </p>
      ) : null}
    </article>
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
