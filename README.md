# BaitBuzz

An AI & technology media platform. Articles are synthesized by AI from collections of posts/replies across social platforms (X, Threads, Facebook, LinkedIn), then rewritten in our own words.

## Structure

- `backend/` — PayloadCMS 3 (Next.js 16). Stores raw social posts (X, Threads, Facebook, LinkedIn), topics (hashtags), articles, and standalone pages (About, Contact, etc.). Uses **Supabase Postgres** in production; falls back to local SQLite (`payload.db`) when `DATABASE_URL` is empty.
- `frontend/` — SvelteKit 3. Reader-facing site, SEO/GEO-ready (meta, OG, JSON-LD, RSS, sitemap, robots, llms.txt).

## Running

### Backend (http://localhost:3000)

```bash
cd backend
npm install
cp .env.example .env   # set PAYLOAD_SECRET
# optional: set DATABASE_URL to your Supabase Postgres connection string
npm run dev            # sqlite dev mode auto-pushes schema
```

To use **Supabase Postgres**: set `DATABASE_URL` in `.env` to your connection string (session pooler, port 5432 — not the transaction pooler on 6543), then run `npm run payload migrate` once to create the schema.

Admin panel: http://localhost:3000/admin — the first user is created via the login page (first-register).

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Ingest API (Chrome extension)

`POST /api/ingest/raw-posts` — bulk-insert raw posts without admin login.

- **Auth**: `Authorization: Bearer <INGEST_API_KEY>` or `x-api-key: <key>` header (`INGEST_API_KEY` env var; endpoint disabled when unset)
- **Body**: single post object, an array, or `{ "posts": [...] }` (max 100 per request)
- **Fields**: `platform` (`x`/`threads`/`facebook`/`linkedin`/`other`, default `x`), `externalId` (optional, dedupes), `authorHandle`, `authorName`, `text` (required), `sourceUrl` (required), `postedAt` (ISO, defaults to now), `isReply`, `parentId`, `synthesisStatus` (default `pending`), `raw` (original payload JSON)
- **Response**: `{ "created": n, "skipped": n, "errors": [{ "index": n, "error": "..." }] }` — posts whose `externalId` already exists are skipped

```bash
curl -X POST https://cms.baitbuzz.com/api/ingest/raw-posts \
  -H "Authorization: Bearer $INGEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"platform":"x","externalId":"123","text":"...","sourceUrl":"https://x.com/..."}]}'
```

## Content flow

1. Raw social posts are added to the **Raw Posts** collection (via admin UI or API).
2. The AI synthesis pipeline reads raw posts with `synthesisStatus: pending` and produces a Markdown article.
3. The article is saved to **Articles** with `status: published`, linked to **Topics** (hashtags) and **Sources** (raw posts).
4. Standalone **Pages** (About, Contact, …) are published at root-level URLs like `/about`.
5. The frontend fetches published content via the Payload REST API.

## Deployment (Vercel)

Deploy as **two separate Vercel projects** (monorepo — set *Root Directory* in each project's settings).

### Backend → Vercel

1. New Project → import repo → **Root Directory: `backend`** (framework: Next.js, auto-detected).
2. Environment variables:
   - `PAYLOAD_SECRET` — long random string
   - `DATABASE_URL` — Supabase **transaction pooler** string (port `6543`)
   - `PAYLOAD_PUBLIC_SERVER_URL` — `https://cms.baitbuzz.com`
   - `INGEST_API_KEY` — shared secret for `POST /api/ingest/raw-posts` (Chrome extension); leave empty to disable
   - `FRONTEND_REVALIDATE_URL` — `https://www.baitbuzz.com/api/revalidate`
   - `REVALIDATE_SECRET` — shared secret, must match the frontend value
3. Custom domain (optional but recommended): `cms.baitbuzz.com` → this project. Admin panel: `https://cms.baitbuzz.com/admin`
4. After the first deploy, run migrations against the production database once (from your machine):

   ```bash
   cd backend
   DATABASE_URL="postgresql://..." PAYLOAD_SECRET="..." npm run payload migrate
   ```

### Frontend → Vercel

1. New Project → import repo → **Root Directory: `frontend`** (framework: SvelteKit, auto-detected).
2. Environment variables:
   - `PUBLIC_PAYLOAD_API` — `https://cms.baitbuzz.com/api` (or `https://<backend>.vercel.app/api`)
   - `PUBLIC_SITE_URL` — `https://www.baitbuzz.com` (or `https://<frontend>.vercel.app`)
   - `PUBLIC_GA_ID` — optional Google Analytics 4 measurement ID (`G-XXXXXXX`); leave empty to disable
   - `REVALIDATE_SECRET` — shared secret for `POST /api/revalidate`; must match the backend value. The frontend caches Payload API responses for 60s; the backend calls this endpoint after content edits to bust the cache immediately.
3. Custom domain (optional): `baitbuzz.com` + `www.baitbuzz.com` → this project.
3. `vite.config.ts` automatically uses `@sveltejs/adapter-vercel` when `VERCEL=1` (set by Vercel at build time) and `@sveltejs/adapter-node` for local production builds.

### Notes

- Requires Node.js >= 22.23 (Payload 3.93 supports `^22.23.4 || >=24.22.1`). Vercel's default Node version may need to be set to 22.x or 24.x in Project Settings → General.
- Serverless + Supabase: the session pooler (port 5432) works with Payload's prepared statements; each function instance manages its own pooled connections.

## White-label: running a second site

The same codebase can power multiple sites with different content and branding. For a fully separate site (own articles, own CMS):

1. **New Supabase project** → get a new `DATABASE_URL` (transaction pooler, port 6543).
2. **New Vercel backend project** — same repo, Root Directory `backend`:
   - `PAYLOAD_SECRET` — new random string
   - `DATABASE_URL` — the new Supabase string
   - `PAYLOAD_PUBLIC_SERVER_URL` — e.g. `https://cms.site2.com`
   - `PAYLOAD_ALLOWED_ORIGINS` — comma-separated: `https://site2.com,https://www.site2.com,https://cms.site2.com`
   - `FRONTEND_REVALIDATE_URL` + `REVALIDATE_SECRET` — for the new frontend
   - `INGEST_API_KEY` — new key if the extension ingests for this site too
3. **Run migrations + seed** against the new DB from your machine:

   ```bash
   cd backend
   DATABASE_URL="postgresql://..." PAYLOAD_SECRET="..." npm run payload migrate
   DATABASE_URL="postgresql://..." PAYLOAD_SECRET="..." npm run seed
   ```

4. **New Vercel frontend project** — same repo, Root Directory `frontend`:
   - `PUBLIC_PAYLOAD_API` — `https://cms.site2.com/api`
   - `PUBLIC_SITE_URL` — `https://site2.com`
   - `PUBLIC_SITE_NAME` / `PUBLIC_SITE_TAGLINE` / `PUBLIC_SITE_DESCRIPTION` — the new brand
   - `REVALIDATE_SECRET` — same value as the new backend
5. Custom domains: `site2.com`/`www` → frontend project, `cms.site2.com` → backend project.

Design, layout and features stay identical — only content and identity differ.
