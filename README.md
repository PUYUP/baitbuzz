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
   - `DATABASE_URL` — Supabase **session pooler** string (port `5432`, not `6543`)
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
   - `PUBLIC_SITE_URL` — `https://baitbuzz.com` (or `https://<frontend>.vercel.app`)
3. Custom domain (optional): `baitbuzz.com` + `www.baitbuzz.com` → this project.
3. `vite.config.ts` automatically uses `@sveltejs/adapter-vercel` when `VERCEL=1` (set by Vercel at build time) and `@sveltejs/adapter-node` for local production builds.

### Notes

- Requires Node.js >= 22.23 (Payload 3.93 supports `^22.23.4 || >=24.22.1`). Vercel's default Node version may need to be set to 22.x or 24.x in Project Settings → General.
- Serverless + Supabase: the session pooler (port 5432) works with Payload's prepared statements; each function instance manages its own pooled connections.
