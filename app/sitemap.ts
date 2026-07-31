import type { MetadataRoute } from 'next';
import { getModels } from '@/lib/storage';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://models.evertune.ai';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { models } = await getModels();

  const mostRecent = models.reduce((latest, m) =>
    m.releaseDate > latest ? m.releaseDate : latest, '2020-01-01'
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(mostRecent),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/ai-model-tracker.json`,
      lastModified: new Date(mostRecent),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ai-model-tracker.csv`,
      lastModified: new Date(mostRecent),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/feed.xml`,
      lastModified: new Date(mostRecent),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];
}
