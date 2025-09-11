export interface EnhancementPrompt {
  id: string;
  filename: string;
  location: string; // Where to use this image
  category: 'homepage' | 'about' | 'products' | 'trust' | 'process' | 'gallery';
  priority: 1 | 2 | 3;
  prompt: string;
  description: string;
}

export const enhancementPrompts: EnhancementPrompt[] = [
  // HOMEPAGE ENHANCEMENTS - Priority 1
  {
    id: 'curated-selection-bg',
    filename: 'curated-selection-bg.webp',
    location: 'Homepage - Curated Selection section background',
    category: 'homepage',
    priority: 1,
    description: 'Elegant bar setup for Curated Selection section',
    prompt: `Ultra-photorealistic commercial photography of an elegant premium bar display in a luxury Austin penthouse, shot with Sony A7R V and 35mm f/1.4. Sophisticated arrangement of top-shelf spirits including rare whiskeys, premium tequilas, and craft vodkas on a backlit marble bar shelf with gold accents (#D4AF37). Crystal decanters and gold-rimmed glassware catch warm ambient lighting. Background shows blurred Austin skyline through floor-to-ceiling windows during golden hour. Professional styling with perfect product placement, dramatic lighting emphasizing bottle labels and liquid colors. Atmosphere suggests exclusive selection and connoisseurship. Commercial quality suitable for luxury brand marketing. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'swift-delivery-bg',
    filename: 'swift-delivery-bg.webp',
    location: 'Homepage - Swift Delivery section background',
    category: 'homepage',
    priority: 1,
    description: 'Premium delivery vehicle in upscale Austin neighborhood',
    prompt: `Professional commercial photography of a luxury black SUV with subtle PartyOn Delivery branding parked in front of an elegant Austin home in Westlake Hills, captured with Canon R5 and 24-70mm f/2.8. The vehicle features professional detailing with gold accent pinstriping (#D4AF37). Uniformed delivery professional in crisp white shirt and black vest carrying premium branded delivery bags toward the entrance. Background showcases manicured landscape, limestone architecture typical of luxury Austin neighborhoods. Shot during golden hour with warm lighting creating sophisticated ambiance. Professional automotive photography quality with perfect exposure and sharp details. Suggests premium service and reliability. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'trusted-excellence-bg',
    filename: 'trusted-excellence-bg.webp',
    location: 'Homepage - Trusted Excellence section background',
    category: 'homepage',
    priority: 1,
    description: 'Professional certifications and awards display',
    prompt: `Sophisticated commercial photography of a professional awards wall in an elegant Austin office, shot with Phase One XF and 50mm lens. Display features framed TABC certification, business excellence awards, and Austin Chamber of Commerce recognitions arranged on a dark wood-paneled wall with accent lighting. Gold frames and plaques (#D4AF37) create luxury appeal. Professional certificates clearly visible but artistically composed. Soft depth of field draws focus to key certifications while maintaining elegant atmosphere. Background suggests established business credibility and regulatory compliance. Professional interior photography with perfect lighting emphasizing trust and authority. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // ABOUT PAGE - Team & Operations - Priority 1
  {
    id: 'professional-bartender-team',
    filename: 'professional-bartender-team.webp',
    location: 'About page - Team section',
    category: 'about',
    priority: 1,
    description: 'Professional bartender team in formal attire',
    prompt: `Professional corporate photography of an elite bartending team of 5 diverse professionals in luxury service attire, photographed with Sony A7R V and 85mm f/1.4 in an upscale Austin venue. Team wearing crisp white shirts, black vests with gold pocket squares (#D4AF37), standing confidently behind an elegant marble bar. Professional lighting creates warm, approachable atmosphere while maintaining luxury positioning. Background shows sophisticated bar setup with premium spirits display. Each team member displays professional confidence and warmth. Commercial portrait quality suitable for luxury hospitality branding. Authentic diversity representing Austin's cosmopolitan culture. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'premium-warehouse-facility',
    filename: 'premium-warehouse-facility.webp',
    location: 'About page - Operations section',
    category: 'about',
    priority: 1,
    description: 'Temperature-controlled premium storage facility',
    prompt: `Professional commercial photography of a pristine temperature-controlled warehouse facility for premium alcohol storage, captured with Fujifilm GFX 100S and 35mm f/2. Organized rows of premium spirits, wines, and champagnes on professional racking systems with LED lighting. Digital temperature displays showing optimal storage conditions. Clean, modern facility with polished concrete floors reflecting overhead lighting. Professional staff member in PartyOn uniform conducting inventory with tablet. Gold accent lighting (#D4AF37) highlighting premium product sections. Suggests operational excellence, quality control, and professional inventory management. Ultra-sharp commercial quality emphasizing cleanliness and organization. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // PRODUCTS PAGE ENHANCEMENTS - Priority 1
  {
    id: 'premium-spirits-lifestyle',
    filename: 'premium-spirits-lifestyle.webp',
    location: 'Products page - Spirits category',
    category: 'products',
    priority: 1,
    description: 'Premium spirits in luxury library setting',
    prompt: `Ultra-luxurious lifestyle photography of premium spirits collection in an elegant Austin home library, shot with Canon R6 Mark II and 50mm f/1.2. Sophisticated arrangement of rare whiskeys, aged tequilas, and craft gins on a mahogany bar cart with gold hardware (#D4AF37). Leather-bound books, globe, and crystal decanters create old-money ambiance. Warm fireplace glow and ambient lighting through leaded glass windows. Professional styling with perfect product placement showcasing bottle details. Rich textures of leather, wood, and crystal. Atmosphere suggests refined taste and exclusive collection. Commercial quality suitable for luxury spirits marketing. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'wine-collection-cellar',
    filename: 'wine-collection-cellar.webp',
    location: 'Products page - Wine category',
    category: 'products',
    priority: 1,
    description: 'Premium wine collection in elegant cellar',
    prompt: `Professional wine photography in a luxury Austin home wine cellar, captured with Sony A7R V and 35mm f/1.4. Temperature-controlled cellar with custom wood racking displaying premium wine collection including Opus One, Caymus, and Austin-area vintages. Dramatic lighting creates shadows and highlights on bottles. Professional sommelier in elegant attire selecting a bottle. Gold accent lighting (#D4AF37) on featured selections. Stone walls and controlled climate visible. Perfect exposure showing label details while maintaining atmospheric lighting. Commercial quality emphasizing collection value and proper storage. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // PROCESS VISUALIZATION - Priority 2
  {
    id: 'order-placement-luxury',
    filename: 'order-placement-luxury.webp',
    location: 'How it works - Order step',
    category: 'process',
    priority: 2,
    description: 'Customer placing order on premium device',
    prompt: `Sophisticated lifestyle photography of an affluent customer placing a PartyOn Delivery order on a gold MacBook Pro, shot with Canon R5 and 85mm f/1.4. Elegant home office in Austin with city views through windows. Well-dressed professional in business casual attire browsing premium spirits selection on screen. Marble desk with gold accessories (#D4AF37), fresh flowers, and champagne flute. Soft natural lighting creating warm, inviting atmosphere. Screen showing elegant PartyOn interface (subtle, not focus). Professional lifestyle photography emphasizing ease and sophistication of ordering process. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'professional-selection-process',
    filename: 'professional-selection-process.webp',
    location: 'How it works - Preparation step',
    category: 'process',
    priority: 2,
    description: 'Expert selecting premium products',
    prompt: `Professional commercial photography of a PartyOn specialist carefully selecting premium spirits from inventory, captured with Phase One XT and 50mm lens. Expert in professional attire with gold name badge (#D4AF37) examining bottle details with tablet showing customer order. Well-lit warehouse environment with organized premium inventory. Professional checking authenticity seals and expiration dates. Branded delivery bags being prepared in background. Suggests quality control, attention to detail, and professional service. Sharp commercial photography with perfect exposure showing operational excellence. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'white-glove-delivery',
    filename: 'white-glove-delivery.webp',
    location: 'How it works - Delivery step',
    category: 'process',
    priority: 2,
    description: 'Professional delivery at luxury Austin home',
    prompt: `Elegant commercial photography of PartyOn Delivery professional at the entrance of a luxury Austin estate, shot with Sony A7R V and 24-70mm f/2.8. Uniformed delivery specialist in crisp white shirt and black vest with gold accents (#D4AF37) presenting branded delivery bags to well-dressed customer at ornate front door. Limestone architecture and manicured landscaping typical of Westlake Hills. Professional vehicle visible in circular driveway. Golden hour lighting creating warm, welcoming atmosphere. ID verification process subtly visible. Commercial quality emphasizing professional service and premium experience. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'event-in-progress',
    filename: 'event-in-progress.webp',
    location: 'How it works - Service completion',
    category: 'process',
    priority: 2,
    description: 'Successful event with PartyOn service',
    prompt: `Vibrant lifestyle photography of an upscale Austin rooftop party in full swing with PartyOn Delivery service evident, captured with Canon R6 and 35mm f/1.4. Elegant guests enjoying craft cocktails with Austin skyline including Frost Bank Tower in background during blue hour. Professional bartender in PartyOn attire serving premium drinks at a mobile bar with gold accents (#D4AF37). String lights and modern furniture creating sophisticated atmosphere. Branded ice buckets and premium spirits display visible. Happy, diverse group of Austin professionals celebrating. Commercial event photography showing service success and customer satisfaction. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // TRUST & SOCIAL PROOF - Priority 2
  {
    id: 'austin-community-event',
    filename: 'austin-community-event.webp',
    location: 'About page - Community involvement',
    category: 'trust',
    priority: 2,
    description: 'PartyOn at Austin charity gala',
    prompt: `Professional event photography of PartyOn Delivery serving at an upscale Austin charity gala at the Four Seasons, shot with Sony A7R V and 24-70mm f/2.8. Elegant ballroom with PartyOn-branded premium bar service station with gold accents (#D4AF37). Well-dressed Austin philanthropists and business leaders enjoying signature cocktails. PartyOn team in formal attire providing exceptional service. Austin skyline visible through ballroom windows. Charity auction displays and elegant décor. Professional lighting capturing warmth and sophistication of community partnership. Commercial quality showing brand's involvement in Austin's social scene. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'customer-celebration-moment',
    filename: 'customer-celebration-moment.webp',
    location: 'Homepage - Testimonials section',
    category: 'trust',
    priority: 2,
    description: 'Authentic customer celebration with PartyOn service',
    prompt: `Candid lifestyle photography of a genuine celebration moment at an Austin home with PartyOn Delivery service, captured with Canon R5 and 50mm f/1.2. Diverse group of happy customers toasting with premium cocktails at an elegant backyard party overlooking Lake Travis. PartyOn-branded bar setup with gold details (#D4AF37) and professional bartender in background. Authentic joy and laughter, not staged or stock-looking. Golden hour lighting creating magical atmosphere. Texas hill country visible in background. Professional event photography quality capturing real customer satisfaction. 16:9 aspect ratio, 2912x1632 resolution.`
  },

  // GALLERY & SHOWCASE - Priority 3
  {
    id: 'sxsw-vip-service',
    filename: 'sxsw-vip-service.webp',
    location: 'Gallery - Austin events',
    category: 'gallery',
    priority: 3,
    description: 'SXSW VIP hospitality setup',
    prompt: `Dynamic commercial photography of PartyOn Delivery's premium bar service at a SXSW VIP event in downtown Austin, shot with Fujifilm GFX 100S and 35mm f/2. Modern rooftop venue with Austin's music district visible. Tech executives and music industry professionals enjoying craft cocktails. Multiple PartyOn service stations with gold branding (#D4AF37). DJ booth and stage setup visible. Downtown Austin energy with neon lights beginning to glow at dusk. Professional event photography capturing Austin's signature festival atmosphere with luxury service overlay. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'hill-country-wedding-bar',
    filename: 'hill-country-wedding-bar.webp',
    location: 'Gallery - Wedding services',
    category: 'gallery',
    priority: 3,
    description: 'Elegant Hill Country wedding bar setup',
    prompt: `Romantic wedding photography of PartyOn Delivery's premium bar service at a Texas Hill Country vineyard wedding, captured with Canon R6 Mark II and 85mm f/1.4. Elegant outdoor bar with reclaimed wood and gold accents (#D4AF37) under string lights and oak trees. Professional bartenders serving signature cocktails to wedding guests in cocktail attire. Sunset over rolling hills with limestone outcroppings. Lavender fields and vineyard rows visible. Crystal glassware and premium spirits beautifully displayed. Professional wedding photography quality emphasizing romantic ambiance and luxury service. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'ut-gameday-tailgate',
    filename: 'ut-gameday-tailgate.webp',
    location: 'Gallery - Austin sports events',
    category: 'gallery',
    priority: 3,
    description: 'Premium tailgate service for UT game day',
    prompt: `Energetic commercial photography of PartyOn Delivery's premium tailgate service at a University of Texas football game day, shot with Sony A7R V and 24-70mm f/2.8. Upscale tailgate setup with PartyOn mobile bar featuring burnt orange and gold accents (#D4AF37). Alumni and fans in UT apparel enjoying premium cocktails and cold beer. Professional bartender in PartyOn uniform with UT accessories. DKR Stadium visible in background. Premium SUVs and tailgate setup showing elevated game day experience. Professional sports event photography capturing Austin's football culture with luxury twist. 16:9 aspect ratio, 2912x1632 resolution.`
  }
];

export function getEnhancementsByPriority(priority: 1 | 2 | 3): EnhancementPrompt[] {
  return enhancementPrompts.filter(p => p.priority === priority);
}

export function getEnhancementsByCategory(category: EnhancementPrompt['category']): EnhancementPrompt[] {
  return enhancementPrompts.filter(p => p.category === category);
}