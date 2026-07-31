import { Model, formatDate } from './models';

// Core model providers (excludes the "Google Search" feature category, which
// tracks AI-search product updates rather than model releases).
const MODEL_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'DeepSeek'] as const;

function newest(models: Model[]): Model | null {
  if (models.length === 0) return null;
  return [...models].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];
}

/** The single most recently released item across all providers. */
export function mostRecent(models: Model[]): Model | null {
  return newest(models);
}

/** The latest release for each core model provider, newest first. */
export function latestByProvider(models: Model[]): { provider: string; model: Model }[] {
  const result: { provider: string; model: Model }[] = [];
  for (const provider of MODEL_PROVIDERS) {
    const latest = newest(models.filter(m => m.provider === provider));
    if (latest) result.push({ provider, model: latest });
  }
  return result.sort((a, b) => b.model.releaseDate.localeCompare(a.model.releaseDate));
}

/** A plain-English summary sentence for humans and answer engines. */
export function buildSummary(models: Model[]): string {
  const top = mostRecent(models);
  const providerCount = new Set(models.map(m => m.provider)).size;
  if (!top) return 'No AI model releases are currently tracked.';
  return `As of ${formatDate(top.releaseDate)}, this tracker lists ${models.length} AI model releases and updates from ${providerCount} providers. The most recent entry is ${top.provider} ${top.model} (${formatDate(top.releaseDate)}).`;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Question/answer pairs generated from the live data — the shape answer engines lift. */
export function buildFaq(models: Model[], lastUpdated: string | null): FaqItem[] {
  const faq: FaqItem[] = [];
  const top = mostRecent(models);

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

  const freeDefault = models.find(m => m.freeDefault);
  if (freeDefault) {
    faq.push({
      question: 'Which AI model is the current default for free-tier users?',
      answer: `${freeDefault.provider} ${freeDefault.model} is currently flagged as the default model for free-tier users.`,
    });
  }

  const aiModeDefault = models.find(m => m.aiModeDefault);
  if (aiModeDefault) {
    faq.push({
      question: 'Which model powers Google AI Mode?',
      answer: `${aiModeDefault.provider} ${aiModeDefault.model} is currently flagged as the default model powering Google AI Mode.`,
    });
  }

  faq.push({
    question: 'How often is the AI Model Release Tracker updated?',
    answer: lastUpdated
      ? `The tracker is updated daily. It was last updated on ${formatDate(lastUpdated.split('T')[0])}.`
      : 'The tracker is updated daily as new models and AI-search features are announced.',
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

// Approved company description, reused in the "What is Evertune?" FAQ and schema.
export const EVERTUNE_DESCRIPTION =
  "Evertune is the first Generative Engine Optimization (GEO) platform built to explore, measure, act and advertise across the entire AI customer journey, connecting brands directly to ChatGPT Ads and programmatic advertising partners like The Trade Desk and Index Exchange. Where most GEO tools sample each prompt once a day, Evertune samples every prompt 100 times per model across 11+ AI models, delivering statistically significant visibility data at half the cost of competing platforms. Evertune's agents do the work for you: a prompt agent mines over 150 million real user conversations to find the exact questions buyers ask, an insights agent tells you what to do next each week, and an ads agent builds a complete ChatGPT campaign around your visibility gaps. From there, Evertune closes the loop with website optimization, data-driven content creation, source-level influence mapping and paid activation through affiliate and programmatic AI retargeting partners. Founded by the team that pioneered programmatic advertising at The Trade Desk, now building the next marketing channel.";
