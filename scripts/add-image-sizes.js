#!/usr/bin/env node

/**
 * Add sizes attribute to Next.js Image components with fill
 *
 * This prevents layout shift and optimizes responsive image loading
 * by telling the browser which image size to load based on viewport.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Pattern to find Next.js Image with fill but no sizes
const imageWithFillPattern = /<Image\s+([^>]*)\bfill\b([^>]*)>/g;

async function addImageSizes() {
  console.log('🔍 Finding Next.js Image components with fill but no sizes...\n');

  const files = await glob('src/**/*.{tsx,jsx}', { ignore: 'node_modules/**' });

  let filesModified = 0;
  let imagesFixed = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let modified = content;
    let fileChanged = false;

    // Find all Image components with fill
    const matches = [...content.matchAll(imageWithFillPattern)];

    for (const match of matches) {
      const fullMatch = match[0];
      const beforeFill = match[1];
      const afterFill = match[2];

      // Check if sizes attribute already exists
      if (/\bsizes\s*=/.test(fullMatch)) {
        continue; // Already has sizes
      }

      // Determine appropriate sizes based on context
      let sizes;

      // Check file path for context
      const filePath = file.toLowerCase();

      if (filePath.includes('hero') || filePath.includes('page.tsx')) {
        // Hero images and page headers typically full width
        sizes = '100vw';
      } else if (filePath.includes('card') || filePath.includes('grid')) {
        // Grid cards - responsive based on viewport
        sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
      } else if (filePath.includes('product')) {
        // Product images - half width on desktop
        sizes = '(max-width: 768px) 100vw, 50vw';
      } else {
        // Default: full width mobile, half width desktop
        sizes = '(max-width: 768px) 100vw, 50vw';
      }

      // Build the new Image tag with sizes attribute
      // Insert sizes after fill attribute
      const newMatch = `<Image ${beforeFill}fill${afterFill.replace('>', ` sizes="${sizes}">`)}>`;

      modified = modified.replace(fullMatch, newMatch);
      fileChanged = true;
      imagesFixed++;
    }

    if (fileChanged) {
      fs.writeFileSync(file, modified, 'utf8');
      filesModified++;
      console.log(`✅ Fixed ${matches.length} images in ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n📊 SUMMARY`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Images fixed: ${imagesFixed}`);
  console.log('✅ Done!\n');
}

addImageSizes().catch(console.error);
