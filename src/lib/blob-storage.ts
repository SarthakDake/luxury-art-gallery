export type BlobAccess = "public" | "private";

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getBlobAccess(): BlobAccess {
  const configured = process.env.BLOB_ACCESS?.trim().toLowerCase();

  if (configured === "public" || configured === "private") {
    return configured;
  }

  return "private";
}

export function getBlobPathnameFromUrl(url: string): string | null {
  const match = url.match(/blob\.vercel-storage\.com\/([^?#]+)/i);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function toBlobVirtualPath(pathname: string): string {
  return `/${pathname.replace(/^\/+/, "")}`;
}
