'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CELL_MEDIA as SCANNED_MEDIA, type CollageMedia } from '@/generated/hero-media-manifest';

/** Pool all scanned images from every folder, then distribute across 3 cells */
function buildThreeCells(): CollageMedia[][] {
  const all = SCANNED_MEDIA.flat();
  if (all.length === 0) return [[], [], []];

  // Shuffle deterministically by distributing round-robin
  const cells: CollageMedia[][] = [[], [], []];
  all.forEach((item, i) => cells[i % 3].push(item));
  return cells;
}

const POOLED_CELLS = buildThreeCells();

/** Staggered display intervals per cell (ms) — slow and relaxed */
const CELL_INTERVALS = [8000, 10000, 9000];

/** Crossfade duration (ms) */
const CROSSFADE_MS = 1500;

/** Max video play time before auto-advancing (ms) */
const VIDEO_MAX_DURATION = 10000;

interface CollageCellProps {
  media: CollageMedia[];
  interval: number;
  className: string;
  priority?: boolean;
}

function CollageCell({ media, interval, className, priority = false }: CollageCellProps) {
  // Dual-layer approach: alternate between layer A and layer B
  const [layerAIndex, setLayerAIndex] = useState(0);
  const [layerBIndex, setLayerBIndex] = useState(media.length > 1 ? 1 : 0);
  const [activeLayer, setActiveLayer] = useState<'a' | 'b'>('a');
  const [transitioning, setTransitioning] = useState(false);
  const nextImageIndex = useRef(media.length > 1 ? 2 % media.length : 0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const advanceToNext = useCallback(() => {
    if (transitioning || media.length <= 1) return;
    setTransitioning(true);

    // Flip to the other layer (it already has the next image loaded)
    const newActive = activeLayer === 'a' ? 'b' : 'a';
    setActiveLayer(newActive);

    // After crossfade completes, preload the NEXT image into the now-hidden layer
    setTimeout(() => {
      const upcoming = nextImageIndex.current;
      if (activeLayer === 'a') {
        // We just faded to B, so A is now hidden — load next image into A
        setLayerAIndex(upcoming);
      } else {
        // We just faded to A, so B is now hidden — load next image into B
        setLayerBIndex(upcoming);
      }
      nextImageIndex.current = (upcoming + 1) % media.length;
      setTransitioning(false);
    }, CROSSFADE_MS);
  }, [transitioning, activeLayer, media.length]);

  // Schedule the next advance
  useEffect(() => {
    if (media.length <= 1) return;
    const currentIndex = activeLayer === 'a' ? layerAIndex : layerBIndex;
    const current = media[currentIndex];

    if (current.type === 'video') {
      timerRef.current = setTimeout(advanceToNext, VIDEO_MAX_DURATION + 1000);
    } else {
      timerRef.current = setTimeout(advanceToNext, interval);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeLayer, layerAIndex, layerBIndex, media, interval, advanceToNext]);

  // When a video becomes active, play it
  useEffect(() => {
    const currentIndex = activeLayer === 'a' ? layerAIndex : layerBIndex;
    if (media[currentIndex].type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeLayer, layerAIndex, layerBIndex, media]);

  const mediaA = media[layerAIndex];
  const mediaB = media[layerBIndex];

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Layer A */}
      <div
        className="absolute inset-0"
        style={{
          opacity: activeLayer === 'a' ? 1 : 0,
          transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          zIndex: activeLayer === 'a' ? 2 : 1,
        }}
      >
        {mediaA.type === 'video' ? (
          <video
            ref={activeLayer === 'a' ? videoRef : undefined}
            src={mediaA.src}
            muted
            playsInline
            preload={activeLayer === 'a' ? 'auto' : 'metadata'}
            onEnded={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              advanceToNext();
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={mediaA.src}
            alt={mediaA.alt}
            fill
            sizes="(max-width: 768px) 50vw, 50vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>

      {/* Layer B */}
      <div
        className="absolute inset-0"
        style={{
          opacity: activeLayer === 'b' ? 1 : 0,
          transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          zIndex: activeLayer === 'b' ? 2 : 1,
        }}
      >
        {mediaB.type === 'video' ? (
          <video
            ref={activeLayer === 'b' ? videoRef : undefined}
            src={mediaB.src}
            muted
            playsInline
            preload={activeLayer === 'b' ? 'auto' : 'metadata'}
            onEnded={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              advanceToNext();
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={mediaB.src}
            alt={mediaB.alt}
            fill
            sizes="(max-width: 768px) 50vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.3)] z-10" />
    </div>
  );
}

/**
 * 3-cell media collage for the homepage hero.
 * Layout: 2 cells on top (side by side) + 1 full-width cell on bottom.
 * All images from every collage subfolder are pooled and distributed across the 3 cells.
 * Each cell independently cycles with a slow crossfade.
 *
 * To add media, drop files into public/images/hero/collage/{folder}/
 * Then run: npm run hero:refresh
 */
export default function HeroCollage() {
  if (POOLED_CELLS.every(c => c.length === 0)) return null;

  return (
    <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-3 h-[280px] md:h-[400px] lg:h-[500px]">
      {/* Top-left */}
      <CollageCell
        media={POOLED_CELLS[0]}
        interval={CELL_INTERVALS[0]}
        className="col-span-1 row-span-1"
        priority
      />
      {/* Top-right */}
      <CollageCell
        media={POOLED_CELLS[1]}
        interval={CELL_INTERVALS[1]}
        className="col-span-1 row-span-1"
      />
      {/* Bottom full-width */}
      <CollageCell
        media={POOLED_CELLS[2]}
        interval={CELL_INTERVALS[2]}
        className="col-span-2 row-span-1"
      />
    </div>
  );
}
