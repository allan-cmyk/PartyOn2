/**
 * Image Audit Script
 *
 * Scans all source files for image references and checks if they exist.
 * Outputs a report of broken image paths with their source file locations.
 *
 * Usage: npx ts-node scripts/audit-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface BrokenImage {
  imagePath: string;
  sourceFile: string;
  lineNumber: number;
  context: string;
}

interface AuditResult {
  totalImagesChecked: number;
  brokenImages: BrokenImage[];
  validImages: number;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DIR = path.join(process.cwd(), 'src');

// Patterns to find image references
const IMAGE_PATTERNS = [
  /src=["']([^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/gi,
  /["']\/images\/[^"']+\.(png|jpg|jpeg|gif|svg|webp)["']/gi,
  /url\(["']?([^"')]+\.(png|jpg|jpeg|gif|svg|webp))["']?\)/gi,
  /backgroundImage:\s*["']url\(([^)]+)\)["']/gi,
];

// File extensions to scan
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          walkDir(fullPath);
        }
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

function extractImagePaths(content: string, filePath: string): Array<{path: string, line: number, context: string}> {
  const images: Array<{path: string, line: number, context: string}> = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for image paths in this line
    const patterns = [
      /["'](\/?images\/[^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/gi,
      /["'](\/[^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/gi,
      /src=["']([^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const imagePath = match[1];

        // Skip external URLs and data URLs
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
          continue;
        }

        // Skip Shopify CDN URLs
        if (imagePath.includes('cdn.shopify.com')) {
          continue;
        }

        images.push({
          path: imagePath,
          line: index + 1,
          context: line.trim().substring(0, 100)
        });
      }
    }
  });

  return images;
}

function imageExists(imagePath: string): boolean {
  // Normalize the path
  let normalizedPath = imagePath;

  // Remove leading slash if present
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }

  // Check in public directory
  const fullPath = path.join(PUBLIC_DIR, normalizedPath);

  return fs.existsSync(fullPath);
}

function auditImages(): AuditResult {
  console.log('🔍 Starting image audit...\n');

  const brokenImages: BrokenImage[] = [];
  const checkedPaths = new Set<string>();
  let totalChecked = 0;

  // Get all source files
  const files = getAllFiles(SRC_DIR, FILE_EXTENSIONS);
  console.log(`📁 Found ${files.length} source files to scan\n`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const images = extractImagePaths(content, file);

    for (const img of images) {
      // Create unique key for this image path
      const key = `${img.path}`;

      if (!checkedPaths.has(key)) {
        checkedPaths.add(key);
        totalChecked++;

        if (!imageExists(img.path)) {
          brokenImages.push({
            imagePath: img.path,
            sourceFile: path.relative(process.cwd(), file),
            lineNumber: img.line,
            context: img.context
          });
        }
      }
    }
  }

  return {
    totalImagesChecked: totalChecked,
    brokenImages,
    validImages: totalChecked - brokenImages.length
  };
}

function printReport(result: AuditResult): void {
  console.log('=' .repeat(80));
  console.log('📊 IMAGE AUDIT REPORT');
  console.log('=' .repeat(80));
  console.log(`\n📈 Summary:`);
  console.log(`   Total unique image paths checked: ${result.totalImagesChecked}`);
  console.log(`   ✅ Valid images: ${result.validImages}`);
  console.log(`   ❌ Broken images: ${result.brokenImages.length}`);

  if (result.brokenImages.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('❌ BROKEN IMAGES:');
    console.log('-'.repeat(80));

    // Group by source file
    const byFile = new Map<string, BrokenImage[]>();
    for (const img of result.brokenImages) {
      const existing = byFile.get(img.sourceFile) || [];
      existing.push(img);
      byFile.set(img.sourceFile, existing);
    }

    for (const [file, images] of byFile) {
      console.log(`\n📄 ${file}:`);
      for (const img of images) {
        console.log(`   Line ${img.lineNumber}: ${img.imagePath}`);
      }
    }

    // Output as JSON for easy processing
    console.log('\n' + '-'.repeat(80));
    console.log('📋 JSON OUTPUT (for processing):');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.brokenImages, null, 2));
  } else {
    console.log('\n✅ All images are valid!');
  }
}

// Run the audit
const result = auditImages();
printReport(result);

// Write report to file
const reportPath = path.join(process.cwd(), 'scripts', 'image-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
console.log(`\n📝 Report saved to: ${reportPath}`);
