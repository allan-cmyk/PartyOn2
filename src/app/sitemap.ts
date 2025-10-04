import { MetadataRoute } from 'next'
import blogPosts from '@/data/blog-posts/posts.json'

interface BlogPost {
  slug: string;
  publishedAt: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://partyondelivery.com'

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/order',
    '/products',
    '/collections',
    '/blog',
    '/blogs/news',
    '/weddings',
    '/boat-parties',
    '/bach-parties',
    '/corporate',
    '/delivery-areas',
    '/terms',
    '/privacy',
    '/faqs',
    '/account',
    '/account/orders'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8
  }))

  // Location pages for SEO
  const locationPages = [
    '/delivery/downtown-austin',
    '/delivery/lake-travis',
    '/delivery/west-austin',
    '/delivery/south-austin',
    '/delivery/east-austin',
    '/delivery/north-austin'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  // Migrated blog posts from Shopify (preserving exact URLs for SEO)
  const migratedBlogPosts = (blogPosts as BlogPost[]).map(post => ({
    url: `${baseUrl}/blogs/news/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  // Blog categories (keeping for backward compatibility)
  const blogCategories = [
    '/blog/category/event-planning',
    '/blog/category/cocktail-recipes',
    '/blog/category/local-guides',
    '/blog/category/business-tips'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5
  }))

  return [
    ...staticPages,
    ...locationPages,
    ...migratedBlogPosts,
    ...blogCategories
  ]
}