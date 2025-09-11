#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { creativePrompts } from '../lib/image-generation/creative-prompts';

const apiKey = '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';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateCreativeImage(prompt: any) {
  console.log(`\n🎨 Generating: ${prompt.id}`);
  console.log(`   Style: ${prompt.style}`);
  console.log(`   Usage: ${prompt.usage}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Creative Textures'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt.prompt
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

    const pngPath = path.join(outputDir, prompt.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, prompt.filename);
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 }) // Higher quality for textures
      .toFile(webpPath);
    
    fs.unlinkSync(pngPath);
    console.log(`   ✅ Created: ${webpPath}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generateCreativeTextures() {
  console.log('🎨 PartyOn Creative Texture Generation');
  console.log('======================================');
  
  // Select the most impactful textures
  const selectedPrompts = creativePrompts.slice(0, 5);
  
  for (const prompt of selectedPrompts) {
    await generateCreativeImage(prompt);
    
    if (selectedPrompts.indexOf(prompt) < selectedPrompts.length - 1) {
      console.log('   ⏳ Waiting...');
      await sleep(2000);
    }
  }

  console.log('\n✅ Creative textures generated!');
  console.log('Use these in package cards, section backgrounds, and overlays');
}

generateCreativeTextures();