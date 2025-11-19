'use client';

import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1';
}

/**
 * Responsive YouTube video embed component
 *
 * @example
 * ```tsx
 * <YouTubeEmbed
 *   videoId="dQw4w9WgXcQ"
 *   title="Our Bartender Partnership Program"
 * />
 * ```
 */
export default function YouTubeEmbed({
  videoId,
  title = 'YouTube video player',
  autoplay = false,
  muted = false,
  controls = true,
  aspectRatio = '16/9'
}: YouTubeEmbedProps) {
  // Build YouTube URL with parameters
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0', // Don't show related videos from other channels
    modestbranding: '1', // Minimal YouTube branding
  });

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

  // Aspect ratio mapping
  const aspectRatioClass = {
    '16/9': 'aspect-video', // 16:9 (standard)
    '4/3': 'aspect-[4/3]',   // 4:3 (traditional)
    '1/1': 'aspect-square'   // 1:1 (square)
  }[aspectRatio];

  return (
    <div className={`relative w-full overflow-hidden rounded-lg shadow-xl ${aspectRatioClass}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
