import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/account/',
        '/checkout/',
        '/cart/',
        '/_next/',
        '/group-order/join/'
      ]
    },
    sitemap: 'https://partyondelivery.com/sitemap.xml',
  }
}