# LLM Release Tracker

Tracks major language model releases from OpenAI, Anthropic, Google, Meta, and Mistral — with daily auto-updates via Vercel Cron + Claude API.

## Deploy to Vercel (5 min)

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
gh repo create llm-tracker --public --push --source .
```

### 2. Deploy with Vercel CLI
```bash
vercel login       # Opens browser for auth
vercel --prod      # Deploy — answer prompts, accept all defaults
```

### 3. Add environment variables

In Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `CRON_SECRET` | Any random string: `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN` | See step 4 |

### 4. Enable Blob Storage (for auto-updates)
```bash
vercel storage create   # Choose "Blob" → link to your project
```
Or: Vercel Dashboard → Storage → Create → Blob → Link to Project.

### 5. Redeploy
```bash
vercel --prod
```

The cron job runs daily at 06:00 UTC and uses Claude to scan provider changelogs for new releases.

---

## Local Development

```bash
npm install
npm run dev      # http://localhost:3000
```

### Manual update script
```bash
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run update-models        # checks all providers, updates data/models.json
```

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Server component, loads model data
│   └── api/update/route.ts      # Cron endpoint (daily auto-updates)
├── components/
│   └── ModelTable.tsx            # Table with search, filter, sort
├── data/
│   └── models.json               # Seed data (30+ releases)
├── lib/
│   ├── models.ts                 # Types + sort/format utilities
│   └── storage.ts                # Reads Blob → falls back to JSON
├── scripts/
│   └── check-releases.mjs        # Local manual update script
└── vercel.json                   # Cron: daily at 06:00 UTC
```

## How auto-updates work

1. Vercel Cron calls `GET /api/update` daily at 06:00 UTC
2. Fetches changelog pages from all 5 providers
3. Claude (Haiku) identifies new model releases not yet tracked
4. Merges into existing data and saves to Vercel Blob
5. Page revalidates within 1 hour via ISR
