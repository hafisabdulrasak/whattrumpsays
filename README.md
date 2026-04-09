# What Trump Says

A premium, dark-mode-first archival interface for browsing Donald J. Trump public posts in strict reverse chronology.

## Features

- Reverse-chronological timeline (latest first)
- Infinite scroll via cursor pagination (`/api/posts`)
- Truth Social cached ingestion via Python (`truthbrush`)
- Normalized post model used by API + UI
- Empty-state handling when no cached posts exist

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Python + truthbrush (ingestion)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Truth Social sync setup

### 1) Configure environment variables

Set credentials in your shell environment (or your process manager) before running
the app or sync script:

```bash
export TRUTHSOCIAL_USERNAME=your_username
export TRUTHSOCIAL_PASSWORD=your_password
# optional:
export TRUTHSOCIAL_TOKEN=your_token
```

Credential resolution order in sync script:
1. `TRUTHSOCIAL_TOKEN`
2. `TRUTHSOCIAL_USERNAME` + `TRUTHSOCIAL_PASSWORD`

### 2) Install truthbrush

```bash
pip install truthbrush
```

### 3) Sync cached Truth Social posts into `data/posts.json`

```bash
npm run sync
```

Debug sync output:

```bash
npm run debug:truthsocial
```

You can also trigger sync through the local API endpoint:

```bash
curl -X POST http://localhost:3000/api/sync
```

## Troubleshooting Truthbrush

1. Install truthbrush:
   ```bash
   pip install truthbrush
   ```
2. Verify Python version (needs 3.10+):
   ```bash
   python3 --version
   ```
3. Set `TRUTHSOCIAL_USERNAME` and `TRUTHSOCIAL_PASSWORD` (or `TRUTHSOCIAL_TOKEN`) in environment variables.
4. Test truthbrush directly:
   ```bash
   truthbrush statuses realDonaldTrump
   ```
5. Run cache sync:
   ```bash
   npm run sync
   ```
6. Inspect diagnostics:
   - `http://localhost:3000/api/debug/truthsocial`

## Routes

- `/` — hero + latest timeline
- `/timeline` — full browsing experience
- `/post/[id]` — single-post detail view
- `/about` — methodology and source caveats
- `/api/posts` — cached posts feed endpoint with cursor pagination + cache metadata
- `/api/sync` — manually refresh cached posts by running Python ingestion
- `/api/debug/truthsocial` — diagnostics for truthbrush install, env credentials, cache health, and sync status

## Notes

- Data is read from `data/posts.json`.
- Failed sync attempts do not overwrite existing cached posts.
- If parsing fails, raw truthbrush output is preserved at `data/truthbrush-debug.json`.
- Timeline UI and styling remain unchanged.
