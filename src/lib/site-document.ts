/**
 * Resolve a CMS-stored document virtual path to a browsable/downloadable URL.
 * Local public files and Blob-backed paths both go through /api/site-document.
 */
export function getSiteDocumentSrc(
  virtualPath: string,
  options?: { download?: boolean; filename?: string },
): string {
  const trimmed = virtualPath.trim();
  if (!trimmed) {
    return "";
  }

  const [pathnamePart, query = ""] = trimmed.split("?");
  const normalized = pathnamePart.replace(/^\/+/, "");
  const params = new URLSearchParams(query);

  if (options?.download) {
    params.set("download", "1");
  }
  if (options?.filename) {
    params.set("filename", options.filename);
  }

  const search = params.toString();
  return `/api/site-document/${normalized}${search ? `?${search}` : ""}`;
}
