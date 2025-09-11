#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const missingImages = [
  {
    id: 'homepage-hero-rooftop',
    filename: 'homepage-hero-rooftop.webp',
    dir: 'hero',
    prompt: `Create an elegant rooftop bar scene in downtown Austin at twilight, with the Texas State Capitol building visible in background. Show sophisticated guests enjoying premium cocktails with a professional bartender. Warm sunset lighting with city lights beginning to twinkle. Luxury lifestyle photography, ultra high resolution.`
  },
  {
    id: 'corporate-hero-tech',
    filename: 'corporate-hero-tech.webp',
    dir: 'hero',
    prompt: `Generate a modern tech company rooftop event in downtown Austin at sunset. Young professionals in smart casual attire mingling with craft cocktails, Austin skyline backdrop with Congress Avenue Bridge visible, sleek modern furniture and LED lighting. Corporate event photography, ultra high resolution.`
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
        'X-Title': 'PartyOn Fix Missing Heroes'
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

async function fixMissingHeroes() {
  console.log('🎨 Fixing Missing Hero Images for PartyOn');
  console.log('==========================================');
  
  console.log(`Total images to generate: ${missingImages.length}`);

  for (const image of missingImages) {
    await generateImage(image);
    
    if (missingImages.indexOf(image) < missingImages.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await sleep(2000);
    }
  }

  console.log('\n✅ Missing hero images fixed!');
}

fixMissingHeroes();