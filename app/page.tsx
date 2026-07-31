import { getModels } from '@/lib/storage';
import ModelTable from '@/components/ModelTable';
import TrackerAbout from '@/components/TrackerAbout';
import { buildFaq, mostRecent } from '@/lib/insights';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://models.evertune.ai';

// The public marketing page that embeds this tracker. Declaring it in structured
// data links the two pages so citation signals reinforce rather than compete.
const MARKETING_URL = 'https://www.evertune.ai/resources/ai-model-tracker';

export default async function Home() {
  const { models, lastUpdated } = await getModels();

  const top = mostRecent(models);
  // dateModified drives the freshness signal; fall back to the newest release date.
  const dateModified = lastUpdated ?? (top ? `${top.releaseDate}T00:00:00Z` : undefined);
  const earliest = models.reduce(
    (min, m) => (m.releaseDate < min ? m.releaseDate : min),
    top?.releaseDate ?? '2020-01-01'
  );

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'AI Model Release Tracker',
    description: 'A comprehensive, daily-updated dataset of AI language model releases from OpenAI, Anthropic, Google, Meta, DeepSeek, and more.',
    url: BASE_URL,
    ...(dateModified ? { dateModified } : {}),
    ...(top ? { temporalCoverage: `${earliest}/${top.releaseDate}` } : {}),
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'Evertune',
      url: 'https://www.evertune.ai',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Evertune',
      url: 'https://www.evertune.ai',
    },
    mainEntityOfPage: MARKETING_URL,
    keywords: [
      'AI models', 'LLM releases', 'large language models', 'OpenAI', 'Anthropic',
      'Google Gemini', 'Meta Llama', 'DeepSeek', 'GPT', 'Claude', 'AI updates',
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${BASE_URL}/ai-model-tracker.json`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${BASE_URL}/ai-model-tracker.csv`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/rss+xml',
        contentUrl: `${BASE_URL}/feed.xml`,
      },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: buildFaq(models, lastUpdated).map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <ModelTable models={models} lastUpdated={lastUpdated} />
      <TrackerAbout models={models} lastUpdated={lastUpdated} />
    </>
  );
}
