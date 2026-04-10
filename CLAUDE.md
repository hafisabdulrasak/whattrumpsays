# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npm run typecheck    # tsc --noEmit
npm run sync         # Fetch Truth Social posts via Python script
npm run debug:truthsocial  # Run Python script with debug flag
```

Python sync requires `truthbrush` installed (`pip install truthbrush`, Python 3.10+) and Truth Social credentials set as env vars (`TRUTHSOCIAL_TOKEN` or `TRUTHSOCIAL_USERNAME`+`TRUTHSOCIAL_PASSWORD`).

Diagnostics endpoint at `/api/debug/truthsocial` checks truthbrush installation, credentials, and sync health. Raw output on parse errors is written to `data/truthbrush-debug.json`.

## Architecture

This is a read-only archival interface for Trump's Truth Social posts. The key architectural pattern is **local-cache-first**: posts are never fetched live from Truth Social by the web server — all reads go through `data/posts.json`.

### Data Flow

```
Truth Social API
  → truthbrush CLI (external Python package)
  → scripts/fetch_truthsocial.py (normalize + atomic write)
  → data/posts.json
  → lib/ingestion.ts getMergedPosts() (30s Next.js cache revalidation)
  → app/api/posts/route.ts (cursor pagination)
  → components/TimelineFeed.tsx (IntersectionObserver infinite scroll)
```

### Key Non-Obvious Details

**Cursor pagination** (`lib/utils.ts`): Uses a `createdAt + id` tuple encoded as base64 to handle posts with identical timestamps. The `/api/posts` route decodes this to implement stateless, URL-safe pagination.

**Safe sync failure** (`app/api/sync/route.ts`): Before spawning the Python subprocess, the API reads the current post count. If the sync produces fewer posts than the existing cache, the old cache is preserved — failed syncs cannot overwrite good data.

**Atomic file writes** (`scripts/fetch_truthsocial.py`): Uses Python `NamedTemporaryFile` + `os.replace()` to prevent partial writes from corrupting `data/posts.json` if the process is interrupted.

**Ingestion normalization** (`scripts/fetch_truthsocial.py → normalize()`): Raw truthbrush output is converted to the `NormalizedPost` type defined in `lib/types.ts`. The Python script and TypeScript types must stay in sync.

**Zustand filter store** (`store/useTimelineStore.ts`): All filter state (search query, source, date range, quick filters like today/week/month/archive) lives here. `TimelineFeed` resets and refetches whenever filters change.

**Quick date filters** (`lib/utils.ts`): `getQuickFilterDateRange()` computes ISO date bounds server-side using `date-fns`. "Archive" means anything older than 1 month.

### Directory Layout (non-obvious parts)

- `lib/ingestion.ts` — `getMergedPosts()` is the single entry point for all post reads; wraps `data/posts.json` with Next.js `unstable_cache` (30s TTL)
- `lib/providers/` — Reserved for future multi-source support (e.g., Twitter/X)
- `data/` — Runtime-generated files (gitignored except the directory itself); never manually edit
- `scripts/truthsocial.credentials.local.json` — Gitignored local credentials fallback (see example file)

### Tailwind Theme

Dark mode uses the `class` strategy (toggled by `ThemeToggle`). Custom colors are `gold` and `crimson` defined in `tailwind.config.ts` — use these for brand-consistent accents rather than Tailwind defaults.
