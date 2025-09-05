#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const missingImages = [
  // Partner type cards
  {
    id: 'restaurant-partner',
    filename: 'restaurant-partner.webp',
    dir: 'partners',
    prompt: `Generate an upscale restaurant interior with a sophisticated bar area, elegant dining tables, professional bartenders preparing cocktails. Show premium spirits displayed, warm lighting, and well-dressed diners. Professional restaurant photography, ultra high resolution.`
  },
  {
    id: 'hotel-partner',
    filename: 'hotel-partner.webp',
    dir: 'partners',
    prompt: `Create a luxury hotel lobby bar with marble counters, gold accents, professional bartender in formal attire, business travelers with cocktails. Show elegant furniture and Austin skyline through windows. Professional hospitality photography, ultra high resolution.`
  },
  {
    id: 'venue-partner',
    filename: 'venue-partner.webp',
    dir: 'partners',
    prompt: `Generate an elegant event venue with a professional bar setup for a wedding or corporate event, string lights, premium bar display, guests mingling. Beautiful Austin venue atmosphere. Professional event photography, ultra high resolution.`
  },
  {
    id: 'corporate-partner',
    filename: 'corporate-partner.webp',
    dir: 'partners',
    prompt: `Create a modern corporate office event space with a sleek bar setup, professionals networking with drinks, Austin tech company atmosphere, modern architecture. Professional corporate photography, ultra high resolution.`
  },

  // Better contact hero
  {
    id: 'contact-hero',
    filename: 'contact-hero-austin.webp',
    dir: 'hero',
    prompt: `Generate a stunning twilight photograph of downtown Austin skyline from across Lady Bird Lake, with the reflection of city lights on the water. Show the iconic Congress Avenue Bridge and modern skyscrapers illuminated. Premium, sophisticated atmosphere. Professional cityscape photography, ultra high resolution.`
  },

  // Contact quick links
  {
    id: 'phone-support',
    filename: 'phone-support.webp',
    dir: 'contact',
    prompt: `Create an elegant image of a professional customer service representative in formal attire speaking on a headset, with a luxury bar/hospitality setting in soft focus background. Warm, approachable atmosphere. Professional service photography, ultra high resolution.`
  },
  {
    id: 'email-contact',
    filename: 'email-contact.webp',
    dir: 'contact',
    prompt: `Generate a sophisticated workspace with a laptop showing an elegant email interface, premium spirits catalog, and handwritten notes on premium paper. Professional business atmosphere. Lifestyle photography, ultra high resolution.`
  },
  {
    id: 'visit-location',
    filename: 'visit-location.webp',
    dir: 'contact',
    prompt: `Create an inviting storefront or office entrance with PartyOn signage, Austin street scene, welcoming atmosphere with glass doors and elegant interior visible. Professional architectural photography, ultra high resolution.`
  },

  // Order page path cards
  {
    id: 'quick-order',
    filename: 'quick-order.webp',
    dir: 'order',
    prompt: `Generate an image of hands using a premium tablet or phone to browse an elegant alcohol catalog, with actual bottles of premium spirits visible on a marble counter. Fast, efficient shopping atmosphere. Professional e-commerce photography, ultra high resolution.`
  },
  {
    id: 'ai-concierge',
    filename: 'ai-concierge.webp',
    dir: 'order',
    prompt: `Create a futuristic yet elegant scene showing AI-powered recommendations on a screen, with holographic-style spirit suggestions, smart technology meets luxury service. Modern, sophisticated atmosphere. Tech lifestyle photography, ultra high resolution.`
  },
  {
    id: 'event-packages',
    filename: 'event-packages.webp',
    dir: 'order',
    prompt: `Generate a collage-style image showing various event types - wedding toast, corporate celebration, boat party, all with premium bar setups and happy guests. Celebration atmosphere. Professional event photography montage, ultra high resolution.`
  },

  // Epic boat party heroes (multiple for slider)
  {
    id: 'boat-party-epic-1',
    filename: 'boat-party-epic-sunset.webp',
    dir: 'boat-heroes',
    prompt: `Generate an EPIC Lake Travis boat party scene at golden hour with multiple luxury boats rafted together, crowds of people partying on decks, someone doing a backflip off the boat, champagne spraying, music speakers visible, Texas flag flying, jet skis circling. Vibrant party atmosphere with sunset sky. High-energy lifestyle photography, ultra high resolution.`
  },
  {
    id: 'boat-party-epic-2',
    filename: 'boat-party-epic-cove.webp',
    dir: 'boat-heroes',
    prompt: `Create an incredible Devil's Cove party scene on Lake Travis with 20+ boats anchored together, floating party platforms, people on inflatable unicorns and flamingos, DJ on one boat, beer pong tables, Texas and American flags everywhere. Crystal blue water, bright sunny day. Aerial drone photography perspective, ultra high resolution.`
  },
  {
    id: 'boat-party-epic-3',
    filename: 'boat-party-epic-night.webp',
    dir: 'boat-heroes',
    prompt: `Generate a luxurious nighttime yacht party on Lake Travis with LED lights on the boats, people dancing on deck, bartender making cocktails, Austin city lights in the distance, full moon reflection on water, party atmosphere with elegant touches. Night photography with dramatic lighting, ultra high resolution.`
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(item: any) {
  console.log(`\n🎨 Generating: ${item.id}`);
  console.log(`   Directory: ${item.dir}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Missing Images'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: item.prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('   ❌ API Error');
      return false;
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    let imageData: string | null = null;

    if (message?.images && message.images[0]) {
      const imageUrl = message.images[0].image_url?.url || message.images[0].url;
      if (imageUrl) {
        imageData = imageUrl;
      }
    }

    if (!imageData || !imageData.startsWith('data:image')) {
      console.error('   ❌ No image data');
      return false;
    }

    // Create directory if needed
    const outputDir = path.join('public/images', item.dir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, item.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, item.filename);
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    fs.unlinkSync(pngPath);
    console.log(`   ✅ Created: ${webpPath}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generateMissingImages() {
  console.log('🎨 Generating Missing Images for PartyOn');
  console.log('=========================================');
  
  console.log(`Total images to generate: ${missingImages.length}`);

  for (const image of missingImages) {
    await generateImage(image);
    
    if (missingImages.indexOf(image) < missingImages.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await sleep(2000);
    }
  }

  console.log('\n✅ All missing images generated!');
}

generateMissingImages();