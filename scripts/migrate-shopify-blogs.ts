/**
 * Shopify Blog Migration Script
 *
 * Migrates all blog posts from premier-concierge.myshopify.com/blogs/news
 * to the Next.js blog system while preserving URLs, slugs, and SEO.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const BLOG_HANDLE = 'news';

interface ShopifyArticleNode {
  id: string;
  title: string;
  handle: string;
  contentHtml: string;
  publishedAt: string;
  excerpt?: string;
  excerptHtml?: string;
  image?: {
    url: string;
    altText?: string;
  };
  author?: {
    name: string;
  };
  tags: string[];
  seo?: {
    title?: string;
    description?: string;
  };
}

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
 * Fetch all blog posts from Shopify Storefront API
 */
async function fetchShopifyBlogs(): Promise<ShopifyArticleNode[]> {
  console.log('Fetching blog posts from Shopify Storefront API...');

  const query = `
    query getBlogArticles($handle: String!, $first: Int!) {
      blog(handle: $handle) {
        title
        articles(first: $first) {
          edges {
            node {
              id
              title
              handle
              contentHtml
              publishedAt
              excerpt
              excerptHtml
              image {
                url
                altText
              }
              author {
                name
              }
              tags
              seo {
                title
                description
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    handle: BLOG_HANDLE,
    first: 250, // Shopify max
  };

  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  if (!data.data?.blog) {
    throw new Error(`Blog with handle "${BLOG_HANDLE}" not found`);
  }

  const articles = data.data.blog.articles.edges.map((edge: any) => edge.node);

  console.log(`Found ${articles.length} articles from blog: ${data.data.blog.title}`);

  return articles;
}

/**
 * Download image from URL and save to public/images/blog/
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  const blogImagesDir = path.join(process.cwd(), 'public', 'images', 'blog');

  // Create directory if it doesn't exist
  if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
  }

  const filepath = path.join(blogImagesDir, filename);

  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    console.log(`Image already exists: ${filename}`);
    return `/images/blog/${filename}`;
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(imageUrl, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve(`/images/blog/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

/**
 * Extract plain text from HTML
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate AI-friendly schema from blog content
 */
function generateSchema(article: ShopifyArticleNode): { questionsAnswered: string[]; topics: string[] } {
  const content = stripHtml(article.contentHtml).toLowerCase();
  const title = article.title.toLowerCase();

  const questionsAnswered: string[] = [];
  const topics: string[] = [];

  // Analyze title and content for common questions
  const questionPatterns = [
    { pattern: /how to|how do/i, question: `How to ${title.replace(/how to|how do/gi, '')}` },
    { pattern: /what is|what are/i, question: `What is ${title.replace(/what is|what are/gi, '')}` },
    { pattern: /why|when|where/i, question: title },
    { pattern: /guide|tips|ideas/i, question: `${title}` },
  ];

  questionPatterns.forEach(({ pattern, question }) => {
    if (pattern.test(title) || pattern.test(content)) {
      questionsAnswered.push(question.charAt(0).toUpperCase() + question.slice(1));
    }
  });

  // If no questions found, use the title as the main question
  if (questionsAnswered.length === 0) {
    questionsAnswered.push(article.title);
  }

  // Extract topics from tags
  if (article.tags && article.tags.length > 0) {
    topics.push(...article.tags);
  }

  // Common topic keywords
  const topicKeywords = [
    'wedding', 'party', 'corporate', 'event', 'delivery', 'alcohol',
    'cocktail', 'bar', 'catering', 'austin', 'texas', 'celebration',
    'bachelor', 'bachelorette', 'boat', 'house party'
  ];

  topicKeywords.forEach(keyword => {
    if (content.includes(keyword) && !topics.includes(keyword)) {
      topics.push(keyword);
    }
  });

  return {
    questionsAnswered: [...new Set(questionsAnswered)],
    topics: [...new Set(topics)], // Remove duplicates
  };
}

/**
 * Transform Shopify article to blog post format
 */
async function transformArticle(article: ShopifyArticleNode): Promise<BlogPost> {
  const schema = generateSchema(article);

  // Download image if exists
  let image: BlogPost['image'] = undefined;
  if (article.image?.url) {
    try {
      const imageUrl = article.image.url;
      const urlParts = new URL(imageUrl);
      const originalFilename = path.basename(urlParts.pathname);
      const imageFilename = `${article.handle}-${originalFilename}`;
      const localImageUrl = await downloadImage(imageUrl, imageFilename);
      image = {
        url: localImageUrl,
        alt: article.image.altText || article.title,
      };
    } catch (error) {
      console.error(`Failed to download image for ${article.handle}:`, error);
    }
  }

  // Generate excerpt
  let excerpt = '';
  if (article.excerptHtml) {
    excerpt = stripHtml(article.excerptHtml);
  } else if (article.excerpt) {
    excerpt = article.excerpt;
  } else {
    excerpt = stripHtml(article.contentHtml).substring(0, 200) + '...';
  }

  // Ensure excerpt is reasonable length
  if (excerpt.length > 300) {
    excerpt = excerpt.substring(0, 297) + '...';
  }

  const seoDescription = article.seo?.description || excerpt;

  return {
    id: article.id,
    slug: article.handle,
    title: article.title,
    excerpt,
    content: article.contentHtml,
    publishedAt: article.publishedAt,
    author: article.author?.name || 'Party On Delivery',
    tags: article.tags || [],
    image,
    seo: {
      title: article.seo?.title || article.title,
      description: seoDescription,
      keywords: schema.topics,
    },
    schema,
  };
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('Starting blog migration...\n');

    // Fetch all articles from Shopify
    const articles = await fetchShopifyBlogs();

    if (articles.length === 0) {
      console.log('No articles found to migrate');
      return;
    }

    console.log(`\nTransforming ${articles.length} articles...\n`);

    // Transform all articles
    const blogPosts: BlogPost[] = [];
    for (const article of articles) {
      console.log(`Processing: ${article.title}`);
      const post = await transformArticle(article);
      blogPosts.push(post);
    }

    // Sort by published date (newest first)
    blogPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Save to JSON file
    const dataDir = path.join(process.cwd(), 'src', 'data', 'blog-posts');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'posts.json');
    fs.writeFileSync(outputPath, JSON.stringify(blogPosts, null, 2));

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Migrated ${blogPosts.length} blog posts`);
    console.log(`   - Data saved to: ${outputPath}`);
    console.log(`   - Images saved to: public/images/blog/`);

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Total posts: ${blogPosts.length}`);
    console.log(`   With images: ${blogPosts.filter(p => p.image).length}`);
    console.log(`   Total unique topics: ${[...new Set(blogPosts.flatMap(p => p.schema.topics))].length}`);
    console.log(`   Date range: ${new Date(blogPosts[blogPosts.length - 1].publishedAt).toLocaleDateString()} - ${new Date(blogPosts[0].publishedAt).toLocaleDateString()}`);

    // Sample of migrated posts
    console.log('\n📝 Sample posts:');
    blogPosts.slice(0, 5).forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.title}`);
      console.log(`      Slug: /blogs/news/${post.slug}`);
      console.log(`      Published: ${new Date(post.publishedAt).toLocaleDateString()}`);
      console.log(`      Tags: ${post.tags.slice(0, 3).join(', ')}${post.tags.length > 3 ? '...' : ''}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
