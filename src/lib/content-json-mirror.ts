// Fans out every Content Studio save to whichever mirrors are configured:
// the local JSON files (dev only — Vercel's production filesystem is
// read-only), Vercel Blob (durable off-DB backup), and optionally a GitHub
// repo (so content changes show up as commits). Each mirror is independent
// and best-effort: a failure in one does not block the others or the save.
import "server-only";

import { put } from "@vercel/blob";
import { getBlobAccess } from "@/lib/blob-storage";
import {
  CONTENT_REPO_PATHS,
  type SiteContentKey,
  writeContentFile,
} from "@/lib/site-data/files";

export type ContentMirrorTarget = "filesystem" | "blob" | "github";

export interface ContentMirrorResult {
  target: ContentMirrorTarget;
  ok: boolean;
  detail?: string;
  error?: string;
}

function serializeContentJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function blobPathnameForKey(key: SiteContentKey): string {
  return `site-content/${key}.json`;
}

function encodeGitHubContentPath(filePath: string): string {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function isTruthyEnv(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function mirrorContentToFiles(key: SiteContentKey, data: unknown): void {
  // Vercel's serverless deployments run on a read-only filesystem (aside from
  // /tmp), so attempting to write src/data/*.json there would throw. Skipping
  // it in production is intentional, not a missed case.
  if (process.env.VERCEL === "1") {
    return;
  }

  writeContentFile(key, data);
}

async function mirrorContentJsonToBlob(
  key: SiteContentKey,
  data: unknown,
): Promise<ContentMirrorResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      target: "blob",
      ok: false,
      error: "BLOB_READ_WRITE_TOKEN is not configured.",
    };
  }

  try {
    const body = serializeContentJson(data);

    await put(blobPathnameForKey(key), body, {
      access: getBlobAccess(),
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });

    return {
      target: "blob",
      ok: true,
      detail: blobPathnameForKey(key),
    };
  } catch (error) {
    return {
      target: "blob",
      ok: false,
      error: error instanceof Error ? error.message : "Blob mirror failed.",
    };
  }
}

// GitHub sync is opt-in and requires an explicit token, but the repo/branch
// can usually be inferred from the Vercel deployment itself so a project
// deployed via the Vercel GitHub integration doesn't need to duplicate config:
//   repo:   GITHUB_REPO -> GITHUB_REPOSITORY -> VERCEL_GIT_REPO_OWNER/SLUG
//   branch: GITHUB_BRANCH -> VERCEL_GIT_COMMIT_REF -> "main"
function getGitHubConfig():
  | { owner: string; repo: string; branch: string; token: string }
  | null {
  if (!isTruthyEnv(process.env.GITHUB_CONTENT_SYNC)) {
    return null;
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const repository =
    process.env.GITHUB_REPO?.trim() ||
    process.env.GITHUB_REPOSITORY?.trim() ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");

  if (!token || !repository) {
    return null;
  }

  const [owner, repo] = repository.split("/");

  if (!owner || !repo) {
    return null;
  }

  return {
    owner,
    repo,
    // Prefer an explicit branch override; otherwise ride whatever branch
    // Vercel is currently deploying so previews sync to their own branch.
    branch:
      process.env.GITHUB_BRANCH?.trim() ||
      process.env.VERCEL_GIT_COMMIT_REF?.trim() ||
      "main",
    token,
  };
}

export function getContentMirrorStatus() {
  const github = getGitHubConfig();

  return {
    filesystem: process.env.VERCEL !== "1",
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    github: {
      enabled: isTruthyEnv(process.env.GITHUB_CONTENT_SYNC),
      configured: Boolean(github),
      repo: github ? `${github.owner}/${github.repo}` : null,
      branch: github?.branch ?? null,
    },
  };
}

// GitHub's Contents API requires the current file's blob SHA to update it
// (omitting it would create a conflicting new file instead of overwriting).
// A 404 just means the file doesn't exist yet, which is a valid first-sync state.
async function getGitHubFileSha(
  config: { owner: string; repo: string; branch: string; token: string },
  filePath: string,
): Promise<string | null> {
  const encodedPath = encodeGitHubContentPath(filePath);
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(config.branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub file lookup failed (${response.status}): ${details}`);
  }

  const payload = (await response.json()) as { sha?: string };
  return payload.sha ?? null;
}

async function mirrorContentJsonToGitHub(
  key: SiteContentKey,
  data: unknown,
): Promise<ContentMirrorResult> {
  const config = getGitHubConfig();

  if (!config) {
    if (!isTruthyEnv(process.env.GITHUB_CONTENT_SYNC)) {
      return {
        target: "github",
        ok: false,
        error: "GITHUB_CONTENT_SYNC is not enabled.",
      };
    }

    return {
      target: "github",
      ok: false,
      error: "GitHub sync is enabled but GITHUB_TOKEN or GITHUB_REPO is missing.",
    };
  }

  const filePath = CONTENT_REPO_PATHS[key];
  const encodedPath = encodeGitHubContentPath(filePath);

  try {
    const sha = await getGitHubFileSha(config, filePath);
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: `chore(content): sync ${key} from Content Studio`,
          content: Buffer.from(serializeContentJson(data)).toString("base64"),
          branch: config.branch,
          ...(sha ? { sha } : {}),
        }),
      },
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`GitHub content sync failed (${response.status}): ${details}`);
    }

    return {
      target: "github",
      ok: true,
      detail: `${config.owner}/${config.repo}@${config.branch}:${filePath}`,
    };
  } catch (error) {
    return {
      target: "github",
      ok: false,
      error: error instanceof Error ? error.message : "GitHub mirror failed.",
    };
  }
}

// Runs every configured mirror independently and collects a result per
// target rather than throwing on the first failure — a broken GitHub token,
// say, should never prevent the blob/filesystem mirrors (or the DB save that
// triggered this) from succeeding.
export async function mirrorContentSnapshot(
  key: SiteContentKey,
  data: unknown,
): Promise<ContentMirrorResult[]> {
  const results: ContentMirrorResult[] = [];

  if (process.env.VERCEL !== "1") {
    try {
      mirrorContentToFiles(key, data);
      results.push({
        target: "filesystem",
        ok: true,
        detail: CONTENT_REPO_PATHS[key],
      });
    } catch (error) {
      results.push({
        target: "filesystem",
        ok: false,
        error: error instanceof Error ? error.message : "Filesystem mirror failed.",
      });
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    results.push(await mirrorContentJsonToBlob(key, data));
  }

  if (isTruthyEnv(process.env.GITHUB_CONTENT_SYNC)) {
    results.push(await mirrorContentJsonToGitHub(key, data));
  }

  for (const result of results) {
    if (!result.ok) {
      console.error(`[site-data] ${result.target} mirror failed for ${key}:`, result.error);
    }
  }

  return results;
}

export function summarizeMirrorResults(results: ContentMirrorResult[]): string | null {
  const failures = results.filter((result) => !result.ok);

  if (failures.length === 0) {
    return null;
  }

  return failures
    .map((result) => `${result.target}: ${result.error ?? "failed"}`)
    .join(" ");
}

export { blobPathnameForKey, serializeContentJson };
