# What Trump Says

A premium, dark-mode-first archival interface for browsing Donald J. Trump public posts in strict reverse chronology, with source provenance and timeline UX tuned for readability.

## Features

- **Reverse-chronological timeline** with newest-first ordering.
- **Infinite scroll** via cursor pagination (`/api/posts`).
- **Provider architecture** for source-specific ingestion adapters:
  - `TruthSocialProvider` (primary live-source integration point)
  - `TwitterArchiveProvider` (historical archive integration point)
- **Normalized Post model** used consistently by API + UI.
- **Source provenance badges** and original timestamps on every card.
- **Graceful source fallback states** shown in timeline status banner.
- **Search + filters** (source, date range, quick ranges).
- **Editorial dark UI** with animation, card depth, and premium spacing.
- **Fun analysis widgets**: volume meter, all-caps detector, longest post, on-this-day snapshots.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

## Routes

- `/` — hero + latest timeline
- `/timeline` — full browsing experience
- `/post/[id]` — single-post detail view
- `/about` — methodology and source caveats
- `/api/posts` — normalized merged feed endpoint
- `/api/sources/truth-social` — source adapter endpoint
- `/api/sources/twitter-archive` — source adapter endpoint

## Data model

`NormalizedPost` fields:

- `id`
- `text`
- `createdAt`
- `source`
- `sourceLabel`
- `sourceUrl`
- `authorName`
- `authorHandle`
- `media[]`
- `tags[]`
- `isArchive`
- `metadata`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create `.env.local` as needed.

```bash
# Placeholder for future live Truth Social ingestion endpoint
REAL_TRUTHSOCIAL_API_URL=

# Optional archive file URL or dataset path for production ingestion
TWITTER_ARCHIVE_DATA_URL=
```

> The current implementation ships with mock adapter payloads for development and demonstrates the ingestion architecture. It never claims fake live freshness.

## Build & deploy

### Production build

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables in Vercel project settings.
4. Deploy.

## Architecture notes

- `lib/providers/*` isolates source logic.
- `lib/ingestion.ts` merges, deduplicates, applies quick-ranges, caches, and paginates.
- `app/api/posts/route.ts` exposes normalized feed with cursor pagination.
- `components/TimelineFeed.tsx` handles infinite scroll + live filter query changes.

## Trust & provenance

- Every post displays source label and timestamp.
- Source availability state is surfaced to users.
- Content is displayed as sourced archival/public material without editorial rewrites.
