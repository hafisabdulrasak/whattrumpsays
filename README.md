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

Install truthbrush:

```bash
pip install truthbrush
```

Sync cached Truth Social posts into `data/posts.json`:

```bash
npm run sync
```

You can also trigger sync through the local API endpoint:

```bash
curl -X POST http://localhost:3000/api/sync
```

> This uses public Truth Social data via truthbrush and may break if the source changes.

## Routes

- `/` — hero + latest timeline
- `/timeline` — full browsing experience
- `/post/[id]` — single-post detail view
- `/about` — methodology and source caveats
- `/api/posts` — cached posts feed endpoint with cursor pagination
- `/api/sync` — manually refresh cached posts by running Python ingestion

## Notes

- Data is read from `data/posts.json`.
- Timeline UI and styling are unchanged; only data plumbing is updated.
