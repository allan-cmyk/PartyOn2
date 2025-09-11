#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const experienceImages = [
  {
    id: 'curated-selection',
    filename: 'curated-spirits-display.webp',
    title: 'Curated Selection',
    prompt: `Generate a luxurious photograph of a premium spirits collection display. Show an elegant bar setup with backlit shelves displaying top-shelf bottles of whiskey, vodka, gin, and tequila. Include crystal decanters, gold-rimmed glasses, and a professional sommelier examining a bottle. Soft, warm lighting highlighting the amber colors of the spirits. Professional product photography style with shallow depth of field. Ultra high resolution, 8K quality.`
  },
  {
    id: 'swift-delivery',
    filename: 'delivery-driver-premium.webp',
    title: 'Swift Delivery',
    prompt: `Create a professional photograph of a well-dressed delivery professional in a black uniform carrying a premium wooden crate with bottles visible, standing next to a luxury delivery vehicle (black SUV). Show the person smiling, with an Austin residential street in the background during golden hour. Include visible PartyOn branding on the uniform. Lifestyle photography style, warm and approachable, ultra high resolution, 8K quality.`
  },
  {
    id: 'trusted-excellence',
    filename: 'five-star-service.webp',
    title: 'Trusted Excellence',
    prompt: `Generate an elegant photograph showcasing professional service excellence. Show a certified bartender in formal attire preparing a cocktail at an upscale event, with visible TABC certification badge, professional bar tools, and happy, well-dressed guests in soft focus background. Include subtle awards or certificates on the wall. Professional event photography style with warm lighting. Ultra high resolution, 8K quality.`
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateExperienceImage(experience: any) {
  console.log(`\n🎯 Generating: ${experience.title}`);
  console.log(`   File: ${experience.filename}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Experience Images'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: experience.prompt
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

    // Save to experience directory
    const outputDir = 'public/images/experience';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, experience.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, experience.filename);
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

async function generateExperienceImages() {
  console.log('🎯 PartyOn Experience Images Generation');
  console.log('========================================');
  
  for (const experience of experienceImages) {
    await generateExperienceImage(experience);
    
    if (experienceImages.indexOf(experience) < experienceImages.length - 1) {
      console.log('   ⏳ Waiting...');
      await sleep(2000);
    }
  }

  console.log('\n✅ Experience images generated!');
  console.log('Now updating the homepage to use these context-specific images');
}

generateExperienceImages();