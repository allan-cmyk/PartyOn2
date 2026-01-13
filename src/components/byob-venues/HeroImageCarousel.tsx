'use client';

import Image from 'next/image';

/** Selected venue images for hero carousel - best visuals from the venue directory */
const CAROUSEL_IMAGES = [
  {
    src: 'https://premierpartycruises.com/attached_assets/bachelor-party-group-guys-hero-compressed.webp',
    alt: 'Premier Party Cruises - Lake Travis party boats',
    venue: 'Premier Party Cruises',
  },
  {
    src: 'https://captainverdespartyboats.com/wp-content/uploads/2024/04/partypicltdc.webp',
    alt: 'Captain Verde Party Boats - Double decker pontoons',
    venue: 'Captain Verde\'s Party Boats',
  },
  {
    src: 'https://tideupboatrentals.com/wp-content/uploads/sites/5230/2022/02/F24F6772-E306-4B61-855F-CB363A53FFF1.jpg',
    alt: 'Tide Up Boat Rentals - Luxury pontoons on Lake Austin',
    venue: 'Tide Up Boat Rentals',
  },
  {
    src: 'https://images.unsplash.com/photo-1663080821866-c469deda373a?fm=jpg&q=80&w=1200',
    alt: 'Laguna Gloria - Italian villa on Lake Austin',
    venue: 'Laguna Gloria',
  },
  {
    src: 'https://static.showit.co/1200/k8gjpPLcvGmsiFc1Bl9Qdg/320303/pecan-springs-ranch-and-event-venue-15.jpg',
    alt: 'Pecan Springs Ranch - 17 acre venue with pecan trees',
    venue: 'Pecan Springs Ranch',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/67bf5a7cd6cc5920bb50f027/64cc4fb4-61ba-42ba-90b0-ac508225caa6/1087_Pam-Bryce-41616.jpg',
    alt: 'Chateau Bellevue - Historic 1874 mansion',
    venue: 'Chateau Bellevue',
  },
  {
    src: 'https://www.starhillranch.com/wp-content/uploads/2025/01/star-hill-ranch-chapel-of-love-202517.jpg',
    alt: 'Star Hill Ranch - Western village with historic chapel',
    venue: 'Star Hill Ranch',
  },
  {
    src: 'https://static.wixstatic.com/media/1e4714_3b06ab74d060441ea206a18c9121ee6c~mv2_d_3992_5976_s_4_2.jpg/v1/fill/w_980,h_1467,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1e4714_3b06ab74d060441ea206a18c9121ee6c~mv2_d_3992_5976_s_4_2.jpg',
    alt: 'Sekrit Theater - Hidden botanical garden venue',
    venue: 'Sekrit Theater',
  },
  {
    src: 'https://static.wixstatic.com/media/d6f5bf_93dc673626184c6198faf056db1d674c~mv2.jpg/v1/fill/w_980,h_980,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d6f5bf_93dc673626184c6198faf056db1d674c~mv2.jpg',
    alt: 'UMLAUF Sculpture Garden - Art and nature venue',
    venue: 'UMLAUF Sculpture Garden',
  },
  {
    src: 'https://static.showit.co/1200/W7W48aI3QGuS-9E-c5oLvw/123622/downtown_austin_wedding_venue_77.jpg',
    alt: 'Springdale Station - 1920s refurbished train station',
    venue: 'Springdale Station',
  },
  {
    src: 'https://static.showit.co/800/WMHRnI8QQies8kX4T8eJHA/164419/336687984.jpg',
    alt: 'Hummingbird House - 5-acre garden oasis',
    venue: 'Hummingbird House',
  },
  {
    src: 'https://cdn.prod.website-files.com/651061f9ce7fecb36c9c9cae/65a46170e0a68784c95af32e_Group%203896.png',
    alt: 'Fair Market - Iconic Quonset hut venue',
    venue: 'Fair Market',
  },
];

/**
 * Auto-scrolling image carousel for the BYOB venues hero section.
 * Uses CSS keyframe animation for smooth infinite scroll.
 * Images are duplicated to create seamless loop effect.
 */
export default function HeroImageCarousel() {
  // Duplicate images for seamless infinite loop
  const allImages = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Carousel track - scrolls continuously */}
      <div
        className="flex h-full animate-scroll-left hover:[animation-play-state:paused]"
        style={{
          width: `${CAROUSEL_IMAGES.length * 2 * 600}px`, // 600px per image * 2 sets
        }}
      >
        {allImages.map((image, index) => (
          <div
            key={`${image.venue}-${index}`}
            className="relative h-full flex-shrink-0"
            style={{ width: '600px' }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="600px"
              className="object-cover"
              priority={index < 3}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
    </div>
  );
}
