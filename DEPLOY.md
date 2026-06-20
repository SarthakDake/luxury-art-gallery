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
| `NEXTAUTH_URL` | Production URL, e.g. `https://yourdomain.com` (recommended; Vercel can auto-detect previews) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `ADMIN_EMAIL` | Email promoted to admin on sign-in |

Generate a secret:

```bash
openssl rand -base64 32
```

## Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/) → OAuth client → **Authorized redirect URIs**, add:

- `https://yourdomain.com/api/auth/callback/google`
- `https://your-vercel-preview.vercel.app/api/auth/callback/google` (if using preview deploys)

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
4. Deploy — the build script runs `prisma migrate deploy` automatically when `VERCEL=1` and `DATABASE_URL` is set.
5. Sign in with Google using `ADMIN_EMAIL`, or run locally:
   ```bash
   DATABASE_URL="…" ADMIN_EMAIL="you@gmail.com" npm run db:promote-admin
   ```

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
| Google OAuth redirect error | Add exact callback URL in Google Console; set `NEXTAUTH_URL` |
| Rate limits feel inconsistent | Add Upstash Redis env vars |
| `migrate deploy` fails on existing DB | Baseline with `npx prisma migrate resolve --applied <migration_name>`, then redeploy |

## Local development

```bash
cp .env.example .env   # fill in values
npm run dev            # runs db push + prisma generate + next dev on :3001
```
