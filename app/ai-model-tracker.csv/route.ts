import { getModels } from '@/lib/storage';
import { sortModels } from '@/lib/models';

export const revalidate = 3600;

// CSV export of the tracker for spreadsheets, analysis, and easy citation.
function csvCell(value: string): string {
  // Quote if the value contains a comma, quote, or newline; escape embedded quotes.
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const { models } = await getModels();
  const sorted = sortModels(models, 'releaseDate', 'desc');

  const headers = ['provider', 'model', 'releaseDate', 'notes', 'link'];
  const rows = sorted.map(m =>
    [m.provider, m.model, m.releaseDate, m.notes, m.link ?? '']
      .map(v => csvCell(String(v)))
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\r\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="ai-model-tracker.csv"',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
