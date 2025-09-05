#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getPromptsByPriority } from '../lib/image-generation/prompts';

const apiKey = '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';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt: any) {
  console.log(`\n📸 Processing: ${prompt.id}`);
  console.log(`   Description: ${prompt.description}`);

  try {
    console.log('   📡 Sending request to Gemini API...');
    
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

    // Determine output directory
    let outputDir = 'public/images/generated';
    if (prompt.currentPath) {
      outputDir = path.dirname('public' + prompt.currentPath);
    } else {
      // Create appropriate directory for new images
      switch (prompt.category) {
        case 'hero':
          outputDir = 'public/images/hero';
          break;
        case 'boat-party':
          outputDir = 'public/images/services/boat-parties';
          break;
        case 'rooftop':
          outputDir = 'public/images/services/rooftop';
          break;
      }
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

    // Create optimized WebP version (main file)
    const webpPath = path.join(outputDir, prompt.filename);
    
    // Backup existing file if it exists
    if (fs.existsSync(webpPath)) {
      const backupPath = webpPath.replace('.webp', '-backup.webp');
      fs.copyFileSync(webpPath, backupPath);
      console.log(`   💾 Backed up existing to: ${backupPath}`);
    }

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

    // Create thumbnail
    const thumbPath = webpPath.replace('.webp', '-thumbnail.webp');
    await sharp(pngPath)
      .resize(400, 225, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(thumbPath);
    
    console.log(`   ✅ Thumbnail: ${thumbPath}`);

    // Clean up PNG if in production directories
    if (outputDir.includes('/hero') || outputDir.includes('/services')) {
      fs.unlinkSync(pngPath);
      console.log(`   🧹 Cleaned up PNG file`);
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generatePriorityImages() {
  console.log('🚀 PartyOn Delivery - Priority Image Generation');
  console.log('==============================================');
  console.log('');

  const priority1Prompts = getPromptsByPriority(1);
  console.log(`📋 Found ${priority1Prompts.length} priority 1 images to generate`);
  console.log('');

  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  for (const prompt of priority1Prompts) {
    const success = await generateImage(prompt);
    
    if (success) {
      results.success.push(prompt.id);
    } else {
      results.failed.push(prompt.id);
    }

    // Wait 2 seconds between requests to avoid rate limiting
    if (priority1Prompts.indexOf(prompt) < priority1Prompts.length - 1) {
      console.log('   ⏳ Waiting 2 seconds before next request...');
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
  console.log('🎉 Priority image generation complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review generated images in their respective directories');
  console.log('2. Test locally with: npm run dev');
  console.log('3. Check the following pages:');
  console.log('   - Homepage (austin-skyline-hero.webp)');
  console.log('   - Service pages (austin-skyline-golden-hour.webp)');
  console.log('   - Boat parties page (/services/boat-parties/)');
  console.log('4. If satisfied, commit and deploy');
}

generatePriorityImages();