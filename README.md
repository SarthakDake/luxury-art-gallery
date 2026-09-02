# Colors N Joy — Luxury Art Gallery

A full-stack art gallery e-commerce platform built with Next.js (App Router), PostgreSQL/Prisma, and NextAuth. It lets an artist showcase and sell artworks online, manage inventory through a built-in CMS ("Content Studio"), and accept payments via Razorpay, PhonePe, or a WhatsApp-based manual checkout.

> **Note on Next.js version:** this project pins `next@16`, which introduces breaking changes relative to older Next.js releases. If you're unsure whether an API still exists, check `node_modules/next/dist/docs/` before relying on training-data knowledge of Next.js.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started (local development)](#getting-started-local-development)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Database & content model](#database--content-model)
- [Payments](#payments)
- [Authentication & roles](#authentication--roles)
- [Content Studio (admin CMS)](#content-studio-admin-cms)
- [Deploying to production](#deploying-to-production)
- [Troubleshooting](#troubleshooting)

## Features

- **Storefront** — home, shop (with category/subcategory filters), individual artwork pages with image gallery, size selector, and videos.
- **Cart & checkout** — persistent cart (Zustand + localStorage), promo codes, and three checkout paths: Razorpay, PhonePe, and a WhatsApp-based manual order flow.
- **Accounts** — Google OAuth or email magic-link sign-in via NextAuth; customers see their order history on `/profile`.
- **Admin dashboard** — order management (`/admin/orders`) and a full content management system (`/admin/content`) for editing artworks, site configuration, and the artist's profile without touching code.
- **B2B / trade** — a dedicated page and inquiry flow for interior designers, plus a "Signature Wall Art" custom-commission collection.
- **Operational tooling** — Sentry error tracking, Upstash-backed rate limiting, Vercel Analytics/Speed Insights, and automatic content mirroring to Vercel Blob and (optionally) GitHub.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database / ORM | PostgreSQL via Prisma 7 |
| Auth | NextAuth 4 (Google OAuth + email), Prisma Adapter, JWT sessions |
| Payments | Razorpay, PhonePe (`@phonepe-pg/pg-sdk-node`), WhatsApp deep links |
| State | Zustand (cart), React Context providers (session, site config, artworks, theme) |
| Storage | Vercel Blob (production image uploads), local filesystem (dev) |
| Email | Nodemailer over SMTP |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Monitoring | Sentry, Vercel Analytics, Vercel Speed Insights |
| Image processing | `sharp`, `heic-decode` / `libheif-js` (HEIC/HEIF support) |

## Project structure

```
├── prisma/
│   ├── schema.prisma        # Data models: User, Order, OrderItem, SiteContent, ...
│   └── migrations/          # Prisma migration history
├── scripts/                 # Node scripts run outside the Next.js server
│   ├── vercel-build.mjs     # Production build entrypoint (runs migrations)
│   ├── db-baseline.mjs      # Baselines Prisma migration history (fixes P3005)
│   ├── seed-site-content.mjs
│   ├── sync-site-content.mjs
│   └── promote-admin.mjs
├── src/
│   ├── app/                 # Next.js App Router: pages + API routes
│   │   ├── (storefront pages: page.tsx, shop/, art/[slug]/, cart/, profile/, ...)
│   │   ├── admin/           # Admin dashboard (orders, content studio)
│   │   └── api/             # Route handlers (checkout, auth, content CMS, webhooks, ...)
│   ├── components/          # React components, grouped by feature area
│   ├── lib/                 # Business logic: auth, payments, site-data, mailer, etc.
│   ├── hooks/                # Shared React hooks
│   ├── data/                 # Bundled JSON content (artworks.json, config.json, profile.json)
│   └── types/                # Shared TypeScript types
├── data/                     # Runtime data (e.g. visitor-count.json fallback)
├── public/                   # Static assets (images, videos)
├── middleware.ts             # Route protection for /profile, /admin, some /api routes
├── next.config.ts            # Security headers, image domains, redirects
└── DEPLOY.md                  # Deep-dive production deployment guide
```

## Prerequisites

- **Node.js 20+**
- **A PostgreSQL database** (local Postgres, [Neon](https://neon.tech), [Supabase](https://supabase.com), Railway, Prisma Postgres, etc.)
- npm (the lockfile is `package-lock.json`)

## Getting started (local development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# then edit .env — at minimum set DATABASE_URL and NEXTAUTH_SECRET

# 3. Start the dev server
npm run dev
```

`npm run dev` runs `prisma db push` (syncs your database schema) and `prisma generate` before starting Next.js on **http://localhost:3001**.

The app works with just `DATABASE_URL` and `NEXTAUTH_SECRET` set — payments, email, and file uploads are optional and degrade gracefully (e.g. local image uploads write to `public/` when Vercel Blob isn't configured; Google sign-in is simply unavailable without OAuth credentials).

## Environment variables

All variables are documented inline in [`.env.example`](.env.example). Summary:

| Category | Required? | Variables |
|---|---|---|
| Database | **Required** | `DATABASE_URL` |
| Session security | **Required** | `NEXTAUTH_SECRET` |
| App URL | Required in production | `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` |
| Admin access | Recommended | `ADMIN_EMAIL` |
| Google sign-in | Optional | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Email magic-link sign-in | Optional | `EMAIL_SERVER`, `EMAIL_FROM` |
| Transactional email | Optional | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| Image uploads | Required on Vercel | `BLOB_READ_WRITE_TOKEN` |
| Content → GitHub sync | Optional | `GITHUB_CONTENT_SYNC`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` |
| Razorpay | Optional | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| PhonePe | Optional | `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`, `PHONEPE_ENV` |
| Rate limiting | Recommended in production | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Error tracking | Optional | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` |

See [DEPLOY.md](DEPLOY.md) for the production-specific details (Google OAuth redirect URIs, Vercel Blob setup, etc).

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Push schema + generate Prisma client + start dev server on port 3001 |
| `npm run build` | Production build via `scripts/vercel-build.mjs` (runs migrations when `CI`/`VERCEL` env is set) |
| `npm run build:local` | Production build without running migrations |
| `npm start` | Start the production server (after `build`) |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema to the database without a migration (dev only) |
| `npm run db:migrate` | Create and apply a new Prisma migration (dev) |
| `npm run db:deploy` | Apply pending migrations to a target database (production) |
| `npm run db:baseline` | Mark an existing (non-empty) database as the migration baseline — fixes Prisma error P3005 |
| `npm run db:seed-content` | Seed `SiteContent` (artworks/config/profile) from the bundled JSON in `src/data/` |
| `npm run db:sync-content` | Pull production `SiteContent` from the database into local `src/data/*.json` |
| `npm run db:sync-content:blob` | Same, but pulls from Vercel Blob instead of the database |
| `npm run db:promote-admin` | Promote the email(s) in `ADMIN_EMAIL` / Site Settings to the `ADMIN` role |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

## Database & content model

The schema (`prisma/schema.prisma`) has two kinds of data:

1. **Transactional data** — `User`, `Account`, `Session`, `VerificationToken` (NextAuth), and `Order` / `OrderItem` (purchases). Standard relational tables.
2. **CMS content** — a single `SiteContent` table keyed by name (`artworks`, `config`, `profile`), storing arbitrary JSON. This is what the admin Content Studio reads and writes.

On first deploy, `SiteContent` is seeded from the JSON files bundled in `src/data/` (`artworks.json`, `config.json`, `profile.json`) if no rows exist yet — existing production content is never overwritten by a redeploy.

Every Content Studio save also mirrors the JSON to:
- `src/data/*.json` on disk (local dev only — Vercel's filesystem is read-only)
- Vercel Blob, if `BLOB_READ_WRITE_TOKEN` is set
- your GitHub repo, if `GITHUB_CONTENT_SYNC=true` is set

See [`src/lib/content-json-mirror.ts`](src/lib/content-json-mirror.ts) and the "Content Studio" section of [DEPLOY.md](DEPLOY.md) for details.

## Payments

Three checkout paths are wired through [`src/lib/payments/gateway.ts`](src/lib/payments/gateway.ts):

- **Razorpay** — cards/UPI/netbanking. Order created server-side (`/api/checkout`), verified via signature check in `/api/verifyOrder`.
- **PhonePe** — UPI/wallets via the official Node SDK. Payment status confirmed via `/api/phonepe/callback` and `/api/phonepe/webhook`.
- **WhatsApp checkout** — a fallback that builds a pre-filled WhatsApp message so a customer can complete an order manually when no payment gateway is configured (see [`src/lib/whatsapp-checkout.ts`](src/lib/whatsapp-checkout.ts)).

Both gateways are optional — the storefront hides a payment method if its environment variables are not configured.

## Authentication & roles

- NextAuth (`src/lib/auth.ts`) with **Google OAuth** and/or **email magic links**, JWT session strategy (30-day expiry), and the Prisma Adapter for persisting sessions/accounts.
- Two roles: `CUSTOMER` (default) and `ADMIN`. Emails listed in `ADMIN_EMAIL` (or Site Settings → Admin emails) are auto-promoted to `ADMIN` on sign-in.
- `middleware.ts` protects `/profile`, `/admin/**`, and admin-only `/api/**` routes, redirecting unauthenticated users to `/signin`.
- For local development without setting up Google OAuth, `ALLOW_LOCAL_ADMIN=true` enables a local-only admin bypass (`src/lib/local-admin-bypass.ts`) — it is hard-disabled whenever the app detects it's running on Vercel.

## Content Studio (admin CMS)

Sign in with an admin account and visit **`/admin/content`** to manage:

- **Artworks** — full inventory editor: images, sizes/pricing, videos, copy overrides.
- **Site Settings** — hero section, features, testimonials, offers, social links, contact details.
- **Artist Profile** — biography, portrait, exhibitions, press mentions.

See [DEPLOY.md](DEPLOY.md#content-studio-artist-cms) for how content is persisted and mirrored across environments.

## Deploying to production

See **[DEPLOY.md](DEPLOY.md)** for the full checklist: required environment variables, Google OAuth redirect URI setup for custom domains, Vercel Blob configuration, and troubleshooting for common migration/OAuth errors.

Quick version for Vercel:

1. Import the repo, framework preset **Next.js**.
2. Set environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, plus any optional ones you need) for Production (and Preview if desired).
3. Deploy — `scripts/vercel-build.mjs` automatically runs Prisma migrations (and baselines an existing `db push`-created database if needed).
4. Sign in with an `ADMIN_EMAIL` Google account, or run `npm run db:promote-admin` against the production database.

## Troubleshooting

| Symptom | Likely fix |
|---|---|
| `next dev` fails to connect to the database | Check `DATABASE_URL` is reachable and the database exists |
| Google sign-in redirects to an error page | See the OAuth section in [DEPLOY.md](DEPLOY.md) — `NEXTAUTH_URL` must exactly match the domain used in the browser |
| Prisma migration fails with `P3005` | Run `npm run db:baseline` once against that database |
| Uploaded images don't appear in production | Connect Vercel Blob and redeploy — serverless functions can't write to `public/` |
| Rate limiting behaves inconsistently in production | Configure `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` |

For more, see the [Troubleshooting table in DEPLOY.md](DEPLOY.md#troubleshooting).
