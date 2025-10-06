/**
 * Clean Blog Content Script
 *
 * Fixes HTML content issues from Shopify migration:
 * - Removes broken embedded images from content
 * - Cleans malformed HTML tags
 * - Keeps featured images (those work correctly)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  image?: {
    url: string;
    alt: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  schema: {
    questionsAnswered: string[];
    topics: string[];
  };
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  const blogImagesDir = path.join(process.cwd(), 'public', 'images', 'blog');

  if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
  }

  const filepath = path.join(blogImagesDir, filename);

  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    console.log(`  ✓ Image already exists: ${filename}`);
    return `/images/blog/${filename}`;
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(imageUrl, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Downloaded: ${filename}`);
        resolve(`/images/blog/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`  ✗ Failed to download ${filename}:`, err.message);
      reject(err);
    });
  });
}

/**
 * Extract image URLs from HTML content
 */
function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    // Only process external URLs (Shopify CDN, etc)
    if (url.startsWith('http')) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Generate filename from URL
 */
function generateFilename(url: string, slug: string, index: number): string {
  try {
    const urlObj = new URL(url);
    const basename = path.basename(urlObj.pathname);
    const ext = path.extname(basename) || '.png';
    const name = path.basename(basename, ext).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    return `${slug}-${index}-${name}${ext}`;
  } catch {
    return `${slug}-${index}.png`;
  }
}

/**
 * Remove all img tags and markdown image syntax from content
 */
function removeImages(html: string): string {
  let cleaned = html;

  // Remove all <img> tags (both self-closing and regular)
  cleaned = cleaned.replace(/<img[^>]*>/gi, '');

  // Remove markdown image syntax: ![alt text](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

  return cleaned;
}

/**
 * Clean HTML content
 */
function cleanHtml(html: string): string {
  let cleaned = html;

  // Remove all broken embedded images
  cleaned = removeImages(cleaned);

  // Fix malformed heading tags (e.g., #<h1> should be <h1>)
  cleaned = cleaned.replace(/#<h(\d)>/g, '<h$1>');

  // Fix duplicate closing tags at the end
  cleaned = cleaned.replace(/(<\/h\d>\s*){2,}/g, '</h1>');

  // Remove extra closing tags at the very end
  const endTagsRegex = /(<\/h\d>\s*)+$/;
  cleaned = cleaned.replace(endTagsRegex, '');

  return cleaned;
}

/**
 * Process single blog post
 */
async function processPost(post: BlogPost): Promise<BlogPost> {
  console.log(`\nProcessing: ${post.title}`);

  // Clean HTML (removes embedded images and fixes formatting)
  const updatedContent = cleanHtml(post.content);
  console.log(`  ✓ Removed embedded images and cleaned HTML`);

  // Keep existing featured image (those were downloaded correctly from Shopify API)
  const featuredImage = post.image;

  // Generate clean excerpt from the cleaned content (not original excerpt)
  let cleanExcerpt = updatedContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove markdown images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert markdown links to text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Ensure excerpt is reasonable length
  if (cleanExcerpt.length > 300) {
    cleanExcerpt = cleanExcerpt.substring(0, 297) + '...';
  }

  return {
    ...post,
    content: updatedContent,
    excerpt: cleanExcerpt,
    image: featuredImage,
    seo: {
      ...post.seo,
      description: cleanExcerpt
    }
  };
}

/**
 * Main function
 */
async function main() {
  console.log('Starting blog content cleanup...\n');

  // Read posts
  const postsPath = path.join(process.cwd(), 'src', 'data', 'blog-posts', 'posts.json');
  const posts: BlogPost[] = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

  console.log(`Found ${posts.length} posts to process\n`);

  // Process all posts
  const processedPosts: BlogPost[] = [];
  for (const post of posts) {
    try {
      const processed = await processPost(post);
      processedPosts.push(processed);
    } catch (error) {
      console.error(`Failed to process post: ${post.title}`, error);
      processedPosts.push(post); // Keep original if processing fails
    }
  }

  // Save updated posts
  fs.writeFileSync(postsPath, JSON.stringify(processedPosts, null, 2));

  console.log('\n✅ Blog content cleanup complete!');
  console.log(`   - Processed ${processedPosts.length} posts`);
  console.log(`   - Posts with featured images: ${processedPosts.filter(p => p.image).length}`);
  console.log(`   - Updated file: ${postsPath}`);
}

main().catch(console.error);
