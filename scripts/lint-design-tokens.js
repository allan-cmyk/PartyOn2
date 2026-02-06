#!/usr/bin/env node

/**
 * Design System Token Linter
 *
 * This script checks for forbidden patterns that violate the PartyOn2 design system.
 * Run with: npm run lint:tokens
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Forbidden patterns that MUST NOT appear in the codebase
const FORBIDDEN_PATTERNS = [
  // Legacy colors
  {
    pattern: 'royal-',
    description: 'Legacy royal color token',
    replacement: 'Use brand-blue or gray-*',
  },
  {
    pattern: 'primary-[0-9]',
    description: 'Legacy primary color with number',
    replacement: 'Use brand-blue',
  },
  {
    pattern: 'secondary-[0-9]',
    description: 'Legacy secondary color with number',
    replacement: 'Use brand-blue',
  },
  {
    pattern: '(bg|text|border|from|to|via)-accent-',
    description: 'Legacy accent color token',
    replacement: 'Use brand-yellow',
  },
  {
    pattern: 'gold-[0-9]',
    description: 'Legacy gold color with number',
    replacement: 'Use gold (dark bg) or brand-yellow (light bg)',
  },
  {
    pattern: 'navy-',
    description: 'Legacy navy color token',
    replacement: 'Use gray-900',
  },
  {
    pattern: 'neutral-',
    description: 'Legacy neutral color token',
    replacement: 'Use gray-*',
  },
  {
    pattern: '(bg|text|border|from|to|via)-v2-',
    description: 'Legacy v2 color token',
    replacement: 'Use design system tokens',
  },
  {
    pattern: 'ivory-',
    description: 'Legacy ivory color token',
    replacement: 'Use gray-50 or white',
  },
  {
    pattern: 'emerald-',
    description: 'Legacy emerald color token',
    replacement: 'Use success',
  },
  {
    pattern: '(bg|text|border|from|to|via)-austin',
    description: 'Legacy austin color token',
    replacement: 'Use brand-* colors',
  },

  // Legacy fonts
  {
    pattern: 'font-serif',
    description: 'Legacy serif font class',
    replacement: 'Use font-heading',
  },
  {
    pattern: 'font-display',
    description: 'Legacy display font class',
    replacement: 'Use font-heading',
  },
  {
    pattern: 'font-playfair',
    description: 'Legacy Playfair font class',
    replacement: 'Use font-heading',
  },
  {
    pattern: 'font-abril',
    description: 'Legacy Abril font class',
    replacement: 'Use font-heading',
  },
  {
    pattern: 'font-candal',
    description: 'Legacy Candal font class',
    replacement: 'Use font-heading',
  },
  {
    pattern: 'font-caveat',
    description: 'Legacy Caveat font class',
    replacement: 'Remove (handwriting font not in design system)',
  },

  // Gradient buttons (not allowed on buttons)
  {
    pattern: 'bg-gradient-gold',
    description: 'Gradient on button',
    replacement: 'Use bg-brand-yellow',
  },
  {
    pattern: 'bg-gradient-navy',
    description: 'Gradient on button',
    replacement: 'Use bg-gray-900',
  },
  {
    pattern: 'text-gradient-primary',
    description: 'Gradient text (only for logos)',
    replacement: 'Use text-brand-blue',
  },

  // Non-standard buttons
  {
    pattern: 'rounded-full.*btn|btn.*rounded-full',
    description: 'Pill-shaped button (not in design system)',
    replacement: 'Use rounded-lg for all buttons',
  },
];

// Files and directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.vercel',
  'scripts/lint-design-tokens.js', // Skip self
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function lintFile(filePath) {
  if (shouldSkip(filePath)) return [];

  const ext = path.extname(filePath);
  if (!['.tsx', '.ts', '.jsx', '.js', '.css'].includes(ext)) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  FORBIDDEN_PATTERNS.forEach(({ pattern, description, replacement }) => {
    const regex = new RegExp(pattern, 'gi');
    let match;
    let lineNumber = 1;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (regex.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          pattern,
          description,
          replacement,
          snippet: line.trim().substring(0, 100),
        });
      }
      regex.lastIndex = 0; // Reset regex state
    });
  });

  return violations;
}

function walkDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(fullPath)) continue;

    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Error: src/ directory not found');
    process.exit(1);
  }

  console.log('🔍 Scanning for design system violations...\n');

  const files = walkDir(srcDir);
  let allViolations = [];

  files.forEach(file => {
    const violations = lintFile(file);
    allViolations = allViolations.concat(violations);
  });

  if (allViolations.length === 0) {
    console.log('✅ No design system violations found!\n');
    console.log('All files comply with the PartyOn2 design system:');
    console.log('  - 12 approved colors only');
    console.log('  - font-heading (Barlow Condensed) + font-sans (Inter) only');
    console.log('  - 4 button variants (primary, cart, secondary, ghost)');
    console.log('  - No gradient buttons');
    process.exit(0);
  }

  console.log(`❌ Found ${allViolations.length} design system violations:\n`);

  // Group by file
  const byFile = {};
  allViolations.forEach(v => {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  });

  Object.entries(byFile).forEach(([file, violations]) => {
    console.log(`\n📄 ${file}`);
    violations.forEach(v => {
      console.log(`   Line ${v.line}: ${v.description}`);
      console.log(`   Pattern: ${v.pattern}`);
      console.log(`   Fix: ${v.replacement}`);
      console.log(`   Snippet: ${v.snippet}`);
      console.log('');
    });
  });

  console.log('\n💡 Fix these violations before committing.');
  console.log('   Run `npm run lint:tokens` to check again.\n');

  process.exit(1);
}

main();
