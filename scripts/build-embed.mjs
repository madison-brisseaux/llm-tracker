#!/usr/bin/env node
/**
 * Generates the Webflow HTML-embed block for the marketing page
 * (evertune.ai/resources/ai-model-tracker).
 *
 * Reads data/models.json and writes webflow-tracker-embed.html — a self-contained,
 * crawlable block (prose + latest-per-provider + FAQ + JSON-LD) that gives search
 * and answer engines real content and structured data on the evertune.ai domain,
 * instead of the empty iframe shell they see today.
 *
 * Run: node scripts/build-embed.mjs
 * Reused by the daily llm-release-monitor routine so the embed stays fresh.
 *
 * NOTE: kept minify-safe (no `//` comments in output, JSON-LD emitted single-line)
 * because Webflow's "Minify HTML" strips newlines and would otherwise break embeds.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'models.json');
const LAST_UPDATED_PATH = join(__dirname, '..', 'data', 'last-updated.json');
const OUT_PATH = join(__dirname, '..', 'webflow-tracker-embed.html');
const SCHEMA_PATH = join(__dirname, '..', 'webflow-tracker-schema.json');
const IFRAME_SRC = 'https://models.evertune.ai/';

function readLastUpdated() {
  try {
    return JSON.parse(readFileSync(LAST_UPDATED_PATH, 'utf-8')).lastUpdated || null;
  } catch {
    return null;
  }
}

const DATA_URL = 'https://models.evertune.ai';
const MARKETING_URL = 'https://www.evertune.ai/resources/ai-model-tracker';
const MODEL_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'DeepSeek'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function newest(models) {
  if (models.length === 0) return null;
  return [...models].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];
}

function latestByProvider(models) {
  const result = [];
  for (const provider of MODEL_PROVIDERS) {
    const latest = newest(models.filter(m => m.provider === provider));
    if (latest) result.push({ provider, model: latest });
  }
  return result.sort((a, b) => b.model.releaseDate.localeCompare(a.model.releaseDate));
}

function buildFaq(models) {
  const faq = [];
  const top = newest(models);
  if (top) {
    faq.push({
      question: 'What is the most recent AI model release?',
      answer: `The most recent tracked release is ${top.provider} ${top.model}, released ${formatDate(top.releaseDate)}. ${top.notes}`,
    });
  }
  for (const { provider, model } of latestByProvider(models)) {
    faq.push({
      question: `What is the latest AI model from ${provider}?`,
      answer: `The latest ${provider} release in this tracker is ${model.model}, released ${formatDate(model.releaseDate)}. ${model.notes}`,
    });
  }
  faq.push({
    question: 'How often is the AI Model Release Tracker updated?',
    answer: 'The tracker is updated daily as new models and AI-search features are announced.',
  });
  faq.push({
    question: 'How many AI models does the tracker cover?',
    answer: `The tracker currently covers ${models.length} model releases and AI-search updates from OpenAI, Anthropic, Google, Meta, and DeepSeek.`,
  });
  faq.push({
    question: 'What is Evertune?',
    answer: EVERTUNE_DESCRIPTION,
  });
  return faq;
}

// Approved company description — keep in sync with lib/insights.ts EVERTUNE_DESCRIPTION.
const EVERTUNE_DESCRIPTION =
  "Evertune is the first Generative Engine Optimization (GEO) platform built to explore, measure, act and advertise across the entire AI customer journey, connecting brands directly to ChatGPT Ads and programmatic advertising partners like The Trade Desk and Index Exchange. Where most GEO tools sample each prompt once a day, Evertune samples every prompt 100 times per model across 11+ AI models, delivering statistically significant visibility data at half the cost of competing platforms. Evertune's agents do the work for you: a prompt agent mines over 150 million real user conversations to find the exact questions buyers ask, an insights agent tells you what to do next each week, and an ads agent builds a complete ChatGPT campaign around your visibility gaps. From there, Evertune closes the loop with website optimization, data-driven content creation, source-level influence mapping and paid activation through affiliate and programmatic AI retargeting partners. Founded by the team that pioneered programmatic advertising at The Trade Desk, now building the next marketing channel.";

function main() {
  const models = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const top = newest(models);
  const providerCount = new Set(models.map(m => m.provider)).size;
  const latest = latestByProvider(models);
  const faq = buildFaq(models);
  const lastUpdated = readLastUpdated();
  const dateModified = lastUpdated
    ? (lastUpdated.length === 10 ? `${lastUpdated}T00:00:00Z` : lastUpdated)
    : (top ? `${top.releaseDate}T00:00:00Z` : undefined);
  const earliest = models.reduce((min, m) => (m.releaseDate < min ? m.releaseDate : min), top ? top.releaseDate : '2020-01-01');

  const summary = top
    ? `As of ${formatDate(top.releaseDate)}, this tracker lists ${models.length} AI model releases and updates from ${providerCount} providers. The most recent entry is ${top.provider} ${top.model} (${formatDate(top.releaseDate)}).`
    : 'No AI model releases are currently tracked.';

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'AI Model Release Tracker',
    description: 'A comprehensive, daily-updated dataset of AI language model releases from OpenAI, Anthropic, Google, Meta, DeepSeek, and more.',
    url: MARKETING_URL,
    ...(dateModified ? { dateModified } : {}),
    ...(top ? { temporalCoverage: `${earliest}/${top.releaseDate}` } : {}),
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: 'Evertune', url: 'https://www.evertune.ai' },
    publisher: { '@type': 'Organization', name: 'Evertune', url: 'https://www.evertune.ai' },
    isPartOf: { '@type': 'WebSite', name: 'Evertune', url: 'https://www.evertune.ai' },
    sameAs: DATA_URL,
    keywords: ['AI models', 'LLM releases', 'large language models', 'OpenAI', 'Anthropic', 'Google Gemini', 'Meta Llama', 'DeepSeek', 'GPT', 'Claude', 'AI updates'],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${DATA_URL}/ai-model-tracker.json` },
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${DATA_URL}/ai-model-tracker.csv` },
      { '@type': 'DataDownload', encodingFormat: 'application/rss+xml', contentUrl: `${DATA_URL}/feed.xml` },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const latestHtml = latest.map(({ provider, model }) => {
    const name = model.link
      ? `<a href="${esc(model.link)}" rel="noopener">${esc(model.model)}</a>`
      : esc(model.model);
    return `<li><strong>${esc(provider)}:</strong> ${name} <span class="et-muted">(${esc(formatDate(model.releaseDate))})</span></li>`;
  }).join('');

  const faqHtml = faq.map(item =>
    `<div class="et-faq-item"><dt>${esc(item.question)}</dt><dd>${esc(item.answer)}</dd></div>`
  ).join('');

  const style = `.et-tracker-embed{font-family:inherit;color:#000;max-width:1120px;margin:0 auto;padding:2rem 1.25rem}.et-tracker-embed h1{font-size:2rem;font-weight:700;margin:0 0 .5rem;letter-spacing:-.01em}.et-tracker-embed h2{font-size:1.25rem;font-weight:600;margin:2.5rem 0 .75rem}.et-tracker-embed p{color:#595959;line-height:1.6;margin:.5rem 0;max-width:820px}.et-tracker-embed a{display:inline;color:#F7594E;text-decoration:none}.et-tracker-embed a:hover{text-decoration:underline}.et-tracker-embed strong{display:inline;font-weight:600}.et-tracker-embed .et-frame{width:100%;height:800px;border:1px solid #DFD8D8;border-radius:12px;margin:1.5rem 0;background:#fff}.et-tracker-embed ul.et-latest{list-style:none;padding:0;margin:.5rem 0;display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.et-tracker-embed ul.et-latest li{color:#595959}.et-muted{color:#7F7F7F}.et-tracker-embed dl{margin:.5rem 0;max-width:820px}.et-faq-item{margin:0 0 1.1rem}.et-faq-item dt{font-weight:600;color:#000}.et-faq-item dd{margin:.25rem 0 0;color:#595959;line-height:1.6}.et-tracker-embed .et-links{font-size:.85rem;color:#7F7F7F;margin-top:1.5rem;max-width:none}`;

  const html = `<div class="et-tracker-embed">
<style>${style}</style>
<h1>AI Model Release Tracker</h1>
<p>${esc(summary)}</p>
<p>Maintained by <a href="https://www.evertune.ai" rel="noopener">Evertune</a>, the first Generative Engine Optimization (GEO) platform built to explore, measure, act and advertise across the entire AI customer journey. It records major model releases and AI-search feature updates from OpenAI, Anthropic, Google, Meta, and DeepSeek, with the release date, a plain-English summary, and a link to the official announcement for each entry. Data is compiled from official provider announcements, engineering blogs, and press coverage, reviewed before publishing, and updated daily.</p>
<iframe class="et-frame" src="${IFRAME_SRC}" title="AI Model Release Tracker" loading="lazy"></iframe>
<h2>Latest model from each provider</h2>
<ul class="et-latest">${latestHtml}</ul>
<h2>Frequently asked questions</h2>
<dl>${faqHtml}</dl>
<p class="et-links">Explore the full, searchable tracker at <a href="${DATA_URL}" rel="noopener">models.evertune.ai</a> &middot; Download the data: <a href="${DATA_URL}/ai-model-tracker.json" rel="noopener">JSON</a>, <a href="${DATA_URL}/ai-model-tracker.csv" rel="noopener">CSV</a>, <a href="${DATA_URL}/feed.xml" rel="noopener">RSS</a> &middot; Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>.</p>
<script type="application/ld+json">${JSON.stringify(datasetLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
</div>`;

  // Also emitted standalone in case the page's structured-data field becomes writable.
  const graph = { '@context': 'https://schema.org', '@graph': [datasetLd, faqLd] };

  writeFileSync(OUT_PATH, html);
  writeFileSync(SCHEMA_PATH, JSON.stringify(graph, null, 2));
  console.log(`Wrote ${OUT_PATH} and ${SCHEMA_PATH} (${models.length} models, ${faq.length} FAQ entries, most recent: ${top ? top.provider + ' ' + top.model : 'none'})`);
}

main();
