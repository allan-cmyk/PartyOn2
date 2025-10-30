#!/usr/bin/env node

/**
 * Automated migration script to replace Framer Motion ScrollReveal
 * with CSS-based ScrollRevealCSS component
 *
 * Usage: node scripts/migrate-scroll-reveal.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all React component files
const files = glob.sync('src/**/*.{tsx,jsx}', {
  ignore: [
    '**/node_modules/**',
    '**/ScrollReveal.tsx',
    '**/ScrollRevealCSS.tsx',
    '**/*.test.*',
    '**/*.spec.*'
  ],
  cwd: path.join(__dirname, '..')
});

let migrationCount = 0;
let errorCount = 0;
const migrationLog = [];

console.log('🔄 Starting ScrollReveal migration...\n');
console.log(`Found ${files.length} files to check\n`);

files.forEach(relativeFilePath => {
  const filePath = path.join(__dirname, '..', relativeFilePath);

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    const changes = [];

    // Check if file uses ScrollReveal
    if (!content.includes('ScrollReveal')) {
      return; // Skip files that don't use ScrollReveal
    }

    // Replace import statement
    if (content.includes('from \'@/components/ui/ScrollReveal\'') ||
        content.includes('from "@/components/ui/ScrollReveal"')) {
      content = content.replace(
        /from ['"]@\/components\/ui\/ScrollReveal['"]/g,
        'from \'@/components/ui/ScrollRevealCSS\''
      );
      modified = true;
      changes.push('Updated import statement');
    }

    // Replace component usage - opening tag
    if (content.includes('<ScrollReveal')) {
      const oldContent = content;
      content = content.replace(
        /<ScrollReveal(\s|>)/g,
        '<ScrollRevealCSS$1'
      );
      if (content !== oldContent) {
        modified = true;
        changes.push('Updated opening tags');
      }
    }

    // Replace component usage - closing tag
    if (content.includes('</ScrollReveal>')) {
      content = content.replace(
        /<\/ScrollReveal>/g,
        '</ScrollRevealCSS>'
      );
      modified = true;
      changes.push('Updated closing tags');
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      migrationCount++;

      const logEntry = {
        file: relativeFilePath,
        changes: changes
      };
      migrationLog.push(logEntry);

      console.log(`✅ Migrated: ${relativeFilePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
      console.log('');
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ Error processing ${relativeFilePath}:`, error.message);
    console.log('');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Migration Summary');
console.log('='.repeat(60));
console.log(`✅ Successfully migrated: ${migrationCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`⏭️  Skipped (no ScrollReveal): ${files.length - migrationCount - errorCount} files`);
console.log('='.repeat(60));

// Save migration log
if (migrationLog.length > 0) {
  const logPath = path.join(__dirname, '..', 'migration-log.json');
  fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));
  console.log(`\n📝 Detailed log saved to: migration-log.json`);
}

// Exit with appropriate code
process.exit(errorCount > 0 ? 1 : 0);
