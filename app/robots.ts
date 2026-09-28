import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/will/',
        '/poa/',
        '/witnessing/',
        '/documents/',
        '/auth/',
        '/api/',
        '/start',
        '/resume',
      ],
    },
    sitemap: 'https://www.heirloomlife.com.au/sitemap.xml',
  }
}
