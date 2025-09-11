#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const additionalTextures = [
  {
    id: 'vintage-leather-luxury',
    filename: 'vintage-leather-luxury.webp',
    style: 'Abstract texture',
    usage: 'Service cards, VIP sections',
    prompt: `Generate a close-up photo of rich, vintage cognac-colored leather texture with subtle grain patterns and gold embossing details. The image should have a luxurious, tactile quality with soft lighting that highlights the leather's natural texture. Include subtle hints of gold thread stitching. Professional product photography style with shallow depth of field. Ultra high resolution, 8K quality.`
  },
  {
    id: 'premium-wood-grain',
    filename: 'premium-wood-grain.webp',
    style: 'Natural texture',
    usage: 'Corporate sections, professional cards',
    prompt: `Create a photograph of polished mahogany wood grain with rich, dark brown tones and natural wood patterns. The surface should have a glossy, lacquered finish that reflects soft golden light. Include subtle variations in the grain pattern for visual interest. Professional architectural photography style. Ultra high resolution, 8K quality.`
  },
  {
    id: 'silk-fabric-gold',
    filename: 'silk-fabric-gold.webp',
    style: 'Fabric texture',
    usage: 'Wedding sections, elegant backgrounds',
    prompt: `Generate an image of flowing champagne-colored silk fabric with subtle gold shimmer threads woven throughout. The fabric should have elegant folds and drapes creating depth and movement. Soft, diffused lighting should highlight the fabric's lustrous quality. Fashion photography style with attention to texture detail. Ultra high resolution, 8K quality.`
  },
  {
    id: 'crystal-prism-light',
    filename: 'crystal-prism-light.webp',
    style: 'Light refraction',
    usage: 'Hero sections, premium features',
    prompt: `Create an abstract image of light refracting through crystal prisms creating rainbow spectrum effects with emphasis on gold and amber tones. The composition should be elegant and sophisticated with soft bokeh effects in the background. Luxury product photography style with dramatic lighting. Ultra high resolution, 8K quality.`
  },
  {
    id: 'brushed-metal-gold',
    filename: 'brushed-metal-gold.webp',
    style: 'Metal texture',
    usage: 'Modern sections, tech features',
    prompt: `Generate a close-up photograph of brushed gold metal surface with fine linear texture patterns. The metal should have a sophisticated matte finish with subtle variations in tone from rose gold to champagne gold. Industrial design photography style with precise lighting to show texture. Ultra high resolution, 8K quality.`
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTexture(texture: any) {
  console.log(`\n🎨 Generating: ${texture.id}`);
  console.log(`   Style: ${texture.style}`);
  console.log(`   Usage: ${texture.usage}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Additional Textures'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: texture.prompt
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

    // Save to textures directory
    const outputDir = 'public/images/textures';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, texture.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, texture.filename);
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 92 }) // High quality for textures
      .toFile(webpPath);
    
    fs.unlinkSync(pngPath);
    console.log(`   ✅ Created: ${webpPath}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generateAdditionalTextures() {
  console.log('🎨 PartyOn Additional Texture Generation');
  console.log('=========================================');
  
  for (const texture of additionalTextures) {
    await generateTexture(texture);
    
    if (additionalTextures.indexOf(texture) < additionalTextures.length - 1) {
      console.log('   ⏳ Waiting...');
      await sleep(2000);
    }
  }

  console.log('\n✅ Additional textures generated!');
  console.log('These provide more variety for different sections and moods');
}

generateAdditionalTextures();