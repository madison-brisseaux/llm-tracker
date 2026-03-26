#!/usr/bin/env node
/**
 * Manual release checker — run locally with:
 *   node scripts/check-releases.mjs
 *
 * Requires ANTHROPIC_API_KEY in environment (or .env.local).
 * Writes any new discoveries to data/models.json.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'models.json');

// Try to load .env.local
try {
  const envPath = join(__dirname, '..', '.env.local');
  const env = readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // .env.local not found, continue
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY not set. Add it to .env.local or export it.');
  process.exit(1);
}

async function searchWithClaude(existingList, cutoffStr, today) {
  console.log('  Searching the web via Claude...');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Search the web for new AI language model releases from OpenAI, Anthropic, Google DeepMind, Meta, and Mistral AI that were released or announced between ${cutoffStr} and ${today}.

Models already tracked — do NOT include these:
${existingList}

After searching, return ONLY a JSON array of newly discovered models not in the list above.
Format: [{"provider":"...","model":"...","releaseDate":"YYYY-MM-DD","notes":"1-2 sentence description","link":"announcement URL"}]
Provider must be exactly one of: OpenAI, Anthropic, Google, Meta, Mistral
If no new models found, return: []
Return only the JSON array, nothing else.`,
      }],
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  // Find the final text block (after tool use blocks)
  const textBlock = [...(data.content ?? [])].reverse().find(b => b.type === 'text');
  return textBlock?.text ?? '[]';
}

async function main() {
  const existingModels = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const existingList = existingModels
    .map(m => `${m.provider} ${m.model} (${m.releaseDate})`)
    .join('\n');

  const today = new Date().toISOString().split('T')[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  console.log(`\nSearching for new model releases between ${cutoffStr} and ${today}...`);

  let allNew = [];
  try {
    const text = await searchWithClaude(existingList, cutoffStr, today);
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      allNew = JSON.parse(match[0]);
      if (allNew.length > 0) {
        console.log(`\nFound ${allNew.length} potential new model(s):`);
        allNew.forEach(m => console.log(`  - ${m.provider} ${m.model} (${m.releaseDate})`));
      } else {
        console.log('No new models found.');
      }
    }
  } catch (e) {
    console.error(`Search failed: ${e.message}`);
    process.exit(1);
  }

  if (allNew.length === 0) {
    console.log('\nNo new models to add. data/models.json is up to date.');
    return;
  }

  const existingKeys = new Set(
    existingModels.map(m => `${m.provider}:${m.model}`.toLowerCase())
  );
  const toAdd = allNew
    .filter(m => !existingKeys.has(`${m.provider}:${m.model}`.toLowerCase()))
    .map(m => ({
      id: `${m.provider.toLowerCase()}-${m.model.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      ...m,
    }));

  if (toAdd.length === 0) {
    console.log('\nAll found models already exist in data. No changes made.');
    return;
  }

  const updated = [...existingModels, ...toAdd].sort(
    (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
  );

  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2));
  console.log(`\nAdded ${toAdd.length} new model(s) to data/models.json:`);
  toAdd.forEach(m => console.log(`  + ${m.provider} ${m.model} (${m.releaseDate})`));
  console.log('\nDone! Commit data/models.json and push to update the site.');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
