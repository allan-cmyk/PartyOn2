#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { imagePrompts } from '../lib/image-generation/prompts';

const apiKey = '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';

async function generateSingleImage() {
  // Get the first priority 1 image (austin-skyline-hero)
  const prompt = imagePrompts.find(p => p.id === 'austin-skyline-hero');
  
  if (!prompt) {
    console.error('❌ Prompt not found');
    return;
  }

  console.log('🎨 Generating image:', prompt.id);
  console.log('📝 Description:', prompt.description);
  console.log('');

  try {
    console.log('📡 Sending request to Gemini API...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Delivery Image Generation'
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
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Response received');

    // Extract image data
    const message = data.choices[0]?.message;
    let imageData: string | null = null;

    if (message?.images && message.images[0]) {
      const imageUrl = message.images[0].image_url?.url || message.images[0].url;
      if (imageUrl) {
        imageData = imageUrl;
      }
    }

    if (!imageData) {
      console.error('❌ No image data in response');
      console.log('Response:', JSON.stringify(data, null, 2));
      return;
    }

    // Create output directory
    const outputDir = 'public/images/generated';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the image
    const outputPath = path.join(outputDir, 'austin-skyline-hero.png');
    
    if (imageData.startsWith('data:image')) {
      console.log('💾 Saving base64 image...');
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outputPath, buffer);
    } else {
      console.error('❌ Unexpected image format');
      return;
    }

    console.log('✅ Image saved to:', outputPath);

    // Get image info
    const metadata = await sharp(outputPath).metadata();
    console.log(`📐 Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`📦 Format: ${metadata.format}`);
    console.log(`📊 Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    // Create optimized WebP version
    console.log('');
    console.log('🔧 Creating optimized WebP version...');
    
    const webpPath = outputPath.replace('.png', '-optimized.webp');
    await sharp(outputPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(2);
    console.log(`✅ WebP created: ${webpPath} (${webpSize} KB)`);

    // Create mobile version
    const mobilePath = outputPath.replace('.png', '-mobile.webp');
    await sharp(outputPath)
      .resize(800, 450, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(mobilePath);
    
    console.log(`✅ Mobile version created: ${mobilePath}`);

    console.log('');
    console.log('🎉 Image generation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the generated image in public/images/generated/');
    console.log('2. If satisfied, copy to public/images/hero/austin-skyline-hero.webp');
    console.log('3. Test locally with npm run dev');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateSingleImage();