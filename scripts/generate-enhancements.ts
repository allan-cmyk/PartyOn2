#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getEnhancementsByPriority, enhancementPrompts } from '../lib/image-generation/enhancement-prompts';

const apiKey = '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';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt: any) {
  console.log(`\n📸 Processing: ${prompt.id}`);
  console.log(`   Description: ${prompt.description}`);
  console.log(`   Location: ${prompt.location}`);

  try {
    console.log('   📡 Sending request to Gemini API...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Enhancement Images'
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
      console.error('   ❌ API Error:', errorText);
      return false;
    }

    const data = await response.json();
    
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
      console.error('   ❌ No image data in response');
      return false;
    }

    // Determine output directory based on category
    let outputDir = 'public/images/enhancements';
    switch (prompt.category) {
      case 'homepage':
        outputDir = 'public/images/homepage';
        break;
      case 'about':
        outputDir = 'public/images/about';
        break;
      case 'products':
        outputDir = 'public/images/products';
        break;
      case 'process':
        outputDir = 'public/images/process';
        break;
      case 'trust':
        outputDir = 'public/images/trust';
        break;
      case 'gallery':
        outputDir = 'public/images/gallery';
        break;
    }

    // Create directory if needed
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the original PNG
    const pngPath = path.join(outputDir, prompt.filename.replace('.webp', '.png'));
    
    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(pngPath, buffer);
    } else {
      console.error('   ❌ Unexpected image format');
      return false;
    }

    console.log(`   ✅ PNG saved: ${pngPath}`);

    // Get image info
    const metadata = await sharp(pngPath).metadata();
    console.log(`   📐 Dimensions: ${metadata.width}x${metadata.height}`);

    // Create optimized WebP version
    const webpPath = path.join(outputDir, prompt.filename);
    
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log(`   ✅ WebP created: ${webpPath}`);

    // Create mobile version
    const mobilePath = webpPath.replace('.webp', '-mobile.webp');
    await sharp(pngPath)
      .resize(800, 450, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(mobilePath);
    
    console.log(`   ✅ Mobile version: ${mobilePath}`);

    // Clean up PNG
    fs.unlinkSync(pngPath);
    console.log(`   🧹 Cleaned up PNG file`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generateEnhancements() {
  console.log('🎨 PartyOn Delivery - Visual Enhancement Generation');
  console.log('==================================================');
  console.log('');

  // Get priority from command line argument
  const priority = process.argv[2] ? parseInt(process.argv[2]) : 1;
  
  const prompts = getEnhancementsByPriority(priority as 1 | 2 | 3);
  console.log(`📋 Generating Priority ${priority} enhancements`);
  console.log(`   Found ${prompts.length} images to generate`);
  console.log('');

  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  for (const prompt of prompts) {
    const success = await generateImage(prompt);
    
    if (success) {
      results.success.push(prompt.id);
    } else {
      results.failed.push(prompt.id);
    }

    // Wait between requests
    if (prompts.indexOf(prompt) < prompts.length - 1) {
      console.log('   ⏳ Waiting 2 seconds...');
      await sleep(2000);
    }
  }

  console.log('\n');
  console.log('📊 Generation Summary');
  console.log('====================');
  console.log(`✅ Successful: ${results.success.length}`);
  if (results.success.length > 0) {
    results.success.forEach(id => console.log(`   - ${id}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length}`);
    results.failed.forEach(id => console.log(`   - ${id}`));
  }

  console.log('\n');
  console.log('🎉 Enhancement generation complete!');
  console.log('');
  console.log('📋 Images need to be integrated into:');
  console.log('   - Homepage sections (backgrounds)');
  console.log('   - About page (team, operations)');
  console.log('   - Products page (category images)');
  console.log('   - Process visualization sections');
  console.log('');
  console.log('Run: npm run dev to test locally');
}

generateEnhancements();