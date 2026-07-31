import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://models.evertune.ai';

// Explicitly welcome the major AI/search crawlers so the tracker is eligible to
// be indexed and cited by answer engines. All are allowed full access.
const AI_CRAWLERS = [
  'GPTBot',          // OpenAI training crawler
  'OAI-SearchBot',   // OpenAI search index
  'ChatGPT-User',    // ChatGPT live browsing
  'ClaudeBot',       // Anthropic crawler
  'Claude-Web',      // Anthropic live browsing
  'anthropic-ai',    // Anthropic
  'PerplexityBot',   // Perplexity index
  'Perplexity-User', // Perplexity live browsing
  'Google-Extended', // Google Gemini / AI Overviews
  'Applebot-Extended', // Apple Intelligence
  'CCBot',           // Common Crawl (feeds many models)
  'Bytespider',      // ByteDance
  'Amazonbot',       // Amazon
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
