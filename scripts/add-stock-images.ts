/**
 * Add Stock Images to Blog Posts
 *
 * Enhances blog posts with curated stock images from Unsplash
 * based on the post topic and content.
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
  const blogImagesDir = path.join(process.cwd(), 'public', 'images', 'blog', 'stock');

  if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
  }

  const filepath = path.join(blogImagesDir, filename);

  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    console.log(`  ✓ Image exists: ${filename}`);
    return `/images/blog/stock/${filename}`;
  }

  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            const file = fs.createWriteStream(filepath);
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`  ✓ Downloaded: ${filename}`);
              resolve(`/images/blog/stock/${filename}`);
            });
          }).on('error', reject);
          return;
        }
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Downloaded: ${filename}`);
        resolve(`/images/blog/stock/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Get relevant image keywords from post
 */
function getImageKeywords(post: BlogPost): string[] {
  const keywords: string[] = [];

  // Priority keywords based on tags and topics
  const allTopics = [...post.tags, ...post.schema.topics];

  // Map topics to image-friendly search terms
  const keywordMap: Record<string, string> = {
    'wedding': 'wedding celebration elegant',
    'corporate': 'business meeting professional',
    'party': 'celebration party people',
    'bachelorette': 'friends celebration champagne',
    'bachelor': 'friends celebration beer',
    'boat': 'boat lake water',
    'cocktail': 'cocktail drinks bar',
    'event': 'event celebration',
    'austin': 'austin texas skyline',
    'delivery': 'delivery service',
  };

  // Extract relevant keywords
  for (const topic of allTopics) {
    const lowerTopic = topic.toLowerCase();
    for (const [key, value] of Object.entries(keywordMap)) {
      if (lowerTopic.includes(key)) {
        keywords.push(value);
      }
    }
  }

  // Fallback to generic party images
  if (keywords.length === 0) {
    keywords.push('party celebration people');
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Get curated Unsplash images for post
 */
function getCuratedImages(post: BlogPost): Array<{ url: string; alt: string }> {
  const keywords = getImageKeywords(post);
  const images: Array<{ url: string; alt: string }> = [];

  // Curated high-quality Unsplash image IDs for different topics
  const imageDatabase: Record<string, string[]> = {
    'wedding celebration elegant': [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed', // Wedding toast
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc', // Wedding table
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6', // Wedding flowers
    ],
    'business meeting professional': [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', // Business meeting
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7', // Team discussion
      'https://images.unsplash.com/photo-1552664730-d307ca884978', // Office team
    ],
    'celebration party people': [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d', // Party celebration
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', // Party group
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', // Friends celebrating
    ],
    'friends celebration champagne': [
      'https://images.unsplash.com/photo-1529636798458-92182e662485', // Champagne toast
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', // Friends with drinks
      'https://images.unsplash.com/photo-1546947077-96d79cc26ad0', // Women celebrating
    ],
    'friends celebration beer': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5', // Beer cheers
      'https://images.unsplash.com/photo-1436076863939-06870fe779c2', // Friends at bar
      'https://images.unsplash.com/photo-1538587269107-c3c8e05d3e08', // Group with beers
    ],
    'boat lake water': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5', // Boat party
      'https://images.unsplash.com/photo-1551024506-0bccd828d307', // Lake boat
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', // Water scene
    ],
    'cocktail drinks bar': [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', // Cocktails
      'https://images.unsplash.com/photo-1551024506-0bccd828d307', // Bar drinks
      'https://images.unsplash.com/photo-1544145945-f90425340c7e', // Mixed drinks
    ],
    'event celebration': [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d', // Event venue
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', // Event crowd
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94', // Event setup
    ],
    'austin texas skyline': [
      'https://images.unsplash.com/photo-1520096569137-1781a61c58e6', // Austin skyline
      'https://images.unsplash.com/photo-1531218150217-54595bc2b934', // Texas landscape
      'https://images.unsplash.com/photo-1580924240066-a20b5f71ac37', // City celebration
    ],
    'delivery service': [
      'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3', // Delivery concept
      'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e', // Service delivery
      'https://images.unsplash.com/photo-1556761175-4b46a572b786', // Professional service
    ],
  };

  // Get 1-2 images based on keywords
  for (const keyword of keywords.slice(0, 2)) {
    const availableImages = imageDatabase[keyword];
    if (availableImages && availableImages.length > 0) {
      // Pick a random image from available
      const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
      images.push({
        url: `${randomImage}?w=1200&q=80&fit=crop`, // Optimized size
        alt: post.title
      });
    }
  }

  // Fallback to default party image if none found
  if (images.length === 0) {
    images.push({
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fit=crop',
      alt: post.title
    });
  }

  return images.slice(0, 2); // Max 2 images per post
}

/**
 * Insert images into content at logical breaks
 */
function insertImagesIntoContent(content: string, images: Array<{ url: string; alt: string }>): string {
  // Find logical break points (after h1 tags)
  const h1Regex = /<\/h1>/gi;
  const matches: number[] = [];
  let match;

  while ((match = h1Regex.exec(content)) !== null) {
    matches.push(match.index + 5); // After </h1>
  }

  if (matches.length === 0) {
    return content; // No good insertion points
  }

  // Insert first image after first h1
  let updatedContent = content;
  if (matches[0] && images[0]) {
    const imageHtml = `\n\n<div class="blog-image-container" style="margin: 2rem 0;"><img src="${images[0].url}" alt="${images[0].alt}" style="width: 100%; height: auto; border-radius: 8px;" loading="lazy" /></div>\n\n`;
    updatedContent = updatedContent.slice(0, matches[0]) + imageHtml + updatedContent.slice(matches[0]);
  }

  // Insert second image after third h1 (if exists)
  if (matches.length >= 3 && images[1]) {
    const adjustedIndex = matches[2] + (images[0] ? 200 : 0); // Account for first image insertion
    const imageHtml = `\n\n<div class="blog-image-container" style="margin: 2rem 0;"><img src="${images[1].url}" alt="${images[1].alt}" style="width: 100%; height: auto; border-radius: 8px;" loading="lazy" /></div>\n\n`;
    updatedContent = updatedContent.slice(0, adjustedIndex) + imageHtml + updatedContent.slice(adjustedIndex);
  }

  return updatedContent;
}

/**
 * Process single blog post
 */
async function processPost(post: BlogPost): Promise<BlogPost> {
  console.log(`\nProcessing: ${post.title}`);

  // Get curated images for this post
  const images = getCuratedImages(post);
  console.log(`  Found ${images.length} relevant image(s)`);

  // Download images
  const downloadedImages: Array<{ url: string; alt: string }> = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const filename = `${post.slug}-stock-${i}.jpg`;
      const localUrl = await downloadImage(images[i].url, filename);
      downloadedImages.push({
        url: localUrl,
        alt: images[i].alt
      });
    } catch (error) {
      console.error(`  ✗ Failed to download image ${i}:`, error);
    }
  }

  // Insert images into content
  let updatedContent = post.content;
  if (downloadedImages.length > 0) {
    updatedContent = insertImagesIntoContent(post.content, downloadedImages);
    console.log(`  ✓ Inserted ${downloadedImages.length} image(s) into content`);
  }

  return {
    ...post,
    content: updatedContent,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('Starting stock image enhancement...\n');

  // Read posts
  const postsPath = path.join(process.cwd(), 'src', 'data', 'blog-posts', 'posts.json');
  const posts: BlogPost[] = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

  console.log(`Found ${posts.length} posts to enhance\n`);

  // Process all posts
  const enhancedPosts: BlogPost[] = [];
  for (const post of posts) {
    try {
      const enhanced = await processPost(post);
      enhancedPosts.push(enhanced);
    } catch (error) {
      console.error(`Failed to process post: ${post.title}`, error);
      enhancedPosts.push(post); // Keep original if processing fails
    }
  }

  // Save updated posts
  fs.writeFileSync(postsPath, JSON.stringify(enhancedPosts, null, 2));

  console.log('\n✅ Stock image enhancement complete!');
  console.log(`   - Enhanced ${enhancedPosts.length} posts`);
  console.log(`   - Images saved to: public/images/blog/stock/`);
  console.log(`   - Updated file: ${postsPath}`);
}

main().catch(console.error);
