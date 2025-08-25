import { MetadataRoute } from 'next'

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

  // Blog posts (in production, fetch from CMS)
  const blogPosts = [
    '/blog/ultimate-guide-austin-boat-parties',
    '/blog/signature-wedding-cocktails-texas-heat',
    '/blog/bachelor-party-ideas-austin-2024',
    '/blog/corporate-event-bar-service-tips'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }))

  // Blog categories
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
    ...blogPosts,
    ...blogCategories
  ]
}