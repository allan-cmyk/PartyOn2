export interface ImagePrompt {
  id: string;
  filename: string;
  category: 'hero' | 'boat-party' | 'wedding' | 'corporate' | 'rooftop' | 'nightlife';
  priority: 1 | 2 | 3;
  currentPath?: string;
  prompt: string;
  description: string;
}

export const imagePrompts: ImagePrompt[] = [
  // Priority 1: Critical Hero Images
  {
    id: 'austin-skyline-hero',
    filename: 'austin-skyline-hero.webp',
    category: 'hero',
    priority: 1,
    currentPath: '/images/hero/austin-skyline-hero.webp',
    description: 'Homepage main hero - Golden hour Austin skyline',
    prompt: `Ultra-photorealistic commercial photography of Austin skyline during golden hour, shot with Sony A7R V and 85mm lens at f/2.8. Foreground features the iconic Texas State Capitol dome in sharp focus, with the downtown Austin skyline rising majestically behind it including the distinctive Frost Bank Tower and Austonian. Warm golden sunlight bathes the limestone Capitol building, creating rich textures and dramatic shadows. The modern glass towers catch and reflect the amber light, creating a sophisticated contrast between historic and contemporary Austin. Color grading emphasizes warm golds (#D4AF37), deep blues, and rich creams. Composition uses rule of thirds with Capitol positioned left-third, skyline filling right two-thirds. Professional commercial quality with tack-sharp details, perfect exposure, and luxurious atmosphere that speaks to affluent Austin residents. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'austin-skyline-golden-hour',
    filename: 'austin-skyline-golden-hour.webp',
    category: 'hero',
    priority: 1,
    currentPath: '/images/hero/austin-skyline-golden-hour.webp',
    description: 'Service pages hero - Blue hour panoramic',
    prompt: `Breathtaking blue hour panoramic photograph of downtown Austin skyline, captured with Phase One XF 100MP and 35mm lens at f/8. Shot from elevated position showing the full downtown corridor with Frost Bank Tower, Austonian, and Google Tower illuminated against deep twilight sky. City lights create warm golden reflections on Lady Bird Lake in foreground. Color palette features deep sapphire blues transitioning to warm amber building lights and gold accents (#D4AF37). Professional architectural photography lighting with no harsh shadows, perfect white balance showcasing both the cool evening sky and warm interior lighting. Composition emphasizes the grandeur and sophistication of Austin's urban landscape. Ultra-high resolution commercial quality suitable for luxury brand marketing, evoking exclusivity and metropolitan refinement. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'luxury-yacht-deck',
    filename: 'luxury-yacht-deck.webp',
    category: 'boat-party',
    priority: 1,
    currentPath: '/images/services/boat-parties/luxury-yacht-deck.webp',
    description: 'Boat parties hero - Sunset yacht celebration',
    prompt: `Ultra-photorealistic luxury yacht party on Lake Travis during golden hour sunset, shot with Sony A7R V and 24-70mm f/2.8. Elegant 60-foot yacht anchored in a quiet cove with Austin's distinctive limestone cliffs and Texas Hill Country rolling in the background. Sophisticated group of 12-15 well-dressed guests enjoying premium champagne service - Dom Pérignon bottles in crystal ice buckets, professional cocktail service with gold-rimmed glassware. Natural lighting from warm sunset creates golden reflections on the water and illuminates the limestone cliffs' texture. Color grading emphasizes luxury golds (#D4AF37), deep blues of Lake Travis water, and warm skin tones. Composition captures both intimate conversation groups and the stunning natural Austin backdrop. Commercial photography quality with perfect exposure, professional styling, and aspirational luxury lifestyle appeal. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'sunset-champagne-pontoon',
    filename: 'sunset-champagne-pontoon.webp',
    category: 'boat-party',
    priority: 1,
    currentPath: '/images/services/boat-parties/sunset-champagne-pontoon.webp',
    description: 'Intimate premium pontoon party',
    prompt: `High-end lifestyle photography of luxury pontoon boat on Lake Travis, captured with Canon R6 Mark II and 50mm f/1.4. Small group of 6 sophisticated friends enjoying craft cocktails and premium spirits, with a professional mobile bar setup featuring top-shelf bottles, artisanal ice, and elegant glassware with gold accents. Background showcases Lake Travis's signature limestone cliffs and native Texas cedar trees. Shot during blue hour with warm interior lighting from elegant pendant lights strung overhead. The pontoon features luxury amenities - teak decking, premium seating, and sophisticated design elements. Color palette emphasizes deep blues, warm brass/gold accents (#D4AF37), and natural limestone textures. Professional commercial styling with perfect product placement of premium alcohol brands. Atmosphere suggests exclusive, intimate luxury that appeals to affluent Austin residents. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'downtown-penthouse-terrace',
    filename: 'downtown-penthouse-terrace.webp',
    category: 'rooftop',
    priority: 1,
    currentPath: null,
    description: 'New rooftop terrace scene for services',
    prompt: `Ultra-luxury rooftop terrace party in downtown Austin, shot with Sony A7R V and 35mm f/1.4 during blue hour. Sophisticated penthouse setting with floor-to-ceiling glass railings overlooking the illuminated Austin skyline including Frost Bank Tower and State Capitol. Elegant group of 15 affluent guests enjoying premium cocktail service with professional bartenders, top-shelf spirits displayed in backlit shelving, and artisanal ice service. Modern outdoor furniture with gold accent lighting (#D4AF37) and sophisticated landscape design. Color grading emphasizes the contrast between warm interior/party lighting and cool blue Austin skyline. Professional event photography with perfect exposure capturing both intimate party details and spectacular city views. Atmosphere suggests exclusive Austin lifestyle and premium entertainment. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // Priority 2: Additional Service Images
  {
    id: 'hill-country-wedding',
    filename: 'hill-country-wedding.webp',
    category: 'wedding',
    priority: 2,
    currentPath: null,
    description: 'Luxury wedding reception in Texas Hill Country',
    prompt: `Luxury wedding reception at Texas Hill Country estate venue, shot with Phase One XT and 85mm lens during golden hour. Elegant outdoor celebration under century-old oak trees with premium bar service stations featuring crystal glassware, champagne towers with gold-rimmed coupes, and top-shelf spirit displays. Professional catering staff in formal attire providing white-glove alcohol service to 100+ well-dressed guests. Background showcases rolling Texas hills, limestone outcroppings, and authentic Hill Country landscape. Color grading emphasizes warm golds (#D4AF37), natural greens, and elegant wedding whites. Professional event photography with perfect lighting that captures both intimate celebration moments and premium alcohol service details. Represents PartyOn Delivery's capability for high-end Austin wedding market. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'corporate-loft-event',
    filename: 'corporate-loft-event.webp',
    category: 'corporate',
    priority: 2,
    currentPath: null,
    description: 'Sophisticated corporate event in downtown loft',
    prompt: `Sophisticated corporate event in converted downtown Austin loft space, photographed with Sony A7R V and 24-105mm f/4. Industrial-chic venue with exposed brick walls, polished concrete floors, and floor-to-ceiling windows overlooking the Austin skyline. Premium alcohol service with multiple bar stations, professional bartenders in crisp white shirts and black vests, and elegant presentation of craft cocktails and premium spirits. Group of 75 professionally dressed attendees networking in an upscale business atmosphere. Modern lighting design creates warm ambiance with gold accents (#D4AF37) while showcasing the premium alcohol displays and Austin's urban architecture through large windows. Color palette features sophisticated grays, warm brass accents, and dramatic Austin skyline lighting. Commercial event photography suitable for B2B marketing to Austin's corporate community. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'lake-austin-pavilion',
    filename: 'lake-austin-pavilion.webp',
    category: 'wedding',
    priority: 2,
    currentPath: null,
    description: 'Lakefront wedding pavilion celebration',
    prompt: `Exclusive lakefront wedding reception at luxury Lake Austin venue, captured with Canon R6 Mark II and 70-200mm f/2.8. Elegant waterfront pavilion with premium alcohol service overlooking Lake Austin's pristine waters and limestone cliffs. Professional bar service with champagne service, craft cocktail stations featuring gold-accented barware, and premium spirit displays in a sophisticated outdoor setting. Group of 80 elegantly dressed wedding guests celebrating against the backdrop of Lake Austin's natural beauty and luxury waterfront homes. Shot during blue hour with professional event lighting creating warm celebration atmosphere with gold uplighting (#D4AF37). Color grading emphasizes luxury golds, deep blues from the lake, and elegant celebration lighting. Represents the pinnacle of Austin luxury event services and appeals to affluent couples planning sophisticated celebrations. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'sixth-street-upscale',
    filename: 'sixth-street-upscale.webp',
    category: 'nightlife',
    priority: 2,
    currentPath: null,
    description: 'Upscale 6th Street cocktail lounge',
    prompt: `Sophisticated 6th Street cocktail lounge interior, shot with Fujifilm GFX 100S and 35mm f/2. Upscale bar environment with exposed brick walls, Edison bulb lighting creating warm golden ambiance, and premium spirit displays behind a polished copper bar with gold accents (#D4AF37). Well-dressed Austin professionals enjoying craft cocktails and premium alcohol service in an intimate, sophisticated atmosphere. Warm lighting creates golden ambiance while neon signs from historic 6th Street provide authentic Austin character visible through large windows. Color palette emphasizes warm brass/gold accents, rich leather textures, and dramatic lighting contrasts. Professional nightlife photography with perfect exposure balancing interior warmth and exterior neon character. Represents elevated Austin nightlife that appeals to affluent residents seeking sophisticated entertainment. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'austin-aerial-luxury',
    filename: 'austin-aerial-luxury.webp',
    category: 'hero',
    priority: 2,
    currentPath: null,
    description: 'Aerial view of downtown Austin',
    prompt: `Ultra-high-end aerial photograph of Austin's downtown core, shot with DJI Inspire 3 and Hasselblad X9 camera system. Bird's-eye view captures the geometric beauty of Austin's urban planning with the Colorado River winding through downtown, flanked by Lady Bird Lake Hike and Bike Trail. The iconic buildings - Frost Bank Tower, Austonian, Google Tower - appear as architectural jewels in perfect composition. Shot during magic hour with warm, directional lighting that emphasizes building textures and creates long, elegant shadows. Color palette features sophisticated golds (#D4AF37), deep blues from the water, and warm limestone tones. Professional commercial drone photography with perfect exposure and tack-sharp details throughout the frame. Evokes exclusivity and the premium Austin lifestyle from a unique perspective. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // Priority 3: Enhancement Images
  {
    id: 'morning-brunch-cruise',
    filename: 'morning-brunch-cruise.webp',
    category: 'boat-party',
    priority: 3,
    currentPath: null,
    description: 'Sophisticated morning yacht brunch',
    prompt: `Sophisticated morning yacht party on Lake Travis, photographed with Fujifilm GFX 100S and 85mm f/2. Elegant brunch cruise with 10-12 well-dressed guests enjoying mimosas with gold-rimmed champagne flutes, Bloody Marys, and premium champagne service on a pristine white yacht. Professional service staff attending to guests with silver serving trays and crystal glassware. Background showcases the serene morning beauty of Lake Travis with mist rising from the water and limestone cliffs bathed in soft morning light. The yacht features luxury amenities - polished teak, elegant seating areas with gold accent cushions, and professional bar setup with premium spirits displayed. Color palette emphasizes clean whites, sophisticated golds (#D4AF37), soft morning blues, and natural limestone tones. Perfect exposure with professional lighting that captures both the luxury details and stunning Austin lake scenery. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'festival-hero',
    filename: 'festival-hero.webp',
    category: 'hero',
    priority: 3,
    currentPath: '/images/hero/festival-hero.webp',
    description: 'Austin festival scene with premium service',
    prompt: `Professional commercial photography of premium alcohol service at an upscale Austin outdoor festival, shot with Sony A7R V and 24-70mm f/2.8. Sophisticated festival setting with elegant VIP area featuring premium bar service stations, professional bartenders in upscale attire, and affluent attendees enjoying craft cocktails and champagne. Background shows Austin skyline including State Capitol and Frost Bank Tower during golden hour. Multiple premium alcohol displays with gold-accented barware (#D4AF37), crystal ice buckets, and top-shelf spirits. Color grading emphasizes warm festival atmosphere with luxury gold accents, sophisticated crowd styling, and Austin's distinctive skyline. Professional event photography capturing the intersection of Austin's festival culture and premium lifestyle services. Atmosphere suggests exclusive access and elevated festival experience. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'rainey-street-luxury',
    filename: 'rainey-street-luxury.webp',
    category: 'nightlife',
    priority: 3,
    currentPath: null,
    description: 'Upscale Rainey Street bungalow bar',
    prompt: `Upscale converted bungalow bar on Austin's Rainey Street, photographed with Canon R5 and 35mm f/1.4 during blue hour. Historic house transformed into sophisticated cocktail destination with string lights creating warm golden ambiance, premium outdoor bar service on wraparound porch, and elegant patio furniture. Well-dressed Austin professionals enjoying craft cocktails and premium spirits served in gold-accented glassware (#D4AF37). Professional bartenders behind restored vintage bar with backlit premium spirit displays. Background shows contrast between historic Rainey Street character and modern Austin high-rises. Color palette features warm golden lighting, rich wood textures, and sophisticated outdoor entertainment atmosphere. Professional hospitality photography capturing Austin's unique blend of historic charm and modern luxury. 16:9 aspect ratio, 2912x1632 resolution.`
  }
];

export function getPromptsByPriority(priority: 1 | 2 | 3): ImagePrompt[] {
  return imagePrompts.filter(p => p.priority === priority);
}

export function getPromptsByCategory(category: ImagePrompt['category']): ImagePrompt[] {
  return imagePrompts.filter(p => p.category === category);
}

export function getPromptById(id: string): ImagePrompt | undefined {
  return imagePrompts.find(p => p.id === id);
}