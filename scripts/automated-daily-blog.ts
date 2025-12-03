#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Dynamic imports for image generation (may not be available in CI)
let generateWithRetry: ((prompt: string) => Promise<string | null>) | null = null;
let saveImageFromBase64: ((data: string, outputPath: string) => Promise<void>) | null = null;

// Try to load image generation tools (only available locally, not in CI)
try {
  // These imports will fail in CI where image-generator-tool isn't available
  const imageApi = require('../image-generator-tool/lib/api');
  const imageLib = require('../image-generator-tool/lib/image');
  generateWithRetry = imageApi.generateWithRetry;
  saveImageFromBase64 = imageLib.saveImageFromBase64;
  console.log('✅ Image generation tools loaded successfully');
} catch {
  console.log('⚠️  Image generation tools not available (CI environment) - using placeholder images');
}

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Using Anthropic API directly (more reliable than OpenRouter)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.GOOGLE_API_KEY || '';

interface Topic {
  id: number;
  title: string;
  category: string;
  keywords: string[];
  published: boolean;
}

interface TopicsData {
  topics: Topic[];
}

// Configuration
const CONFIG = {
  contentDir: path.join(process.cwd(), 'content', 'blog', 'posts'),
  imagesDir: path.join(process.cwd(), 'public', 'images', 'blog'),
  topicsFile: path.join(process.cwd(), 'scripts', 'topics.json'),
  targetWordCount: 1200,
  imagesPerPost: 4,
};

// Utility functions
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load topics from JSON
function loadTopics(): TopicsData {
  const data = fs.readFileSync(CONFIG.topicsFile, 'utf-8');
  return JSON.parse(data);
}

// Save updated topics
function saveTopics(topics: TopicsData): void {
  fs.writeFileSync(CONFIG.topicsFile, JSON.stringify(topics, null, 2));
}

// Get next unpublished topic (optionally filtered by category)
function getNextTopic(topics: TopicsData, categoryFilter?: string): Topic | null {
  return topics.topics.find(t => {
    if (!t.published) {
      if (categoryFilter) {
        return t.category === categoryFilter;
      }
      return true;
    }
    return false;
  }) || null;
}

// Mark topic as published
function markTopicPublished(topics: TopicsData, topicId: number): void {
  const topic = topics.topics.find(t => t.id === topicId);
  if (topic) {
    topic.published = true;
  }
}

// Generate blog content with Claude via Anthropic API
async function generateBlogContent(topic: Topic): Promise<string> {
  console.log(`🤖 Generating blog content with Claude via Anthropic API...`);

  const serviceInfo = getCategoryServiceInfo(topic.category);

  const prompt = `You are an expert SEO content writer for Party On Delivery, an Austin-based premium alcohol delivery service specializing in weddings, bachelor/bachelorette parties, boat parties, and corporate events.

Write a comprehensive, SEO-optimized 1,000-1,200 word blog post about: "${topic.title}"

CONTENT GUIDELINES:
- Write in a conversational, friendly tone with authentic Austin/Texas personality
- Include specific Austin locations, venues, and local references (with addresses when relevant)
- Add practical tips, actionable advice, and insider knowledge
- Include real scenarios and examples (can be fictionalized but realistic)
- Naturally mention Party On Delivery services where relevant (not salesy)
- Use descriptive subheadings (##) to break up content
- Target keywords naturally throughout: ${topic.keywords.join(', ')}
- End with a clear next step or call-to-action

CATEGORY-SPECIFIC CALL-TO-ACTION (CRITICAL):
This blog post is about "${topic.category}". The conclusion MUST:
- Link to our ${topic.category.toLowerCase()} service page: ${serviceInfo.url}
- Mention our specific ${topic.category.toLowerCase()} services: ${serviceInfo.description}
- Use a natural, contextual CTA that relates to the article topic
- Format: [text about our service](${serviceInfo.url})
Example: "Ready to elevate your ${topic.category.toLowerCase().replace('parties', 'party')}? [Explore our ${serviceInfo.description}](${serviceInfo.url}) and let Party On Delivery handle the details."

EXTERNAL BUSINESS REFERENCES (CRITICAL - MINIMUM 5-7 REQUIRED):
- MUST include at least 5-7 real external business links per blog post
- ALWAYS hyperlink any business, venue, restaurant, or service you mention
- Use real, publicly available websites for all businesses mentioned
- Format: [Business Name](https://actual-website.com)
- Include the full website URL (not placeholder links)
- Examples of businesses to link:
  * Venues: [Fairmont Austin](https://www.fairmont.com/austin/)
  * Restaurants: [Franklin Barbecue](https://franklinbbq.com/)
  * Attractions: [The Oasis on Lake Travis](https://www.oasis-austin.com/)
  * Event spaces: [Brazos Hall](https://brazoshall.com/)
  * Transportation: [Longhorn Charter Bus](https://www.longhorn-charter.com/)
- If you mention a business without a website, note their location/contact info instead
- TARGET: 5-7 hyperlinked businesses minimum per post

PUBLIC IMAGES FOR BUSINESSES (WHEN RELEVANT):
- When featuring specific venues/businesses prominently, reference their publicly available images
- Use actual image URLs from their websites or public sources
- Format: ![Venue Name](https://actual-image-url.jpg)
- Only include external images if they're publicly accessible and relevant
- Do NOT use placeholder or generic image URLs

SEO & STRUCTURED DATA REQUIREMENTS (ALL TABLES MUST HAVE SCHEMA.ORG):
- Create HTML tables (not Markdown) for ANY comparison with 3+ items
- Use proper semantic markup: <table>, <thead>, <tbody>, <th scope="col">
- REQUIRED: ALL tables MUST have Schema.org microdata attributes
- Table wrapper: itemScope itemType="https://schema.org/Table"
- Pricing rows: itemScope itemType="https://schema.org/Offer"
- Item names: itemProp="name"
- Prices: itemProp="price"
- Include a FAQ section (## Frequently Asked Questions) with 3-5 Q&As
- Use clear question format (### Q: ...) and answer format (A: ...)
- Provide direct, factual answers optimized for AI search engines

TABLE TRIGGERS (automatically create HTML tables for):
- Pricing comparisons (packages, tiers, options with costs)
- Venue comparisons (capacity, location, amenities, pricing)
- Timeline planning (booking windows, lead times, deadlines)
- Package inclusions (what's included in each service tier)
- Budget breakdowns (itemized cost estimates)
- Service area coverage (zip codes, neighborhoods, delivery fees)
- Any comparison with 3+ numerical data points

HTML TABLE FORMAT (COPY THIS EXACT STRUCTURE - SCHEMA.ORG REQUIRED):
<div itemScope itemType="https://schema.org/Table">
  <table className="comparison-table">
    <caption>Descriptive Table Caption</caption>
    <thead>
      <tr>
        <th scope="col">Column 1</th>
        <th scope="col">Column 2</th>
        <th scope="col">Column 3</th>
      </tr>
    </thead>
    <tbody>
      <tr itemScope itemType="https://schema.org/Offer">
        <td><strong itemProp="name">Item Name</strong></td>
        <td><span itemProp="price">$XX-XX</span></td>
        <td>Additional details</td>
      </tr>
      <tr itemScope itemType="https://schema.org/Offer">
        <td><strong itemProp="name">Second Item</strong></td>
        <td><span itemProp="price">$YY-YY</span></td>
        <td>More details</td>
      </tr>
    </tbody>
  </table>
</div>

CRITICAL: Do NOT create tables without Schema.org attributes. Every table MUST have:
- Wrapper div with: itemScope itemType="https://schema.org/Table"
- Each row with: itemScope itemType="https://schema.org/Offer"
- Item names with: itemProp="name"
- Prices with: itemProp="price"

REQUIRED SECTIONS:
1. Engaging introduction with a hook
2. 5-7 main content sections with descriptive ## subheadings
3. AT LEAST ONE HTML table comparing options/pricing/venues
4. Practical tips throughout with bullet points
5. FAQ section with 3-5 questions (use ### Q: format)
6. Conclusion with clear call-to-action
7. Schema.org JSON-LD block at the very end (see format below)

SCHEMA.ORG JSON-LD (add this at the END of the blog post):
\`\`\`json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://partyondelivery.com/blog/${createSlug(topic.title)}",
      "headline": "${topic.title}",
      "description": "[First 160 characters of intro]",
      "author": {
        "@type": "Organization",
        "name": "Party On Delivery",
        "url": "https://partyondelivery.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Party On Delivery",
        "url": "https://partyondelivery.com"
      },
      "datePublished": "${formatDate(new Date())}",
      "keywords": "${topic.keywords.join(', ')}"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[Question 1 from FAQ section]",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Answer 1 from FAQ section]"
          }
        }
      ]
    },
    {
      "@type": "LocalBusiness",
      "name": "Party On Delivery",
      "@id": "https://partyondelivery.com",
      "url": "https://partyondelivery.com",
      "telephone": "(737) 371-9700",
      "email": "info@partyondelivery.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Austin",
        "addressRegion": "TX",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.2672",
        "longitude": "-97.7431"
      },
      "priceRange": "$$",
      "servesCuisine": "Alcohol Delivery",
      "areaServed": {
        "@type": "City",
        "name": "Austin"
      }
    }
  ]
}
\`\`\`

IMPORTANT:
- Keep tables simple (max 4 columns for mobile readability)
- Ensure all pricing includes context (per person, per hour, etc.)
- FAQ answers should be 2-4 sentences, direct and factual
- Schema JSON-LD must be valid and complete
- Write in MDX format (HTML tables are allowed in MDX)

Write the blog post now:`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Generate images for the blog post
async function generateBlogImages(topic: Topic, slug: string): Promise<string[]> {
  // If image generation tools aren't available, return placeholder images
  if (!generateWithRetry || !saveImageFromBase64) {
    console.log(`🖼️  Using placeholder images (image generation not available in CI)`);

    // Use a default hero image based on category
    const categoryImages: Record<string, string> = {
      'Corporate Events': '/images/hero/mobile-bartender-outdoor-event.webp',
      'Weddings': '/images/hero/lake-travis-sunset.webp',
      'Bachelor Parties': '/images/hero/lake-travis-sunset.webp',
      'Bachelorette Parties': '/images/hero/lake-travis-sunset.webp',
      'Boat Parties': '/images/hero/lake-travis-sunset.webp',
    };

    const defaultImage = categoryImages[topic.category] || '/images/hero/lake-travis-sunset.webp';
    return [defaultImage];
  }

  console.log(`🎨 Generating ${CONFIG.imagesPerPost} images...`);

  // Create slug-specific directory
  const imageDir = path.join(CONFIG.imagesDir, slug);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const imagePaths: string[] = [];

  // Define image prompts based on topic category
  const baseStyle = "professional photography, high quality, ultra high resolution, Austin Texas aesthetic";

  const imagePrompts = [
    `${topic.title} hero image, ${baseStyle}`,
    `Austin ${topic.category.toLowerCase()} scene, people celebrating, ${baseStyle}`,
    `Elegant alcohol service setup, premium spirits, ${baseStyle}`,
    `Lake Travis or Austin skyline background, party atmosphere, ${baseStyle}`,
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

      // Rate limiting
      if (i < CONFIG.imagesPerPost - 1) {
        await sleep(3000); // 3 second delay between images
      }
    } catch (error) {
      console.error(`   ❌ Failed to generate image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }

  return imagePaths;
}

// Insert images into content
function insertImagesIntoContent(content: string, imagePaths: string[]): string {
  if (imagePaths.length === 0) return content;

  const lines = content.split('\n');
  const newLines: string[] = [];
  let imageIndex = 0;
  let headerCount = 0;

  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);

    // Insert image after every 2nd header (## heading)
    if (lines[i].startsWith('## ') && !lines[i].startsWith('### ')) {
      headerCount++;

      if (headerCount % 2 === 0 && imageIndex < imagePaths.length) {
        newLines.push('');
        newLines.push(`![${headerCount === 2 ? 'Hero' : 'Content'} Image](${imagePaths[imageIndex]})`);
        newLines.push('');
        imageIndex++;
      }
    }
  }

  // Add any remaining images at the end
  while (imageIndex < imagePaths.length) {
    newLines.push('');
    newLines.push(`![Additional Image](${imagePaths[imageIndex]})`);
    imageIndex++;
  }

  return newLines.join('\n');
}

// Get category-specific service page info for CTAs
function getCategoryServiceInfo(category: string): { url: string; description: string } {
  const categoryMap: Record<string, { url: string; description: string }> = {
    'Corporate Events': {
      url: 'https://partyondelivery.com/corporate',
      description: 'premium bar service for corporate events, team building activities, client appreciation events, and professional happy hours in Austin'
    },
    'Weddings': {
      url: 'https://partyondelivery.com/weddings',
      description: 'wedding bar service, signature cocktails, reception beverage packages, and day-of alcohol delivery for Austin weddings'
    },
    'Bachelor Parties': {
      url: 'https://partyondelivery.com/bach-parties',
      description: 'bachelor party packages, premium alcohol delivery, and party supplies for epic Austin bachelor weekends'
    },
    'Bachelorette Parties': {
      url: 'https://partyondelivery.com/bach-parties',
      description: 'bachelorette party packages, curated bar setups, and premium beverage delivery for unforgettable Austin bachelorette weekends'
    },
    'Boat Parties': {
      url: 'https://partyondelivery.com/boat-parties',
      description: 'boat party alcohol delivery, cooler packages, and premium beverage service for Lake Travis and Lake Austin boat parties'
    }
  };

  return categoryMap[category] || {
    url: 'https://partyondelivery.com/',
    description: 'premium alcohol delivery, curated beverage packages, and exceptional service for all your Austin events and celebrations'
  };
}

// Select random author with weighted distribution
function selectAuthor(): string {
  // 75% Allan Henslee, 25% Brian Hill
  const random = Math.random();
  return random < 0.75 ? "Allan Henslee" : "Brian Hill";
}

// Create MDX file with frontmatter
function createMDXFile(topic: Topic, content: string, imagePaths: string[]): string {
  const slug = createSlug(topic.title);
  const date = formatDate(new Date());
  const author = selectAuthor();

  const contentWithImages = insertImagesIntoContent(content, imagePaths);

  const frontmatter = `---
title: "${topic.title}"
date: "${date}"
category: "${topic.category}"
excerpt: "${content.substring(0, 160).replace(/"/g, '\\"')}..."
image: "${imagePaths[0] || '/images/hero/lake-travis-sunset.webp'}"
keywords: ${JSON.stringify(topic.keywords)}
author: "${author}"
---

`;

  return frontmatter + contentWithImages;
}

// Save MDX file
function saveMDXFile(slug: string, mdxContent: string): string {
  const filename = `${slug}.mdx`;
  const filepath = path.join(CONFIG.contentDir, filename);

  // Ensure directory exists
  if (!fs.existsSync(CONFIG.contentDir)) {
    fs.mkdirSync(CONFIG.contentDir, { recursive: true });
  }

  fs.writeFileSync(filepath, mdxContent);
  return filepath;
}

// Main automation function
async function generateDailyBlog(): Promise<void> {
  console.log('\n🚀 Starting automated blog generation...\n');
  console.log('='.repeat(60));

  // Check for category filter from command line arguments
  const categoryFilter = process.argv.includes('--category')
    ? process.argv[process.argv.indexOf('--category') + 1]
    : undefined;

  if (categoryFilter) {
    console.log(`🎯 Filtering for category: ${categoryFilter}`);
  }

  try {
    // STEP 1: Load topics and select next
    console.log('\n📋 STEP 1/6: Loading topics...');
    const topicsData = loadTopics();
    const topic = getNextTopic(topicsData, categoryFilter);

    if (!topic) {
      console.log('❌ No unpublished topics remaining!');
      process.exit(0);
    }

    console.log(`   ✓ Selected: "${topic.title}"`);
    console.log(`   Category: ${topic.category}`);

    const slug = createSlug(topic.title);
    console.log(`   Slug: ${slug}`);

    // STEP 2: Generate content with Claude
    console.log('\n🤖 STEP 2/6: Generating blog content with Claude...');
    const content = await generateBlogContent(topic);
    console.log(`   ✓ Generated ${content.length} characters`);

    // STEP 3: Generate images
    console.log('\n🎨 STEP 3/6: Generating images...');
    const imagePaths = await generateBlogImages(topic, slug);
    console.log(`   ✓ Generated ${imagePaths.length} images`);

    // STEP 4: Create MDX file
    console.log('\n📝 STEP 4/6: Creating MDX file...');
    const mdxContent = createMDXFile(topic, content, imagePaths);
    const filepath = saveMDXFile(slug, mdxContent);
    console.log(`   ✓ Saved to: ${filepath}`);

    // STEP 5: Update topics list
    console.log('\n📋 STEP 5/6: Updating topics list...');
    markTopicPublished(topicsData, topic.id);
    saveTopics(topicsData);
    console.log(`   ✓ Marked topic ${topic.id} as published`);

    // STEP 6: Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ BLOG GENERATION COMPLETE!');
    console.log(`\n📄 Title: ${topic.title}`);
    console.log(`📁 File: ${filepath}`);
    console.log(`🖼️  Images: ${imagePaths.length}`);
    console.log(`📏 Content: ~${Math.round(content.split(' ').length)} words`);
    console.log(`\n🌐 URL: /blog/${slug}`);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Run the automation
generateDailyBlog();