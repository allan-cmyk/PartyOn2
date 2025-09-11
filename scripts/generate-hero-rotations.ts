#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const heroImages = [
  // Homepage heroes
  {
    id: 'homepage-hero-1',
    filename: 'homepage-hero-sunset.webp',
    dir: 'hero',
    prompt: `Generate a stunning golden hour photograph of Austin Texas skyline from Lady Bird Lake, with the sun setting behind the buildings creating a warm amber glow. Show paddle boarders and kayakers on the water. Ultra high resolution, professional cityscape photography.`
  },
  {
    id: 'homepage-hero-2',
    filename: 'homepage-hero-rooftop.webp',
    dir: 'hero',
    prompt: `Create an elegant rooftop bar scene in downtown Austin at twilight, with the Capitol building visible in background. Show sophisticated guests enjoying premium cocktails with a professional bartender. Luxury lifestyle photography, ultra high resolution.`
  },
  {
    id: 'homepage-hero-3',
    filename: 'homepage-hero-luxury.webp',
    dir: 'hero',
    prompt: `Generate a luxury penthouse interior in Austin with floor-to-ceiling windows showing the city skyline. Premium bar setup with crystal decanters, gold bar cart, elegant furniture. Evening atmosphere with warm lighting. Architectural photography, ultra high resolution.`
  },

  // Wedding heroes
  {
    id: 'wedding-hero-1',
    filename: 'wedding-hero-vineyard.webp',
    dir: 'hero',
    prompt: `Create a romantic Texas Hill Country vineyard wedding at golden hour. Elegant outdoor reception with string lights, long tables with white linens, premium bar setup. Lavender fields visible in background. Wedding photography style, ultra high resolution.`
  },
  {
    id: 'wedding-hero-2',
    filename: 'wedding-hero-ballroom.webp',
    dir: 'hero',
    prompt: `Generate an opulent ballroom wedding reception at the Driskill Hotel Austin. Crystal chandeliers, gold accents, elegant bar with professional bartenders in formal attire. Luxury wedding photography, ultra high resolution.`
  },
  {
    id: 'wedding-hero-3',
    filename: 'wedding-hero-garden.webp',
    dir: 'hero',
    prompt: `Create a romantic garden wedding at Laguna Gloria Austin. Outdoor ceremony by the lake at sunset, cocktail hour setup with elegant bar station. Natural beauty with sophisticated touches. Fine art wedding photography, ultra high resolution.`
  },

  // Bach party heroes
  {
    id: 'bach-hero-1',
    filename: 'bach-hero-rainey.webp',
    dir: 'hero',
    prompt: `Generate a vibrant Rainey Street Austin night scene with groups celebrating, colorful lights from the converted bungalow bars, people in party attire. Festive atmosphere with string lights overhead. Night lifestyle photography, ultra high resolution.`
  },
  {
    id: 'bach-hero-2',
    filename: 'bach-hero-party-bus.webp',
    dir: 'hero',
    prompt: `Create a luxury party bus interior with LED lights, premium bar setup, celebrating groups with champagne. Austin city lights visible through windows. Party atmosphere. Event photography, ultra high resolution.`
  },
  {
    id: 'bach-hero-3',
    filename: 'bach-hero-brewery.webp',
    dir: 'hero',
    prompt: `Generate a trendy Austin brewery scene with groups celebrating, craft beer flights, exposed brick walls, industrial chic decor. Festive daytime atmosphere. Lifestyle photography, ultra high resolution.`
  },

  // Corporate heroes
  {
    id: 'corporate-hero-1',
    filename: 'corporate-hero-conference.webp',
    dir: 'hero',
    prompt: `Create a sophisticated corporate conference setup at the JW Marriott Austin. Premium bar service, professionals networking with cocktails, modern architecture. Business event photography, ultra high resolution.`
  },
  {
    id: 'corporate-hero-2',
    filename: 'corporate-hero-tech.webp',
    dir: 'hero',
    prompt: `Generate a modern tech company rooftop event in downtown Austin at sunset. Professionals mingling with craft cocktails, Austin skyline backdrop, sleek modern design. Corporate event photography, ultra high resolution.`
  },
  {
    id: 'corporate-hero-3',
    filename: 'corporate-hero-gala.webp',
    dir: 'hero',
    prompt: `Create an elegant corporate gala at the Long Center Austin. Black-tie event with premium bar service, city lights reflection on Lady Bird Lake visible. Luxury event photography, ultra high resolution.`
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
        'X-Title': 'PartyOn Hero Rotations'
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
      .resize(1920, 1080, { fit: 'cover', position: 'center' })
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

async function generateHeroRotations() {
  console.log('🎨 Generating Hero Rotation Images for PartyOn');
  console.log('============================================');
  
  console.log(`Total images to generate: ${heroImages.length}`);

  for (const image of heroImages) {
    await generateImage(image);
    
    if (heroImages.indexOf(image) < heroImages.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await sleep(2000);
    }
  }

  console.log('\n✅ All hero rotation images generated!');
}

generateHeroRotations();