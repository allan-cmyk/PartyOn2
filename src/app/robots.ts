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
          '/cart/shared/',
          '/test-videos'
        ]
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/group/dashboard',
          '/cart/shared/',
          '/test-videos'
        ]
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/checkout/',
          '/group/dashboard',
          '/cart/shared/',
          '/test-videos'
        ]
      }
    ],
    sitemap: 'https://partyondelivery.com/sitemap.xml',
  }
}