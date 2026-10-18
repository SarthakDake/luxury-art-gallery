#!/usr/bin/env node
/**
 * Read-only production smoke test (no auth, no writes).
 *
 * Default (lite) minimizes Vercel serverless use — run this after deploys.
 * Full mode hits API/image routes; use only when debugging (SMOKE_FULL=1).
 *
 *   BASE_URL=https://www.colorsnjoy.com npm run smoke:production
 *   SMOKE_FULL=1 BASE_URL=https://www.colorsnjoy.com npm run smoke:production:full
 */
const base = (process.env.BASE_URL ?? "https://www.colorsnjoy.com").replace(/\/$/, "");
const full = process.env.SMOKE_FULL === "1" || process.env.SMOKE_FULL === "true";

/** CDN/static assets — no artwork-image lambda, minimal bandwidth. */
const liteChecks = [
  {
    name: "Homepage (SSR + DB in layout)",
    url: `${base}/`,
    expect: 200,
    method: "HEAD",
  },
  {
    name: "Static site image (CDN)",
    url: `${base}/site/trade-teaser-1.jpg`,
    expect: 200,
    method: "HEAD",
  },
  {
    name: "robots.txt (static)",
    url: `${base}/robots.txt`,
    expect: 200,
    method: "HEAD",
  },
];

/** Extra serverless routes — costs invocations; not for frequent cron use. */
const fullOnlyChecks = [
  { name: "Shop page", url: `${base}/shop`, expect: 200, method: "HEAD" },
  { name: "Site config API", url: `${base}/api/site/config`, expect: 200, method: "GET" },
  { name: "Artworks API", url: `${base}/api/site/artworks`, expect: 200, method: "GET" },
  {
    name: "Artwork-image API sample",
    url: `${base}/api/artwork-image/site/trade-teaser-1.jpg`,
    expect: 200,
    method: "HEAD",
  },
  {
    name: "Trade PDF (API route)",
    url: `${base}/api/site-document/documents/designer-portfolio.pdf`,
    expect: 200,
    method: "HEAD",
  },
];

const checks = full ? [...liteChecks, ...fullOnlyChecks] : liteChecks;

async function runCheck(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  const method = check.method ?? "GET";

  try {
    const response = await fetch(check.url, {
      method,
      signal: controller.signal,
      redirect: "follow",
    });
    const ok = response.status === check.expect;

    return {
      ...check,
      status: response.status,
      ok,
    };
  } catch (error) {
    return {
      ...check,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log(`[smoke] Base URL: ${base}`);
  console.log(`[smoke] Mode: ${full ? "full (uses extra serverless routes)" : "lite (low Vercel cost)"}\n`);

  const results = [];
  for (const check of checks) {
    const result = await runCheck(check);
    results.push(result);
    const mark = result.ok ? "OK" : "FAIL";
    const extra = result.error ? ` (${result.error})` : "";
    console.log(`[${mark}] ${result.name}: HTTP ${result.status}${extra}`);
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n[smoke] ${failed.length} check(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log("\n[smoke] All checks passed.");
  if (!full) {
    console.log("[smoke] Tip: SMOKE_FULL=1 for API/image-route checks (use sparingly).");
  }
}

main();
