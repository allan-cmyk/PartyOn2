'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CELL_MEDIA as SCANNED_MEDIA, CELL_NAMES, type CollageMedia } from '@/generated/hero-media-manifest';

/** Image display intervals per cell (staggered to avoid synchronized transitions) */
const STAGGERED_INTERVALS = [4000, 5000, 4500, 3800, 4200];

/** Max video play time before auto-advancing (ms) */
const VIDEO_MAX_DURATION = 10000;

/**
 * Grid positions for each cell by name.
 * Layout (desktop):
 * ┌────────┬────────┬────────┐
 * │ airbnb │  boat  │ drinks │
 * ├────────┴────────┼────────┤
 * │    wedding      │ corpo- │
 * │                 │  rate  │
 * └─────────────────┴────────┘
 */
const GRID_POSITIONS: Record<string, string> = {
  airbnb: 'col-span-1 row-span-1',
  boat: 'col-span-1 row-span-1',
  drinks: 'col-span-1 row-span-1',
  wedding: 'col-span-2 row-span-1',
  corporate: 'col-span-1 row-span-1',
};

/** Order cells appear in the grid (matches the visual layout left-to-right, top-to-bottom) */
const GRID_ORDER = ['airbnb', 'boat', 'drinks', 'wedding', 'corporate'];

function getGridPosition(name: string): string {
  return GRID_POSITIONS[name] || 'col-span-1 row-span-1';
}

interface CollageCellProps {
  media: CollageMedia[];
  imageInterval: number;
  className: string;
  priority?: boolean;
}

function CollageCell({ media, imageInterval, className, priority = false }: CollageCellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(media.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const advanceToNext = useCallback(() => {
    if (isTransitioning || media.length <= 1) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setNextIndex((nextIndex + 1) % media.length);
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, nextIndex, media.length]);

  // Schedule the next advance based on current item type
  useEffect(() => {
    if (media.length <= 1) return;
    const current = media[currentIndex];

    if (current.type === 'video') {
      timerRef.current = setTimeout(advanceToNext, VIDEO_MAX_DURATION + 1000);
    } else {
      timerRef.current = setTimeout(advanceToNext, imageInterval);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, media, imageInterval, advanceToNext]);

  // When a video becomes current, play it from the start
  useEffect(() => {
    if (media[currentIndex].type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, media]);

  const currentMedia = media[currentIndex];
  const nextMedia = media[nextIndex];

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Next item (underneath, revealed during crossfade) */}
      <div className="absolute inset-0">
        <MediaItem media={nextMedia} sizes="(max-width: 768px) 50vw, 33vw" preloadVideo="metadata" />
      </div>

      {/* Current item (on top, fades out during transition) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentMedia.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentMedia.src}
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              advanceToNext();
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={currentMedia.src}
            alt={currentMedia.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
    </div>
  );
}

/** Renders either a Next.js Image or a video element */
function MediaItem({
  media,
  sizes,
  preloadVideo = 'none',
}: {
  media: CollageMedia;
  sizes: string;
  preloadVideo?: 'none' | 'metadata' | 'auto';
}) {
  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        muted
        playsInline
        preload={preloadVideo}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

/**
 * 5-cell media collage for the homepage hero.
 * Desktop: 3 columns, 2 rows mosaic.
 * Mobile: 2 columns, stacked.
 * Each cell independently cycles through themed images/videos with crossfade.
 *
 * To add media, drop files into public/images/hero/collage/{folder}/
 * Then run: npm run hero:refresh
 */
export default function HeroCollage() {
  // Build ordered cells from the manifest, matching the grid layout
  const orderedCells = GRID_ORDER
    .map((name) => {
      const idx = CELL_NAMES.indexOf(name);
      return idx >= 0 && SCANNED_MEDIA[idx].length > 0
        ? { name, media: SCANNED_MEDIA[idx] }
        : null;
    })
    .filter((c): c is { name: string; media: CollageMedia[] } => c !== null);

  if (orderedCells.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[1fr] gap-3 h-[400px] md:h-[500px] lg:h-full">
      {orderedCells.map((cell, i) => (
        <CollageCell
          key={cell.name}
          media={cell.media}
          imageInterval={STAGGERED_INTERVALS[i % STAGGERED_INTERVALS.length]}
          className={getGridPosition(cell.name)}
          priority={i < 2}
        />
      ))}
    </div>
  );
}
