import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/group/dashboard',
          '/cart/shared/'
        ],
        crawlDelay: 0.5
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/group/dashboard',
          '/cart/shared/'
        ],
        crawlDelay: 1
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/group/dashboard',
          '/cart/shared/'
        ]
      }
    ],
    sitemap: 'https://partyondelivery.com/sitemap.xml',
  }
}