export interface Model {
  id: string;
  provider: string;
  model: string;
  releaseDate: string; // ISO date string YYYY-MM-DD
  notes: string;
  link?: string;
}

export const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'] as const;
export type Provider = (typeof PROVIDERS)[number];

// Evertune brand palette — product usage colors
export const PROVIDER_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  OpenAI:    { bg: 'bg-[#00DEE6]/15', text: 'text-[#005B5B]', dot: 'bg-[#00DEE6]' },   // Teal Insight
  Anthropic: { bg: 'bg-[#F7594E]/10', text: 'text-[#B21B59]', dot: 'bg-[#F7594E]' },   // Coral Compass
  Google:    { bg: 'bg-[#214FD1]/10', text: 'text-[#022460]', dot: 'bg-[#214FD1]' },   // Blue Vision
  Meta:      { bg: 'bg-[#022460]/10', text: 'text-[#022460]', dot: 'bg-[#022460]' },   // Midnight Observatory
  Mistral:   { bg: 'bg-[#FC9F29]/15', text: 'text-[#905101]', dot: 'bg-[#FC9F29]' },   // Gold Horizon
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
