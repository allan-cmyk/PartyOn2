import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Optimizes the mobile bartender hero image for web use
 * Creates multiple sizes: desktop (1920px), mobile (768px), thumbnail (400px)
 */

const INPUT_IMAGE = process.argv[2] || './bartender-hero-source.jpg';
const OUTPUT_DIR = './public/images/hero';
const BASE_NAME = 'mobile-bartender-outdoor-event';

async function optimizeImage() {
  console.log(`Processing: ${INPUT_IMAGE}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Desktop version (1920px wide)
  await sharp(INPUT_IMAGE)
    .resize(1920, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(path.join(OUTPUT_DIR, `${BASE_NAME}.webp`));

  console.log(`✓ Created: ${BASE_NAME}.webp (1920px)`);

  // Mobile version (768px wide)
  await sharp(INPUT_IMAGE)
    .resize(768, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toFile(path.join(OUTPUT_DIR, `${BASE_NAME}-mobile.webp`));

  console.log(`✓ Created: ${BASE_NAME}-mobile.webp (768px)`);

  // Thumbnail version (400px wide)
  await sharp(INPUT_IMAGE)
    .resize(400, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 75 })
    .toFile(path.join(OUTPUT_DIR, `${BASE_NAME}-thumbnail.webp`));

  console.log(`✓ Created: ${BASE_NAME}-thumbnail.webp (400px)`);

  console.log('\n✅ All images optimized successfully!');
  console.log(`📁 Output location: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Update page to use new image path');
  console.log('2. Test responsive behavior on mobile devices');
  console.log('3. Commit and deploy changes');
}

optimizeImage().catch((error) => {
  console.error('❌ Error optimizing image:', error);
  process.exit(1);
});
