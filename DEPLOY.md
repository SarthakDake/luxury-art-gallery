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

- [ ] Home, shop, product pages load
- [ ] Google sign-in → `/profile` works
- [ ] Admin user sees dashboard icon → `/admin/orders`
- [ ] Cart, promo code, WhatsApp checkout
- [ ] Contact form (if SMTP configured)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Profile/login crashes after sign-in | Production DB missing columns — run `npm run db:deploy` |
| Build fails with **P3005** (schema not empty) | Database was created with `db push`. Redeploy — the build auto-baselines. Or run manually: `DATABASE_URL="…" npm run db:baseline` |
| Google OAuth **redirect_uri_mismatch** | Set `NEXTAUTH_URL` + `NEXT_PUBLIC_APP_URL` to your **custom domain** (not `*.vercel.app`). Add the exact callback from `/api/oauth-config` in Google Console. Wait 1–2 min after saving Google settings. |
| Google OAuth redirect error (other) | Check JavaScript origins + redirect URIs match `https` and your domain exactly |
| Rate limits feel inconsistent | Add Upstash Redis env vars |
| `migrate deploy` fails on existing DB | Run `npm run db:baseline` once against production |

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
