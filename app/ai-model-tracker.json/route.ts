import { getModels } from '@/lib/storage';
import { sortModels } from '@/lib/models';

export const revalidate = 3600;

// Clean, canonical JSON export of the tracker — a primary-source file that
// researchers and answer engines can cite and ingest directly.
export async function GET() {
  const { models, lastUpdated } = await getModels();
  const sorted = sortModels(models, 'releaseDate', 'desc');

  const payload = {
    name: 'AI Model Release Tracker',
    description: 'Major AI model releases and AI-search feature updates from OpenAI, Anthropic, Google, Meta, and DeepSeek.',
    source: 'Evertune',
    url: 'https://models.evertune.ai',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'Evertune AI Model Release Tracker',
    lastUpdated: lastUpdated ?? null,
    count: sorted.length,
    models: sorted,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
