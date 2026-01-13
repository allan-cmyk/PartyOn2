'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/** All venue images for the mosaic - will cycle through these */
const ALL_IMAGES = [
  {
    src: 'https://premierpartycruises.com/attached_assets/bachelor-party-group-guys-hero-compressed.webp',
    alt: 'Premier Party Cruises - Lake Travis party boats',
  },
  {
    src: 'https://captainverdespartyboats.com/wp-content/uploads/2024/04/partypicltdc.webp',
    alt: 'Captain Verde Party Boats - Double decker pontoons',
  },
  {
    src: 'https://tideupboatrentals.com/wp-content/uploads/sites/5230/2022/02/F24F6772-E306-4B61-855F-CB363A53FFF1.jpg',
    alt: 'Tide Up Boat Rentals - Luxury pontoons on Lake Austin',
  },
  {
    src: 'https://images.unsplash.com/photo-1663080821866-c469deda373a?fm=jpg&q=80&w=1200',
    alt: 'Laguna Gloria - Italian villa on Lake Austin',
  },
  {
    src: 'https://static.showit.co/1200/k8gjpPLcvGmsiFc1Bl9Qdg/320303/pecan-springs-ranch-and-event-venue-15.jpg',
    alt: 'Pecan Springs Ranch - 17 acre venue with pecan trees',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/67bf5a7cd6cc5920bb50f027/64cc4fb4-61ba-42ba-90b0-ac508225caa6/1087_Pam-Bryce-41616.jpg',
    alt: 'Chateau Bellevue - Historic 1874 mansion',
  },
  {
    src: 'https://www.starhillranch.com/wp-content/uploads/2025/01/star-hill-ranch-chapel-of-love-202517.jpg',
    alt: 'Star Hill Ranch - Western village with historic chapel',
  },
  {
    src: 'https://static.wixstatic.com/media/1e4714_3b06ab74d060441ea206a18c9121ee6c~mv2_d_3992_5976_s_4_2.jpg/v1/fill/w_980,h_1467,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1e4714_3b06ab74d060441ea206a18c9121ee6c~mv2_d_3992_5976_s_4_2.jpg',
    alt: 'Sekrit Theater - Hidden botanical garden venue',
  },
  {
    src: 'https://static.wixstatic.com/media/d6f5bf_93dc673626184c6198faf056db1d674c~mv2.jpg/v1/fill/w_980,h_980,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d6f5bf_93dc673626184c6198faf056db1d674c~mv2.jpg',
    alt: 'UMLAUF Sculpture Garden - Art and nature venue',
  },
  {
    src: 'https://static.showit.co/1200/W7W48aI3QGuS-9E-c5oLvw/123622/downtown_austin_wedding_venue_77.jpg',
    alt: 'Springdale Station - 1920s refurbished train station',
  },
  {
    src: 'https://static.showit.co/800/WMHRnI8QQies8kX4T8eJHA/164419/336687984.jpg',
    alt: 'Hummingbird House - 5-acre garden oasis',
  },
  {
    src: 'https://cdn.prod.website-files.com/651061f9ce7fecb36c9c9cae/65a46170e0a68784c95af32e_Group%203896.png',
    alt: 'Fair Market - Iconic Quonset hut venue',
  },
];

/** Grid cell configuration - each has different timing for staggered effect */
const GRID_CELLS = [
  { id: 0, startIndex: 0, interval: 3000, className: 'col-span-2 row-span-2' }, // Large featured
  { id: 1, startIndex: 3, interval: 4000, className: 'col-span-1 row-span-1' },
  { id: 2, startIndex: 5, interval: 3500, className: 'col-span-1 row-span-1' },
  { id: 3, startIndex: 7, interval: 4500, className: 'col-span-1 row-span-1' },
  { id: 4, startIndex: 9, interval: 3200, className: 'col-span-1 row-span-1' },
  { id: 5, startIndex: 11, interval: 3800, className: 'col-span-2 row-span-1' }, // Wide bottom
];

interface MosaicCellProps {
  startIndex: number;
  interval: number;
  className: string;
  priority?: boolean;
}

function MosaicCell({ startIndex, interval, className, priority = false }: MosaicCellProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex % ALL_IMAGES.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextIndex, setNextIndex] = useState((startIndex + 1) % ALL_IMAGES.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);

      // After fade out, switch image
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % ALL_IMAGES.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [interval, nextIndex]);

  const currentImage = ALL_IMAGES[currentIndex];
  const nextImage = ALL_IMAGES[nextIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Current image */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
        />
      </div>

      {/* Next image (underneath, revealed during transition) */}
      <div className="absolute inset-0">
        <Image
          src={nextImage.src}
          alt={nextImage.alt}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
    </div>
  );
}

/**
 * Mosaic grid hero with staggered image transitions.
 * Creates a dynamic, energetic feel with multiple images changing independently.
 */
export default function HeroMosaicGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Mosaic Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-2 h-full gap-1">
        {GRID_CELLS.map((cell, index) => (
          <MosaicCell
            key={cell.id}
            startIndex={cell.startIndex}
            interval={cell.interval}
            className={cell.className}
            priority={index < 2}
          />
        ))}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
    </div>
  );
}
