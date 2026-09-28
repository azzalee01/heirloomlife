import type { MetadataRoute } from 'next'

const BASE = 'https://www.heirloomlife.com.au'

const LIFE_CHANGE_SLUGS = [
  'getting-married',
  'separation-divorce',
  'new-child',
  'buying-selling-property',
  'serious-illness',
  'starting-selling-business',
  'receiving-inheritance',
  'moving-interstate',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                                        lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/pricing`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/the-will`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/the-platform`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/living-vault`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/how-it-works`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/why-heirloom`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn`,                             lastModified: now, changeFrequency: 'weekly',   priority: 0.8 },
    { url: `${BASE}/learn/your-will`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/choosing-an-executor`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/beneficiaries`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/guardians`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/intestacy`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/superannuation`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/learn/when-to-update`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/life-changes`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/passing`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/passing/estate-administration`,     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/charity-wills`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/for-charities`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/for-advisers`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faq`,                               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/security-trust`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const lifeChangeRoutes: MetadataRoute.Sitemap = LIFE_CHANGE_SLUGS.map(slug => ({
    url: `${BASE}/life-changes/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...lifeChangeRoutes]
}
