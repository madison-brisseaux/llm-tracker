import { getModels } from '@/lib/storage';
import ModelTable from '@/components/ModelTable';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://models.evertune.ai';

export default async function Home() {
  const { models, lastUpdated } = await getModels();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'AI Model Release Tracker',
    description: 'A comprehensive, daily-updated dataset of AI language model releases from OpenAI, Anthropic, Google, Meta, DeepSeek, and more.',
    url: BASE_URL,
    creator: {
      '@type': 'Organization',
      name: 'Evertune',
      url: 'https://www.evertune.ai',
    },
    keywords: [
      'AI models', 'LLM releases', 'large language models', 'OpenAI', 'Anthropic',
      'Google Gemini', 'Meta Llama', 'DeepSeek', 'GPT', 'Claude', 'AI updates',
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/rss+xml',
      contentUrl: `${BASE_URL}/feed.xml`,
    },
    hasPart: models.map(m => ({
      '@type': 'SoftwareApplication',
      name: m.model,
      applicationCategory: 'Artificial Intelligence',
      creator: { '@type': 'Organization', name: m.provider },
      datePublished: m.releaseDate,
      description: m.notes,
      ...(m.link ? { url: m.link } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ModelTable models={models} lastUpdated={lastUpdated} />
    </>
  );
}
