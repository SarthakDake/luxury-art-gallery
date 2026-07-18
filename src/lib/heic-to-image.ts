import { rasterizeForBrowserDisplay } from "@/lib/image-processing";

/** @deprecated Prefer rasterizeForBrowserDisplay — kept for older call sites. */
export async function convertHeicToPng(input: Buffer): Promise<Buffer> {
  return rasterizeForBrowserDisplay(input, ".heic");
}
