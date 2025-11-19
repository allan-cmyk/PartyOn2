#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateWithRetry } from '../image-generator-tool/lib/api';
import { saveImageFromBase64 } from '../image-generator-tool/lib/image';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const CONFIG = {
  imagesDir: path.join(process.cwd(), 'public', 'images', 'blog'),
  contentDir: path.join(process.cwd(), 'content', 'blog', 'posts'),
  imagesPerPost: 4,
};

const blogSlugs = [
  'corporate-event-bar-service-tips-for-austin-businesses',
  'how-to-plan-a-successful-corporate-networking-event-in-austin',
  'essential-bar-setup-checklist-for-austin-office-parties',
  'corporate-client-appreciation-event-ideas-in-austin',
  'how-to-host-a-professional-happy-hour-for-your-austin-team'
];

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateBlogImages(slug: string, index: number): Promise<string[]> {
  console.log(`\n📸 [${index + 1}/5] Generating images for: ${slug}`);
  console.log('='.repeat(60));

  const imageDir = path.join(CONFIG.imagesDir, slug);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const imagePaths: string[] = [];
  const baseStyle = "professional photography, high quality, ultra high resolution, Austin Texas aesthetic";

  const imagePrompts = [
    `${slug.replace(/-/g, ' ')} hero image, ${baseStyle}`,
    `Austin corporate events scene, people celebrating, ${baseStyle}`,
    `Elegant alcohol service setup, premium spirits, ${baseStyle}`,
    `Austin skyline background, professional atmosphere, ${baseStyle}`,
  ];

  for (let i = 0; i < CONFIG.imagesPerPost; i++) {
    try {
      console.log(`   Generating image ${i + 1}/${CONFIG.imagesPerPost}...`);

      const imageData = await generateWithRetry(imagePrompts[i]);

      if (!imageData) {
        throw new Error('No image data received');
      }

      const filename = `${slug}-${i}.webp`;
      const outputPath = path.join(imageDir, filename);

      await saveImageFromBase64(imageData, outputPath);

      const publicPath = `/images/blog/${slug}/${filename}`;
      imagePaths.push(publicPath);

      console.log(`   ✅ Generated: ${filename}`);

      if (i < CONFIG.imagesPerPost - 1) {
        await sleep(3000);
      }
    } catch (error) {
      console.error(`   ❌ Failed to generate image ${i + 1}:`, error);
    }
  }

  console.log(`\n✅ Generated ${imagePaths.length}/${CONFIG.imagesPerPost} images for ${slug}\n`);
  return imagePaths;
}

async function updateBlogWithImages(slug: string, imagePaths: string[]): Promise<void> {
  if (imagePaths.length === 0) {
    console.log(`⚠️  No images to add to ${slug}`);
    return;
  }

  const mdxPath = path.join(CONFIG.contentDir, `${slug}.mdx`);

  if (!fs.existsSync(mdxPath)) {
    console.error(`❌ Blog file not found: ${mdxPath}`);
    return;
  }

  let content = fs.readFileSync(mdxPath, 'utf-8');

  // Update frontmatter image
  content = content.replace(
    /image: ".*"/,
    `image: "${imagePaths[0]}"`
  );

  // Insert images after every 2nd H2 heading
  const lines = content.split('\n');
  const newLines: string[] = [];
  let headerCount = 0;
  let imageIndex = 1; // Start from 1 since first image is in frontmatter

  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);

    if (lines[i].startsWith('## ') && !lines[i].startsWith('### ')) {
      headerCount++;

      if (headerCount % 2 === 0 && imageIndex < imagePaths.length) {
        newLines.push('');
        newLines.push(`![Content Image](${imagePaths[imageIndex]})`);
        newLines.push('');
        imageIndex++;
      }
    }
  }

  fs.writeFileSync(mdxPath, newLines.join('\n'));
  console.log(`✅ Updated blog with ${imagePaths.length} images\n`);
}

async function main() {
  console.log('\n🎨 GENERATING IMAGES FOR 5 CORPORATE BLOGS\n');
  console.log('='.repeat(60));

  for (let i = 0; i < blogSlugs.length; i++) {
    const slug = blogSlugs[i];
    try {
      const imagePaths = await generateBlogImages(slug, i);
      await updateBlogWithImages(slug, imagePaths);

      if (i < blogSlugs.length - 1) {
        console.log('⏳ Waiting 5 seconds before next blog...\n');
        await sleep(5000);
      }
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMAGE GENERATION COMPLETE FOR ALL 5 BLOGS!');
  console.log('='.repeat(60) + '\n');
}

main();
