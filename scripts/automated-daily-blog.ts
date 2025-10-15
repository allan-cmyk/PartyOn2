#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateWithRetry } from '../image-generator-tool/lib/api';
import { saveImageFromBase64 } from '../image-generator-tool/lib/image';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Using OpenRouter API (same as image generation)
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
  targetWordCount: 2000,
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

// Get next unpublished topic
function getNextTopic(topics: TopicsData): Topic | null {
  return topics.topics.find(t => !t.published) || null;
}

// Mark topic as published
function markTopicPublished(topics: TopicsData, topicId: number): void {
  const topic = topics.topics.find(t => t.id === topicId);
  if (topic) {
    topic.published = true;
  }
}

// Generate blog content with Claude via OpenRouter
async function generateBlogContent(topic: Topic): Promise<string> {
  console.log(`🤖 Generating blog content with Claude via OpenRouter...`);

  const prompt = `You are an expert content writer for Party On Delivery, an Austin-based premium alcohol delivery service specializing in weddings, bachelor/bachelorette parties, boat parties, and corporate events.

Write a comprehensive, engaging 2,000+ word blog post about: "${topic.title}"

IMPORTANT GUIDELINES:
- Write in a conversational, friendly tone with authentic Austin/Texas personality
- Include specific Austin locations, venues, and local references
- Add practical tips, actionable advice, and insider knowledge
- Include real scenarios and examples (can be fictionalized but realistic)
- Naturally mention Party On Delivery services where relevant (not salesy)
- Use subheadings (##) to break up content
- Include bullet points and numbered lists where appropriate
- End with a clear next step or call-to-action related to Party On Delivery
- Target keywords: ${topic.keywords.join(', ')}

The blog should be informative, entertaining, and genuinely helpful to readers planning events in Austin.

STRUCTURE:
1. Engaging introduction with a hook
2. 5-7 main sections with descriptive subheadings
3. Practical tips and actionable advice throughout
4. Natural mentions of Party On Delivery where relevant
5. Conclusion with call-to-action

Write the blog post in Markdown format:`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://partyondelivery.com',
      'X-Title': 'Party On Delivery Blog Generator'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Generate images for the blog post
async function generateBlogImages(topic: Topic, slug: string): Promise<string[]> {
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

// Create MDX file with frontmatter
function createMDXFile(topic: Topic, content: string, imagePaths: string[]): string {
  const slug = createSlug(topic.title);
  const date = formatDate(new Date());

  const contentWithImages = insertImagesIntoContent(content, imagePaths);

  const frontmatter = `---
title: "${topic.title}"
date: "${date}"
category: "${topic.category}"
excerpt: "${content.substring(0, 160).replace(/"/g, '\\"')}..."
image: "${imagePaths[0] || '/images/hero/lake-travis-sunset.webp'}"
keywords: ${JSON.stringify(topic.keywords)}
author: "Party On Delivery Team"
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

  try {
    // STEP 1: Load topics and select next
    console.log('\n📋 STEP 1/6: Loading topics...');
    const topicsData = loadTopics();
    const topic = getNextTopic(topicsData);

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