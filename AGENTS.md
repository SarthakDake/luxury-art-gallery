<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

"Colors N Joy" is a single Next.js 16 (Turbopack) storefront app backed by PostgreSQL via Prisma 7. There are no separate services; the whole product (storefront, cart, admin CMS, API routes) runs from one dev server. Standard commands live in `package.json` (`dev`, `lint`, `build:local`, `db:*`) and setup details are in `DEPLOY.md`.

Non-obvious caveats for this environment:

- A local PostgreSQL 16 server is installed but must be started each session before running the app: `sudo pg_ctlcluster 16 main start`. The database `colorsnjoy` (user/password `postgres`/`postgres`) already exists.
- A local `.env` (gitignored) provides `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` (`http://localhost:3001`), and `ADMIN_EMAIL`. If it is missing, recreate it before running anything (Prisma and the app read `DATABASE_URL` from it).
- The dev server runs on port **3001**, not 3000 (`npm run dev`). `predev` auto-runs `prisma db push` and `dev` runs `prisma generate`, so a running Postgres + valid `.env` is enough to boot.
- The `db:*` scripts (e.g. `db:seed-content`) load env via `scripts/pg-connection.mjs`, which reads `process.env.DATABASE_URL` directly and does NOT load `.env`. Run them with the var inline, e.g. `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/colorsnjoy" npm run db:seed-content`.
- Auth requires real Google OAuth or SMTP email credentials, so interactive sign-in / admin / profile flows cannot be exercised locally without secrets. The public storefront (home, shop, product, cart, WhatsApp checkout) works fully without login and is the best path for local testing.
- Some seeded artworks reference images not present in local `public/`, so a few product thumbnails render broken locally. This is a content/data artifact, not a setup problem.
