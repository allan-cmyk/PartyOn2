import { readFileSync } from 'fs';
import https from 'https';
import http from 'http';

const data = JSON.parse(readFileSync('./src/data/byob-venues.json', 'utf8'));
const venues = data.venues;

console.log('Testing', venues.length, 'venue images...\n');

const results = [];

async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode === 200 });
    });
    req.on('error', (e) => {
      resolve({ status: 'ERROR', error: e.message, ok: false });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', ok: false });
    });
  });
}

async function main() {
  const failed = [];

  for (const v of venues) {
    if (!v.image) {
      failed.push({ id: v.id, name: v.name, issue: 'NO IMAGE FIELD' });
      continue;
    }

    const result = await testUrl(v.image);
    if (!result.ok) {
      failed.push({
        id: v.id,
        name: v.name,
        status: result.status,
        error: result.error || '',
        url: v.image
      });
    }
    process.stdout.write('.');
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS: ' + failed.length + ' failed out of ' + venues.length);
  console.log('='.repeat(60));

  if (failed.length > 0) {
    console.log('\nFailed images:');
    failed.forEach(f => {
      console.log(`\nID ${f.id}: ${f.name}`);
      console.log(`  Status: ${f.status} ${f.error || ''}`);
      if (f.url) console.log(`  URL: ${f.url}`);
    });
  } else {
    console.log('\nAll images are accessible!');
  }
}

main();
