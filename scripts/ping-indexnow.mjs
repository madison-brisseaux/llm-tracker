#!/usr/bin/env node
/**
 * Notifies IndexNow (Bing, and other participating engines) that the tracker's
 * pages changed, so they re-crawl within minutes instead of days.
 *
 * Run after a data update + deploy: node scripts/ping-indexnow.mjs
 * Called by the daily llm-release-monitor routine.
 *
 * IndexNow only accepts URLs on the same host as the key file, so this submits
 * the models.evertune.ai pages. The key file lives at public/<KEY>.txt and is
 * served at https://models.evertune.ai/<KEY>.txt.
 */

const KEY = '686a77dcab774c9ae017072abe902fa6';
const HOST = 'models.evertune.ai';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/ai-model-tracker.json`,
  `https://${HOST}/ai-model-tracker.csv`,
  `https://${HOST}/feed.xml`,
];

async function main() {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: URL_LIST }),
  });
  // IndexNow returns 200 or 202 on success; 4xx on key/URL problems.
  console.log(`IndexNow ping: HTTP ${res.status} for ${URL_LIST.length} URLs`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`IndexNow non-OK response: ${body.slice(0, 300)}`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('IndexNow ping failed:', e.message);
  process.exit(1);
});
