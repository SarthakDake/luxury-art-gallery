<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product context — Colors N Joy (always apply)

This site belongs to an **artist** who uses it to **showcase her work** and run **shop options** (buy art, commissions, trade/designer inquiries). The artist is the primary operator: she **uploads content** and **customizes the site** through **Content Studio** (`/admin/content`), not by editing code or running CLI tools.

When changing anything, optimize for:

- **Public storefront first** — home, Signature Wall Art, shop, product detail, trade page, about/contact must stay polished, fast, and trustworthy for collectors and designers.
- **Artist-owned content** — artworks, hero, brand colors, copy, PDFs, and images live in **Postgres + Vercel Blob** (production). Never delete Blob objects or DB content to “fix” bugs; preserve uploads and paths unless the artist explicitly asks to remove something.
- **Content Studio UX** — uploads (including iPhone HEIC), save feedback, previews (Signature/Trade/artwork steps), and clear errors matter as much as code correctness. Prefer fixes that work when the artist clicks Save/Upload on production.
- **Showcase + commerce** — balance gallery presentation (Signature collection, trade portfolio) with cart/checkout; don’t treat it as a generic SaaS admin panel.
- **Low surprise for the client** — avoid changes that require constant developer login, paid add-ons, or heavy Vercel usage (see lite smoke tests and monitoring in `DEPLOY.md`).

If a tradeoff exists between developer convenience and the artist’s ability to run the site alone, **choose the artist**.

## Cursor Cloud specific instructions

"Colors N Joy" is a single Next.js 16 (Turbopack) storefront app backed by PostgreSQL via Prisma 7. There are no separate services; the whole product (storefront, cart, admin CMS, API routes) runs from one dev server. Standard commands live in `package.json` (`dev`, `lint`, `build:local`, `db:*`) and setup details are in `DEPLOY.md`.

Non-obvious caveats for this environment:

- A local PostgreSQL 16 server is installed but must be started each session before running the app: `sudo pg_ctlcluster 16 main start`. The database `colorsnjoy` (user/password `postgres`/`postgres`) already exists.
- A local `.env` (gitignored) provides `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` (`http://localhost:3001`), and `ADMIN_EMAIL`. If it is missing, recreate it before running anything (Prisma and the app read `DATABASE_URL` from it).
- The dev server runs on port **3001**, not 3000 (`npm run dev`). `predev` auto-runs `prisma db push` and `dev` runs `prisma generate`, so a running Postgres + valid `.env` is enough to boot.
- The `db:*` scripts (e.g. `db:seed-content`) load env via `scripts/pg-connection.mjs`, which reads `process.env.DATABASE_URL` directly and does NOT load `.env`. Run them with the var inline, e.g. `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/colorsnjoy" npm run db:seed-content`.
- Auth requires real Google OAuth or SMTP email credentials, so interactive sign-in / admin / profile flows cannot be exercised locally without secrets. The public storefront (home, shop, product, cart, WhatsApp checkout) works fully without login and is the best path for local testing.
- Some seeded artworks reference images not present in local `public/`, so a few product thumbnails render broken locally. This is a content/data artifact, not a setup problem.
