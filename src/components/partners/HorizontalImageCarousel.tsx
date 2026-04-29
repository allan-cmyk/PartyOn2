'use client';

import Image from 'next/image';

export interface CarouselImage {
  src: string;
  alt: string;
}

interface Props {
  images: CarouselImage[];
  /** Width of each image card in px. Default 480. */
  cardWidth?: number;
  /** Aspect ratio for each card. Default '4/5' (portrait). */
  aspect?: '1/1' | '4/5' | '3/4' | '4/3' | '16/9';
  /** Animation duration in seconds. Default 40. Lower = faster. */
  durationSec?: number;
  /** Optional className for the outer wrapper (height, rounded, overflow, etc.) */
  className?: string;
}

/**
 * Auto-scrolling horizontal image carousel.
 * Uses Tailwind's `animate-scroll-left` keyframe — duplicates the image set
 * once for a seamless loop. Pauses on hover.
 */
export default function HorizontalImageCarousel({
  images,
  cardWidth = 480,
  aspect = '4/5',
  durationSec = 40,
  className = '',
}: Props) {
  if (images.length === 0) return null;

  const aspectClass = {
    '1/1': 'aspect-square',
    '4/5': 'aspect-[4/5]',
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
  }[aspect];

  const doubled = [...images, ...images];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex gap-4 hover:[animation-play-state:paused]"
        style={{
          width: `${doubled.length * (cardWidth + 16)}px`,
          animation: `scrollLeft ${durationSec}s linear infinite`,
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className={`relative flex-shrink-0 ${aspectClass} rounded-xl overflow-hidden bg-gray-100`}
            style={{ width: `${cardWidth}px` }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={`${cardWidth}px`}
              className="object-cover"
              priority={i < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
