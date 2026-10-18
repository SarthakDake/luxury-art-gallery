#!/usr/bin/env node
/**
 * Read-only production smoke test (no auth, no writes).
 *
 *   BASE_URL=https://www.colorsnjoy.com node scripts/smoke-production.mjs
 */
const base = (process.env.BASE_URL ?? "https://www.colorsnjoy.com").replace(/\/$/, "");

const checks = [
  { name: "Homepage", url: `${base}/`, expect: 200 },
  { name: "Shop", url: `${base}/shop`, expect: 200 },
  { name: "Site config API", url: `${base}/api/site/config`, expect: 200 },
  { name: "Artworks API", url: `${base}/api/site/artworks`, expect: 200 },
  {
    name: "Sample bundled image (trade teaser)",
    url: `${base}/api/artwork-image/site/trade-teaser-1.jpg`,
    expect: 200,
  },
  {
    name: "Trade PDF",
    url: `${base}/api/site-document/documents/designer-portfolio.pdf`,
    expect: 200,
  },
];

async function runCheck(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(check.url, {
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
  console.log(`[smoke] Base URL: ${base}\n`);

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
}

main();
