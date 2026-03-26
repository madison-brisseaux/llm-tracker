import { NextResponse } from 'next/server';
import { getModels, saveModels } from '@/lib/storage';
import { Model } from '@/lib/models';

// Called by Vercel Cron daily at 06:00 UTC
// Vercel automatically sets Authorization: Bearer <CRON_SECRET> header

export const maxDuration = 60;

interface DiscoveredModel {
  provider: string;
  model: string;
  releaseDate: string;
  notes: string;
  link?: string;
}

async function discoverNewModels(
  existingModels: Model[],
  apiKey: string
): Promise<DiscoveredModel[]> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const existingList = existingModels
    .map(m => `${m.provider} ${m.model} (${m.releaseDate})`)
    .join('\n');

  const today = new Date().toISOString().split('T')[0];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 8); // Overlap by 1 day to avoid gaps
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  // Use Claude with web search — same approach as manual research
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
    messages: [
      {
        role: 'user',
        content: `Search the web for new AI language model releases from OpenAI, Anthropic, Google DeepMind, Meta, and Mistral AI that were released or announced between ${cutoffStr} and ${today}.

Models already tracked — do NOT include these:
${existingList}

After searching, return ONLY a JSON array of newly discovered models not in the list above.
Format: [{"provider":"...","model":"...","releaseDate":"YYYY-MM-DD","notes":"1-2 sentence description","link":"announcement URL"}]
Provider must be exactly one of: OpenAI, Anthropic, Google, Meta, Mistral
If no new models found, return: []
Return only the JSON array, nothing else.`,
      },
    ],
  });

  // Find the final text block (after any tool use blocks)
  const textBlock = [...response.content].reverse().find(b => b.type === 'text');
  const text = textBlock?.type === 'text' ? textBlock.text : '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? (JSON.parse(jsonMatch[0]) as DiscoveredModel[]) : [];
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 503 });
  }

  try {
    const { models: existingModels } = await getModels();
    const newModels = await discoverNewModels(existingModels, process.env.ANTHROPIC_API_KEY);

    if (newModels.length === 0) {
      return NextResponse.json({ message: 'No new models found' });
    }

    // Merge new models, avoiding duplicates
    const existingIds = new Set(existingModels.map(m => `${m.provider}:${m.model}`.toLowerCase()));
    const toAdd: Model[] = newModels
      .filter(m => !existingIds.has(`${m.provider}:${m.model}`.toLowerCase()))
      .map(m => ({
        id: `${m.provider.toLowerCase()}-${m.model.toLowerCase().replace(/[^a-z0-9]/g, '')}-auto`,
        ...m,
      }));

    if (toAdd.length > 0) {
      const updated = [...existingModels, ...toAdd].sort(
        (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      await saveModels(updated);
    }

    return NextResponse.json({
      message: `Added ${toAdd.length} new model(s)`,
      added: toAdd.map(m => `${m.provider} ${m.model}`),
    });
  } catch (err) {
    console.error('Update failed:', err);
    return NextResponse.json({ error: 'Update failed', detail: String(err) }, { status: 500 });
  }
}
