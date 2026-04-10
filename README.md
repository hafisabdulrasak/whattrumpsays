# What Trump Says

A campaign-poster-styled archival interface for browsing Donald J. Trump's public Truth Social posts in strict reverse chronology.

## Features

- Reverse-chronological timeline with vertical timeline connector (date separators, gap markers)
- Infinite scroll via cursor pagination (`/api/posts`)
- Full-text search, date range filters, and quick filters (Today / This Week / This Month / Archive)
- Playwright-based browser sync — bypasses Cloudflare, captures real engagement data (`reblogs_count`)
- Right sidebar: Today at a Glance, Activity Last Week heatmap, Top 3 Most Shared posts, Highlights
- Campaign poster design: red/yellow/cream palette, bold typography, post number badges
- Post card left-stripe accent with hover glow, bigger text, clickable sidebar mini-cards
- Hero with two-column layout: title + live post count / source stats panel
- Light/dark mode toggle

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (filter state)
- Python + Playwright (ingestion)

## Local development

```bash
npm install
pip install playwright
python -m playwright install chromium
npm run sync        # fetch posts from Truth Social
npm run dev         # start dev server
```

Open `http://localhost:3000`.

## Truth Social sync setup

### Credentials

Set credentials via environment variables or `scripts/truthsocial.credentials.local.json`:

```bash
export TRUTHSOCIAL_TOKEN=your_token
export TRUTHSOCIAL_USERNAME=your_username
export TRUTHSOCIAL_PASSWORD=your_password   # fallback if no token
```

Local file fallback (gitignored):
```bash
cp scripts/truthsocial.credentials.local.example.json scripts/truthsocial.credentials.local.json
```

Credential resolution order:
1. `TRUTHSOCIAL_TOKEN` (recommended)
2. `TRUTHSOCIAL_USERNAME` + `TRUTHSOCIAL_PASSWORD`
3. `scripts/truthsocial.credentials.local.json`

### Sync commands

```bash
npm run sync                  # primary — Playwright browser-based fetch
npm run sync:truthbrush       # fallback — CLI-based fetch (may be blocked by Cloudflare)
npm run debug:truthsocial     # Playwright sync with debug screenshot saved to data/
```

Trigger via API:
```bash
curl -X POST http://localhost:PORT/api/sync
```

### Why Playwright?

Truth Social's API is behind Cloudflare. Server-side HTTP requests (including `truthbrush`) get blocked with a `403 Just a moment...` challenge on datacenter IPs. The Playwright sync launches a real Chromium browser, navigates to Trump's profile, and intercepts the API responses the page makes — bypassing the challenge entirely.

The Playwright script also captures `reblogs_count` and `favourites_count` from the raw API responses, which the CLI tool discards.

## API

| Route | Method | Description |
|-------|--------|-------------|
| `/api/posts` | GET | Paginated posts feed. Params: `limit`, `cursor`, `q`, `source`, `start`, `end`, `quick` |
| `/api/sync` | POST | Trigger Playwright sync to refresh `data/posts.json` |
| `/api/debug/truthsocial` | GET | Diagnostics: Python version, truthbrush install, credentials, sync status |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero + latest timeline + sidebar |
| `/timeline` | Full browsable feed with filters + sidebar |
| `/post/[id]` | Single post detail view |
| `/about` | Methodology and source notes |

## Data

- All posts cached in `data/posts.json` — API never calls Truth Social live
- `data/truthsocial-sync-status.json` — last sync timestamp and status
- `data/truthbrush-debug.json` — raw output saved on parse errors
- `data/playwright-debug.png` — screenshot saved when running `--debug` flag
- Failed syncs preserve the existing cache — no data loss on error

## Notes

- On Windows, Python is invoked as `python` (not `python3`) — handled automatically
- `npm run typecheck` for TypeScript validation
- `npm run lint` for ESLint
