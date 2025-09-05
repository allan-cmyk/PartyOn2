#!/usr/bin/env node
import 'dotenv/config';
import { GeminiImageGenerator } from '../lib/image-generation/gemini';
import { imagePrompts, getPromptsByPriority, ImagePrompt } from '../lib/image-generation/prompts';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Command line arguments
const args = process.argv.slice(2);
const priority = args[0] ? parseInt(args[0]) : 1;
const dryRun = args.includes('--dry-run');
const skipOptimization = args.includes('--skip-optimization');

async function generateImages() {
  console.log('🚀 PartyOn Delivery Image Generation Pipeline');
  console.log('=============================================');
  console.log(`Priority Level: ${priority}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Skip Optimization: ${skipOptimization}`);
  console.log('');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No images will be generated');
    console.log('');
  }

  const generator = new GeminiImageGenerator();
  const prompts = getPromptsByPriority(priority as 1 | 2 | 3);

  console.log(`📝 Found ${prompts.length} prompts for priority ${priority}`);
  console.log('');

  for (const promptConfig of prompts) {
    console.log(`\n📸 Processing: ${promptConfig.id}`);
    console.log(`   Category: ${promptConfig.category}`);
    console.log(`   Description: ${promptConfig.description}`);
    console.log(`   Target: ${promptConfig.filename}`);
    
    if (dryRun) {
      console.log('   ✅ Would generate this image');
      continue;
    }

    try {
      // Determine output directory based on category
      let outputDir = 'public/images/generated';
      if (promptConfig.currentPath) {
        // Use the same directory as the current file
        outputDir = path.dirname(path.join('public', promptConfig.currentPath));
      } else {
        // Create appropriate directory for new images
        switch (promptConfig.category) {
          case 'hero':
            outputDir = 'public/images/hero';
            break;
          case 'boat-party':
            outputDir = 'public/images/services/boat-parties';
            break;
          case 'wedding':
            outputDir = 'public/images/services/weddings';
            break;
          case 'corporate':
            outputDir = 'public/images/services/corporate';
            break;
          case 'rooftop':
            outputDir = 'public/images/services/rooftop';
            break;
          case 'nightlife':
            outputDir = 'public/images/services/nightlife';
            break;
        }
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`   📁 Created directory: ${outputDir}`);
      }

      // Back up existing image if it exists
      const existingPath = path.join(outputDir, promptConfig.filename);
      if (fs.existsSync(existingPath)) {
        const backupPath = existingPath.replace('.webp', '-backup.webp');
        fs.copyFileSync(existingPath, backupPath);
        console.log(`   💾 Backed up existing image to: ${backupPath}`);
      }

      // Generate the image
      console.log(`   🎨 Generating image...`);
      const generatedImage = await generator.generateImage({
        prompt: promptConfig.prompt,
        filename: promptConfig.filename.replace('.webp', '.png'), // Generate as PNG first
        outputDir
      });

      console.log(`   ✅ Generated: ${generatedImage.path}`);
      console.log(`   📐 Dimensions: ${generatedImage.width}x${generatedImage.height}`);

      if (!skipOptimization) {
        // Create optimized WebP version
        console.log(`   🔧 Creating optimized WebP...`);
        const optimizedPath = await generator.optimizeImage(generatedImage.path, {
          width: 1456,
          height: 816,
          format: 'webp',
          quality: 85
        });

        // Create responsive variants
        console.log(`   📱 Creating responsive variants...`);
        const variants = await generator.createResponsiveVariants(generatedImage.path);
        
        console.log(`   ✅ Created variants:`);
        console.log(`      - Desktop: ${variants.desktop}`);
        console.log(`      - Mobile: ${variants.mobile}`);
        console.log(`      - Thumbnail: ${variants.thumbnail}`);

        // Clean up original PNG
        fs.unlinkSync(generatedImage.path);
        console.log(`   🧹 Cleaned up original PNG`);
      }

      console.log(`   ✅ Successfully processed: ${promptConfig.id}`);

    } catch (error) {
      console.error(`   ❌ Error processing ${promptConfig.id}:`, error);
      continue;
    }
  }

  console.log('\n');
  console.log('🎉 Image generation complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review generated images in the public/images directories');
  console.log('2. Test the site locally with npm run dev');
  console.log('3. Deploy to production when satisfied');
}

// Run the script
generateImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});