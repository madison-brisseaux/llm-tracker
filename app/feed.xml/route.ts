import { getModels } from '@/lib/storage';
import { sortModels } from '@/lib/models';

export const revalidate = 3600; // revalidate every hour

export async function GET(request: Request) {
  const { models } = await getModels();
  const sorted = sortModels(models, 'releaseDate', 'desc');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? (request.headers.get('host') ? `https://${request.headers.get('host')}` : 'http://localhost:3000');

  const escape = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const items = sorted
    .slice(0, 50) // cap at 50 most recent
    .map(model => {
      const pubDate = new Date(model.releaseDate + 'T00:00:00Z').toUTCString();
      const link = model.link ?? baseUrl;
      return `
    <item>
      <title>${escape(`${model.provider} — ${model.model}`)}</title>
      <link>${escape(link)}</link>
      <guid isPermaLink="${model.link ? 'true' : 'false'}">${escape(model.link ?? `${baseUrl}#${model.id}`)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(model.notes)}</description>
      <category>${escape(model.provider)}</category>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Model Release Dashboard</title>
    <link>${baseUrl}</link>
    <description>Daily updates on the latest LLM model releases from OpenAI, Anthropic, Google, Meta, Mistral, and more.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>1440</ttl>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
