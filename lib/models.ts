export type AccessType = 'consumer' | 'api' | 'open-source';

export const ACCESS_LABELS: Record<AccessType, string> = {
  consumer: 'Consumer App',
  api: 'API',
  'open-source': 'Open Source',
};

export const ACCESS_COLORS: Record<AccessType, { bg: string; text: string }> = {
  consumer:      { bg: 'bg-[#FC9F29]/15', text: 'text-[#7A4A00]' },
  api:           { bg: 'bg-[#214FD1]/10', text: 'text-[#022460]' },
  'open-source': { bg: 'bg-[#A78FFF]/15', text: 'text-[#5B3FD1]' },
};

export interface Model {
  id: string;
  provider: string;
  model: string;
  releaseDate: string; // ISO date string YYYY-MM-DD
  notes: string;
  link?: string;
  freeDefault?: boolean; // true if this is the current free-tier default for its provider
  access?: AccessType[]; // how this model is available
}

export const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Google Search', 'Meta', 'DeepSeek'] as const;
export type Provider = (typeof PROVIDERS)[number];

// Evertune brand palette — product usage colors
export const PROVIDER_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  OpenAI:         { bg: 'bg-[#00DEE6]/15', text: 'text-[#005B5B]', dot: 'bg-[#00DEE6]' },
  Anthropic:      { bg: 'bg-[#F7594E]/10', text: 'text-[#B21B59]', dot: 'bg-[#F7594E]' },
  Google:         { bg: 'bg-[#214FD1]/10', text: 'text-[#022460]', dot: 'bg-[#214FD1]' },
  Meta:           { bg: 'bg-[#022460]/10', text: 'text-[#022460]', dot: 'bg-[#022460]' },
  DeepSeek:       { bg: 'bg-[#A78FFF]/15', text: 'text-[#5B3FD1]', dot: 'bg-[#A78FFF]' },
  'Google Search':{ bg: 'bg-[#34A853]/10', text: 'text-[#1A5C2E]', dot: 'bg-[#34A853]' },
};

export type SortField = 'releaseDate' | 'provider' | 'model';
export type SortDir = 'asc' | 'desc';

export function sortModels(models: Model[], field: SortField, dir: SortDir): Model[] {
  return [...models].sort((a, b) => {
    let cmp = 0;
    if (field === 'releaseDate') {
      cmp = a.releaseDate.localeCompare(b.releaseDate);
    } else if (field === 'provider') {
      cmp = a.provider.localeCompare(b.provider) || a.releaseDate.localeCompare(b.releaseDate);
    } else {
      cmp = a.model.localeCompare(b.model);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
