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
          '/cart/shared/'
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
          '/cart/shared/'
        ]
      }
    ],
    sitemap: 'https://partyondelivery.com/sitemap.xml',
  }
}