/**
 * Add Partner Script
 *
 * Automates the process of adding a new partner to the Austin Partners directory.
 * Uses Firecrawl to scrape the partner's website for logo, hero image, and description.
 *
 * Usage:
 *   npx tsx scripts/add-partner.ts "Partner Name" "https://partner-website.com" "category"
 *
 * Categories: event-planning, mobile-bartending, venues, catering, boats, transportation
 *
 * Example:
 *   npx tsx scripts/add-partner.ts "Awesome Bartending" "https://awesomebartending.com" "mobile-bartending"
 *
 * What this script does:
 * 1. Scrapes the partner website using Firecrawl API
 * 2. Extracts the logo image URL
 * 3. Finds a suitable hero/brand image
 * 4. Downloads both images to /public/images/partners/
 * 5. Generates a description from the website content
 * 6. Adds the partner to austin-partners.json
 *
 * Requirements:
 * - FIRECRAWL_API_KEY environment variable must be set
 * - Node.js with tsx installed
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const PARTNERS_JSON_PATH = path.join(__dirname, '../src/data/austin-partners.json');
const IMAGES_DIR = path.join(__dirname, '../public/images/partners');

type PartnerCategory = 'event-planning' | 'mobile-bartending' | 'venues' | 'catering' | 'boats' | 'transportation';

interface Partner {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo: string;
  heroImage?: string;
  category: PartnerCategory;
  featured: boolean;
  order: number;
}

interface PartnersData {
  partners: Partner[];
}

interface FirecrawlResponse {
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    ogImage?: string;
    [key: string]: unknown;
  };
}

/**
 * Scrape a website using Firecrawl API
 */
async function scrapeWebsite(url: string): Promise<FirecrawlResponse> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as FirecrawlResponse;
}

/**
 * Download an image from URL to local file
 */
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      rejectUnauthorized: false // Handle SSL issues
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${response.statusCode}`);
        resolve(false);
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete failed file
        console.error(`Error writing file: ${err.message}`);
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.error(`Error downloading ${url}: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Extract image URLs from markdown content
 */
function extractImageUrls(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

/**
 * Find the best logo image from extracted URLs
 */
function findLogoUrl(urls: string[], metadata: FirecrawlResponse['metadata']): string | null {
  // First check if there's a logo in the URLs
  const logoUrl = urls.find(url =>
    url.toLowerCase().includes('logo') ||
    url.toLowerCase().includes('brand')
  );

  if (logoUrl) return logoUrl;

  // Check for favicon or og:image as fallback
  if (metadata.ogImage) return metadata.ogImage;

  // Return first small image as potential logo
  return urls[0] || null;
}

/**
 * Find the best hero image from extracted URLs
 */
function findHeroUrl(urls: string[], metadata: FirecrawlResponse['metadata']): string | null {
  // Skip logo images
  const nonLogoUrls = urls.filter(url =>
    !url.toLowerCase().includes('logo') &&
    !url.toLowerCase().includes('favicon') &&
    !url.toLowerCase().includes('icon')
  );

  // Look for hero, banner, or background images first
  const heroUrl = nonLogoUrls.find(url =>
    url.toLowerCase().includes('hero') ||
    url.toLowerCase().includes('banner') ||
    url.toLowerCase().includes('background') ||
    url.toLowerCase().includes('carousel')
  );

  if (heroUrl) return heroUrl;

  // Use og:image if available and different from logo
  if (metadata.ogImage && !metadata.ogImage.toLowerCase().includes('logo')) {
    return metadata.ogImage;
  }

  // Return first large image
  return nonLogoUrls[0] || null;
}

/**
 * Generate slug from partner name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract a clean description from website content
 */
function extractDescription(markdown: string, metadata: FirecrawlResponse['metadata']): string {
  // Use meta description if available
  if (metadata.description && metadata.description.length > 50) {
    return metadata.description.slice(0, 300);
  }

  // Try to extract from markdown - find first substantial paragraph
  const lines = markdown.split('\n').filter(line =>
    line.trim().length > 50 &&
    !line.startsWith('#') &&
    !line.startsWith('!') &&
    !line.includes('[') &&
    !line.toLowerCase().includes('cookie') &&
    !line.toLowerCase().includes('privacy')
  );

  if (lines.length > 0) {
    return lines[0].slice(0, 300).trim();
  }

  return 'Professional event services in the Austin area.';
}

/**
 * Main function to add a new partner
 */
async function addPartner(name: string, website: string, category: PartnerCategory, featured: boolean = false): Promise<void> {
  console.log(`\n=== Adding Partner: ${name} ===\n`);

  // Step 1: Scrape the website
  console.log(`Scraping ${website}...`);
  const scraped = await scrapeWebsite(website);
  console.log('Website scraped successfully!');

  // Step 2: Extract image URLs
  const imageUrls = extractImageUrls(scraped.markdown);
  console.log(`Found ${imageUrls.length} images`);

  // Step 3: Find logo and hero images
  const logoUrl = findLogoUrl(imageUrls, scraped.metadata);
  const heroUrl = findHeroUrl(imageUrls, scraped.metadata);

  const slug = generateSlug(name);

  // Step 4: Download images
  let logoPath = '/images/partners/placeholder.svg';
  let heroPath: string | undefined;

  if (logoUrl) {
    const logoExt = logoUrl.includes('.png') ? 'png' : 'jpg';
    const logoFilename = `${slug}-logo.${logoExt}`;
    const logoFilepath = path.join(IMAGES_DIR, logoFilename);

    console.log(`Downloading logo from ${logoUrl}...`);
    const logoSuccess = await downloadImage(logoUrl, logoFilepath);
    if (logoSuccess) {
      logoPath = `/images/partners/${logoFilename}`;
      console.log(`Logo saved to ${logoPath}`);
    } else {
      console.log('Failed to download logo, using placeholder');
    }
  }

  if (heroUrl) {
    const heroFilename = `${slug}-hero.jpg`;
    const heroFilepath = path.join(IMAGES_DIR, heroFilename);

    console.log(`Downloading hero image from ${heroUrl}...`);
    const heroSuccess = await downloadImage(heroUrl, heroFilepath);
    if (heroSuccess) {
      heroPath = `/images/partners/${heroFilename}`;
      console.log(`Hero image saved to ${heroPath}`);
    } else {
      console.log('Failed to download hero image');
    }
  }

  // Step 5: Extract description
  const description = extractDescription(scraped.markdown, scraped.metadata);
  console.log(`Description: ${description.slice(0, 100)}...`);

  // Step 6: Load existing partners
  const partnersJson = fs.readFileSync(PARTNERS_JSON_PATH, 'utf-8');
  const partnersData: PartnersData = JSON.parse(partnersJson);

  // Check if partner already exists
  const existingIndex = partnersData.partners.findIndex(
    p => p.slug === slug || p.website.toLowerCase() === website.toLowerCase()
  );

  if (existingIndex !== -1) {
    console.log(`\nPartner "${name}" already exists. Updating...`);
  }

  // Calculate next ID and order
  const maxId = Math.max(...partnersData.partners.map(p => parseInt(p.id, 10)));
  const categoryPartners = partnersData.partners.filter(p => p.category === category);
  const maxOrder = categoryPartners.length > 0
    ? Math.max(...categoryPartners.map(p => p.order || 0))
    : 0;

  // Step 7: Create partner object
  const newPartner: Partner = {
    id: existingIndex !== -1 ? partnersData.partners[existingIndex].id : String(maxId + 1),
    name,
    slug,
    description,
    website,
    logo: logoPath,
    ...(heroPath && { heroImage: heroPath }),
    category,
    featured,
    order: existingIndex !== -1 ? partnersData.partners[existingIndex].order || maxOrder + 1 : maxOrder + 1,
  };

  // Step 8: Add or update partner
  if (existingIndex !== -1) {
    partnersData.partners[existingIndex] = newPartner;
  } else {
    partnersData.partners.push(newPartner);
  }

  // Step 9: Save updated JSON
  fs.writeFileSync(PARTNERS_JSON_PATH, JSON.stringify(partnersData, null, 2) + '\n');
  console.log(`\n Partner "${name}" added successfully!`);
  console.log('\nPartner details:');
  console.log(JSON.stringify(newPartner, null, 2));
}

// CLI Entry Point
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
Usage: npx tsx scripts/add-partner.ts "Partner Name" "https://website.com" "category" [--featured]

Categories:
  - event-planning
  - mobile-bartending
  - venues
  - catering
  - boats
  - transportation

Options:
  --featured    Mark the partner as featured

Example:
  npx tsx scripts/add-partner.ts "Awesome Bartending" "https://awesomebartending.com" "mobile-bartending" --featured
`);
  process.exit(1);
}

const [partnerName, partnerWebsite, partnerCategory] = args;
const isFeatured = args.includes('--featured');

const validCategories: PartnerCategory[] = [
  'event-planning', 'mobile-bartending', 'venues', 'catering', 'boats', 'transportation'
];

if (!validCategories.includes(partnerCategory as PartnerCategory)) {
  console.error(`Invalid category: ${partnerCategory}`);
  console.error(`Valid categories: ${validCategories.join(', ')}`);
  process.exit(1);
}

addPartner(partnerName, partnerWebsite, partnerCategory as PartnerCategory, isFeatured)
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nError:', error.message);
    process.exit(1);
  });
