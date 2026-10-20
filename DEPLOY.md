# Deployment checklist

Colors N Joy is a standard Next.js app with PostgreSQL (Prisma), NextAuth, and optional Razorpay / PhonePe / SMTP. It runs on **Vercel**, **Railway**, **Render**, Docker, or any Node 20+ host.

## Before first deploy

- [ ] **PostgreSQL database** — Prisma Postgres, Neon, Supabase, Railway, etc.
- [ ] **Run migrations once** against production (if the CI build has not run yet):
  ```bash
  DATABASE_URL="postgresql://…" npm run db:deploy
  ```
- [ ] Copy `.env.example` → set all required variables on the host (see below).

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (**required**) |
| `NEXTAUTH_SECRET` | Random secret for sessions (**required**) |
| `NEXTAUTH_URL` | **Your live domain**, e.g. `https://colorsnjoy.com` — must match the URL in the browser (see Google OAuth below) |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` (used for checkout redirects) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `ADMIN_EMAIL` | Admin sign-in email(s) only — comma-separated (not used for public contact) |
| `CONTACT_EMAIL` | Optional override for public contact / notification email(s) — comma-separated |
| `BLOB_READ_WRITE_TOKEN` | **Required on Vercel** for Content Studio image uploads (auto-set when you connect a Blob store) |

Generate a secret:

```bash
openssl rand -base64 32
```

## Google OAuth (production + custom domain)

`redirect_uri_mismatch` means Google received a callback URL that is **not listed** in your OAuth client. With **Cloudflare DNS + Vercel**, the app must use your **custom domain**, not `*.vercel.app`.

### Step 1 — Vercel custom domain

1. Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `colorsnjoy.com` and optionally `www.colorsnjoy.com`)
3. In **Cloudflare DNS**, point the domain to Vercel (CNAME to `cname.vercel-dns.com` or the records Vercel shows)
4. SSL in Cloudflare: **Full (strict)** is recommended once Vercel has issued a certificate

### Step 2 — Vercel environment variables (Production)

Set both to the **exact URL visitors use** (pick one canonical form — with or without `www`):

```bash
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Do **not** use `https://something.vercel.app` if users sign in on your custom domain.

Redeploy after changing env vars.

### Step 3 — Google Cloud Console

[Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your **OAuth 2.0 Client ID** (Web application).

**Authorized JavaScript origins** (no trailing slash):

- `https://your-domain.com`
- `https://www.your-domain.com` (only if you use www)

**Authorized redirect URIs** (exact path, no trailing slash):

- `https://your-domain.com/api/auth/callback/google`
- `https://www.your-domain.com/api/auth/callback/google` (only if you use www)

If you test on Vercel preview deploys, also add:

- `https://your-project.vercel.app/api/auth/callback/google`

You can **keep** `*.vercel.app` entries in Google Console for preview/testing, or **remove** them if you only ever sign in on your custom domain. Production sign-in only needs your custom domain URLs.

### Step 4 — Verify after deploy

Use curl (browser visits to `/api/*` redirect to the home page):

```bash
curl -s https://your-domain.com/api/oauth-config
```

You should see JSON with `googleCallbackUrl`. That exact value must appear in Google Console redirect URIs.

### Step 5 — Sign in again

Use **Sign in with Google** on your live domain. Both admin emails must sign in once (or run `npm run db:promote-admin`).

## Recommended (production)

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting across serverless instances |
| `SMTP_*` | Contact form & order emails |
| `RAZORPAY_*` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Card checkout |
| `PHONEPE_*` | PhonePe checkout |

Without Upstash, rate limits use in-memory storage and are **not reliable** on Vercel/serverless.

### Email (SMTP) vs admin login

- **`ADMIN_EMAIL`** / Site Settings **Admin emails** — who gets **Google admin sign-in** and the admin role. This does **not** send mail by itself.
- **`SMTP_USER` / `SMTP_PASS` / `SMTP_HOST`** — when set, the app sends **contact**, **trade enquiry**, and **paid order** notifications. The **From** address is `SMTP_FROM` if set, otherwise the **contact** mailbox (`CONTACT_EMAIL` / Site Settings contact email), **not** your admin Gmail unless you put it in `SMTP_USER` or `SMTP_FROM`.
- **`EMAIL_SERVER` + `EMAIL_FROM`** — optional NextAuth **magic-link** sign-in. Remove these env vars if you only use Google OAuth and do not want magic-link emails.
- To stop outbound mail entirely: remove `SMTP_*` (and `EMAIL_*`) from Vercel Production — forms/checkout will log errors instead of sending.

### Staying on free tiers (typical stack)

| Service | Required? | Free-tier note |
|---------|-----------|----------------|
| **Vercel** (hosting) | Yes | Hobby tier; watch bandwidth and serverless invocations |
| **Postgres** (Neon / Supabase / Vercel Postgres) | Yes | Use provider free tier; store **content JSON** only |
| **Vercel Blob** | Yes for CMS uploads on Vercel | Free allowance; images stay in Blob — do not “clean” Blob to fix DB |
| **Google OAuth** | For admin sign-in | Free |
| **Upstash Redis** | Optional | Omit env vars to skip (rate limits fail open) |
| **Sentry** | Optional | Omit `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` to disable |
| **Vercel Analytics / Speed Insights** | Optional | Loaded only after cookie consent; remove component if unwanted |
| **Razorpay / PhonePe** | Optional | Pay per transaction; omit keys to disable card checkout |
| **SMTP (Gmail)** | Optional | Uses your Gmail **App Password** quota when configured |

## Vercel

1. Import the repo → framework preset **Next.js**.
2. Add env vars under **Settings → Environment Variables** (Production + Preview as needed).
3. Ensure `DATABASE_URL` is available at **build time** (same env scope as Production).
4. Deploy — the build script runs migrations automatically when `VERCEL=1` and `DATABASE_URL` is set. If the database was previously synced with `db push`, the build will **baseline** migration history (Prisma P3005) and apply any pending migrations.
5. Sign in with Google using an `ADMIN_EMAIL`, or run locally:
   ```bash
   DATABASE_URL="…" npm run db:promote-admin
   ```
   This promotes every email listed under **Admin emails** in Site Settings, or in `ADMIN_EMAIL` (comma-separated).

Default build command: `npm run build` (uses `scripts/vercel-build.mjs`).

Local production build **without** migrations:

```bash
npm run build:local
```

## Other platforms (Railway, Render, Docker, etc.)

1. Set the same env vars as above.
2. Build command: `npm run build` (set `CI=1` or rely on platform CI env so migrations run).
3. Start command: `npm start`
4. Optional release step before start: `npm run db:deploy`

## After deploy — smoke test

Run from your laptop after a deploy (read-only, no login). **Default is lite mode** — one homepage request plus static CDN files, not repeated API/image lambdas:

```bash
BASE_URL=https://www.your-domain.com npm run smoke:production
```

Optional deeper check (more Vercel invocations — use only when debugging, not on a cron):

```bash
BASE_URL=https://www.your-domain.com npm run smoke:production:full
```

**Do not** run smoke tests on a Vercel Cron or every few minutes from an external monitor hitting `/api/*` — that burns serverless quota.

Manual checklist:

- [ ] Home, shop, product pages load (images not broken — `curl -I https://www.your-domain.com/api/artwork-image/site/trade-teaser-1.jpg` should be **200**)
- [ ] Open **one HEIC product** (if any) or a recently edited artwork — cover image visible
- [ ] Google sign-in → `/profile` works
- [ ] Admin user sees dashboard icon → `/admin/orders`
- [ ] Cart, promo code, WhatsApp checkout
- [ ] Contact form (if SMTP configured)

If production CMS JSON still contains legacy **inquiry** keys or copy from before the enquiry rename, run once against Production Postgres (with `DATABASE_URL` set):

`npm run db:migrate-enquiry-spelling`

This rewrites `SiteContent.config` to the normalized **enquiry** shape. It is safe to run more than once.

## Keeping production healthy (client ops)

You should **not** need to log into Content Studio to know the site is up. Set up checks once, then only act when something alerts you.

### One-time server setup (Vercel)

Confirm in **Project → Settings**:

| Item | Why it matters |
|------|----------------|
| **Domains** — `www.colorsnjoy.com` (and apex redirect) | Wrong host breaks OAuth and image fallbacks |
| **Environment variables (Production)** — `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` (all use the **same** `https://www.…` URL visitors use) | Mismatch causes login loops and broken `/api/artwork-image` fallbacks |
| **Storage → Blob** connected; `BLOB_READ_WRITE_TOKEN` on Production | Without Blob, CMS uploads cannot persist on Vercel |
| **Deployments** — Production tracks `main`; failed builds email you from Vercel | A green deploy after merge is required for code fixes to go live |

Do **not** delete Blob objects or “reset” Postgres to fix images — that removes client uploads.

### External monitoring (free, low Vercel cost)

Use any uptime service (e.g. [UptimeRobot](https://uptimerobot.com/) free tier) with **10–15 minute** intervals (not 1–5 min — each check is a serverless invocation on HTML routes).

**Monitor these only (2 URLs):**

1. `https://www.your-domain.com/` — homepage (SSR; also exercises DB via layout)  
2. `https://www.your-domain.com/site/trade-teaser-1.jpg` — **static CDN** file (cheap; confirms deploy assets exist)

Avoid pointing uptime bots at `/api/*` or `/api/artwork-image/*` on a schedule — they run Node/Blob work every ping and add cost.

After deploy, run **`npm run smoke:production`** once from your machine. Use **`smoke:production:full`** only when investigating image/API issues.

Alert **email** when a check fails 2× in a row.

### After every deploy (2 minutes)

1. Vercel dashboard → latest Production deployment → **Ready** (not Error).  
2. `BASE_URL=https://www.your-domain.com npm run smoke:production`  
3. Quick visual: homepage hero + shop grid thumbnails.

### Monthly (or after bulk CMS edits)

1. **Blob audit** (read-only; lists missing files, deletes nothing). Runs against **Postgres + Blob API from your laptop** — it does **not** call your Vercel site, so it does not add serverless invocations. Use **monthly**, not daily:

   ```bash
   DATABASE_URL="…" BLOB_READ_WRITE_TOKEN="…" npm run blob:audit-images
   ```

   If paths are missing → re-upload those artworks in Content Studio and **Save**.

2. Vercel **Usage** tab — stay within Hobby/Blob/Postgres free limits (bandwidth, function invocations, Blob storage).

3. Skim **Vercel → Logs** for repeated `[artwork-image]` or `[upload]` errors.

### Content Studio habits (prevent image regressions)

- Always wait for **“Successfully uploaded …”** before **Save**.  
- After uploading HEIC/iPhone photos on production, confirm the product page shows the cover (HEIC now also stores a WebP delivery copy in Blob).  
- Prefer editing content on **production** with Blob connected, or sync JSON **and** ensure images exist in Blob — JSON alone does not copy binary files.  
- Use **Preview** on Signature / Trade sections before publishing large homepage changes.

### When something breaks — order of checks

1. Run `npm run smoke:production` — which layer failed (HTML vs API vs images)?  
2. Vercel deployment status — did the last deploy fail?  
3. If only some product images: `npm run blob:audit-images` → re-upload missing covers (DB is usually fine).  
4. If login broke: `NEXTAUTH_URL` / Google OAuth URLs vs actual domain.  
5. Only then sign into Content Studio or admin.

### What “normal usage” should not break

- Browsing, cart, WhatsApp checkout — no admin login required.  
- Public traffic and rate limits — optional Upstash; app fails open if Redis is absent.  
- Analytics — only loads after cookie consent.

Paying services (Razorpay, PhonePe, SMTP, Sentry, Upstash) are **optional** — omit env vars to disable them and avoid charges.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Profile/login crashes after sign-in | Production DB missing columns — run `npm run db:deploy` |
| Build fails with **P3005** (schema not empty) | Database was created with `db push`. Redeploy — the build auto-baselines. Or run manually: `DATABASE_URL="…" npm run db:baseline` |
| Google OAuth **redirect_uri_mismatch** | Set `NEXTAUTH_URL` + `NEXT_PUBLIC_APP_URL` to your **custom domain** (not `*.vercel.app`). Add the exact callback from `/api/oauth-config` in Google Console. Wait 1–2 min after saving Google settings. |
| Google OAuth redirect error (other) | Check JavaScript origins + redirect URIs match `https` and your domain exactly |
| Storefront images missing / `/_next/image` **400** | Redeploy latest `main`. `/api/artwork-image` needs Node.js runtime, Vercel Blob for CMS uploads, and `NEXT_PUBLIC_APP_URL=https://www.your-domain.com` so static fallbacks resolve. DB holds JSON only — images live in **Blob** (+ git `public/` for bundled assets). **Never delete Blob objects to “fix” the DB.** |
| HEIC product images 404 (`/api/artwork-image/...heic`) | The DB path exists but the **Blob object was never stored** (common if uploads happened off-production). Re-upload cover + gallery in Content Studio, then **Save**. Run `npm run blob:audit-images` with production env to list missing paths. JPG/PNG uploads that return 200 confirm Blob is wired correctly. |
| Rate limits feel inconsistent | Add Upstash Redis env vars |
| `migrate deploy` fails on existing DB | Run `npm run db:baseline` once against production |
| Turbopack build fails on `next/font/google` (`@vercel/turbopack-next/internal/font/google/font`) | Production builds use **`next build --webpack`** (see `scripts/vercel-build.mjs`). Dev can stay on Turbopack (`next dev`). |

## Content Studio (artist CMS)

Admin-only page: **`/admin/content`** (sign in with your admin Google account).

- **Artworks** — full inventory editor with image uploads, sizes, videos, and product copy overrides
- **Site Settings** — everything in `config.json` (hero, contact, offers, social links, etc.)
- **Artist Profile** — biography, portrait, exhibitions, and press

Changes are stored in **PostgreSQL** (`SiteContent` table) when `DATABASE_URL` is set. Uploaded images go to `public/` (local) or **Vercel Blob** (production).

**JSON mirror (automatic on every save):**

| Environment | `src/data/*.json` on disk | Blob JSON copy | Git repo JSON (optional) |
|-------------|---------------------------|----------------|--------------------------|
| Local dev | Yes | Yes (if Blob connected) | Yes (if GitHub sync enabled) |
| Vercel production | No (read-only FS) | **Yes** (if Blob connected) | Yes (if GitHub sync enabled) |

Production Content Studio saves always update PostgreSQL. If **Vercel Blob** is connected (`BLOB_READ_WRITE_TOKEN`), the same JSON is also written to:

- `site-content/artworks.json`
- `site-content/config.json`
- `site-content/profile.json`

**Optional — commit JSON to GitHub automatically:** Set these Vercel env vars to push `src/data/*.json` to your repo on every save (useful if production is your only CMS):

```bash
GITHUB_CONTENT_SYNC=true
GITHUB_TOKEN=ghp_…            # fine-grained PAT with Contents: Read and write
GITHUB_REPO=your-user/luxury-art-gallery   # or GITHUB_REPOSITORY
GITHUB_BRANCH=main            # optional; defaults to main or VERCEL_GIT_COMMIT_REF
```

After deploy, sign in as admin and open `/api/admin/content/sync-status` (or check the save bar in Content Studio) to confirm Blob/GitHub mirrors are configured.

If GitHub sync fails, the save banner will show the exact mirror error (for example token scope, branch name, or repo path).

**Pull production JSON to your machine:**

```bash
# From database (recommended)
DATABASE_URL="postgresql://…" npm run db:sync-content

# From Blob (no DB URL needed, only blob token)
BLOB_READ_WRITE_TOKEN="…" npm run db:sync-content:blob
```

**First deploy:** The build runs migrations and seeds `artworks`, `config`, and `profile` from the bundled JSON files if those rows do not exist yet. Existing production content is never overwritten on redeploy.

**Vercel image uploads:** Serverless deploys cannot write to `public/`. Connect Blob storage once:

1. Vercel → your project → **Storage** → **Create Database** → **Blob**
2. Name the store and **connect it to this project** (Vercel adds `BLOB_READ_WRITE_TOKEN` automatically)
3. **Redeploy** production

Uploaded images are stored in Blob and saved as full URLs in your artwork/profile data. Local dev (`npm run dev`) still writes to `public/` when Blob is not configured.

**Manual seed** (optional, if content is missing after migration):

```bash
DATABASE_URL="postgresql://…" npm run db:seed-content
```

```bash
cp .env.example .env   # fill in values
npm run dev            # runs db push + prisma generate + next dev on :3001
```

## Search engine optimization (SEO)

Technical SEO is built into the storefront (sitemap, canonical URLs, Open Graph, JSON-LD). Rankings still depend on content, backlinks, and competition — use this checklist after deploy.

### Canonical domain

Set **Production** env vars to the URL visitors use (with or without `www`, but pick one):

```bash
NEXTAUTH_URL=https://www.colorsnjoy.com
NEXT_PUBLIC_APP_URL=https://www.colorsnjoy.com
```

Add a **redirect** in Vercel so the non-canonical host (e.g. bare domain → `www`) always resolves to one URL.

### Content Studio → Site settings → Search & social (SEO)

- **Default meta description** — plain text for Google (or leave empty to use the hero subtitle).
- **Default keywords** — comma-separated topics (texture art, wall art, your city, hospitality art, etc.).
- **Default share image** — Open Graph image for social link previews.
- **Per-page overrides** — title, description, and keywords for Home, Shop, About, Contact, Signature Wall Art, and For Interior Designers.
- **Google Search Console verification** — paste the verification *content* string from Google, or set `GOOGLE_SITE_VERIFICATION` on Vercel.

After editing, **Save** in Content Studio so production metadata revalidates.

### Google Search Console

1. [Google Search Console](https://search.google.com/search-console) → add property for your domain.
2. Verify via the HTML tag (Content Studio field or `GOOGLE_SITE_VERIFICATION` env).
3. Submit sitemap: `https://www.colorsnjoy.com/sitemap.xml`
4. Review **Pages** and **Performance** after a few days; fix any indexing errors.

### Google Business Profile (local discovery)

If you serve clients in a region, maintain a complete **Google Business Profile** (name, address matching `studioAddress`, phone/WhatsApp, photos, services, website link).

### What the site emits automatically

- `/robots.txt` — allows public pages; blocks `/admin/` and `/api/`.
- `/sitemap.xml` — static routes, every shop artwork, and every Signature Wall Art project slug.
- **JSON-LD** — `WebSite`, `Organization` / `ArtGallery`, `Person` (artist), `Product` (shop items), `Service` (signature + trade pages).
- **Canonical URLs** on main routes and product pages.
