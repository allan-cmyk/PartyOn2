#!/usr/bin/env node

/**
 * Audit Image Dimensions Script
 *
 * Scans all TSX/JSX files to find images missing width/height attributes.
 * This prevents Cumulative Layout Shift (CLS) which hurts Core Web Vitals.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Patterns to detect images without dimensions
const patterns = {
  // Next.js Image component without width/height or fill
  nextImageNoFill: /<Image\s+(?![^>]*\b(?:width|height|fill)\b)[^>]*>/g,

  // Regular img tag without width/height
  regularImgNoDimensions: /<img\s+(?![^>]*\b(?:width|height)\b)[^>]*>/g,

  // Next.js Image with fill but no sizes attribute
  nextImageFillNoSizes: /<Image\s+[^>]*\bfill\b[^>]*(?!\bsizes\b)[^>]*>/g,
};

async function auditImageDimensions() {
  console.log('🔍 Auditing image dimensions across codebase...\n');

  // Find all React files
  const files = await glob('src/**/*.{tsx,jsx}', { ignore: 'node_modules/**' });

  const issues = [];
  let totalImages = 0;
  let imagesWithDimensions = 0;
  let imagesMissingDimensions = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);

    // Find all Image components
    const nextImages = content.match(/<Image\s+[^>]*>/g) || [];
    const regularImages = content.match(/<img\s+[^>]*>/g) || [];

    totalImages += nextImages.length + regularImages.length;

    // Check Next.js Image components
    for (const img of nextImages) {
      const hasWidth = /\bwidth\s*=/.test(img);
      const hasHeight = /\bheight\s*=/.test(img);
      const hasFill = /\bfill\b/.test(img);
      const hasSizes = /\bsizes\s*=/.test(img);

      if (hasFill && !hasSizes) {
        issues.push({
          file: relPath,
          type: 'Next.js Image with fill but no sizes',
          code: img.substring(0, 100) + '...',
          severity: 'warning',
        });
        imagesMissingDimensions++;
      } else if (!hasWidth && !hasHeight && !hasFill) {
        issues.push({
          file: relPath,
          type: 'Next.js Image missing dimensions',
          code: img.substring(0, 100) + '...',
          severity: 'error',
        });
        imagesMissingDimensions++;
      } else {
        imagesWithDimensions++;
      }
    }

    // Check regular img tags
    for (const img of regularImages) {
      const hasWidth = /\bwidth\s*=/.test(img);
      const hasHeight = /\bheight\s*=/.test(img);

      if (!hasWidth || !hasHeight) {
        issues.push({
          file: relPath,
          type: 'Regular <img> missing dimensions',
          code: img.substring(0, 100) + '...',
          severity: 'error',
        });
        imagesMissingDimensions++;
      } else {
        imagesWithDimensions++;
      }
    }
  }

  // Print summary
  console.log('📊 AUDIT SUMMARY\n');
  console.log(`Total images found: ${totalImages}`);
  console.log(`✅ Images with dimensions: ${imagesWithDimensions} (${Math.round(imagesWithDimensions / totalImages * 100)}%)`);
  console.log(`❌ Images missing dimensions: ${imagesMissingDimensions} (${Math.round(imagesMissingDimensions / totalImages * 100)}%)`);
  console.log('');

  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});

  // Print issues by severity
  console.log('🚨 CRITICAL ISSUES (Errors)\n');

  const errors = issues.filter(i => i.severity === 'error');
  const errorsByFile = errors.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});

  Object.entries(errorsByFile).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file} (${fileIssues.length} issues)`);
    fileIssues.forEach(issue => {
      console.log(`   ${issue.type}`);
    });
    console.log('');
  });

  console.log('⚠️  WARNINGS\n');

  const warnings = issues.filter(i => i.severity === 'warning');
  const warningsByFile = warnings.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});

  Object.entries(warningsByFile).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file} (${fileIssues.length} issues)`);
    fileIssues.forEach(issue => {
      console.log(`   ${issue.type}`);
    });
    console.log('');
  });

  // Save detailed report
  const report = {
    summary: {
      totalImages,
      imagesWithDimensions,
      imagesMissingDimensions,
      percentageMissing: Math.round(imagesMissingDimensions / totalImages * 100),
    },
    issues: issuesByFile,
  };

  fs.writeFileSync(
    'image-dimensions-audit.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ Detailed report saved to image-dimensions-audit.json\n');

  return report;
}

auditImageDimensions().catch(console.error);
