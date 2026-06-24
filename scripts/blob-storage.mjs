export function getBlobAccess() {
  const configured = process.env.BLOB_ACCESS?.trim().toLowerCase();

  if (configured === "public" || configured === "private") {
    return configured;
  }

  return "private";
}
