import { decodeHeicToRaster } from "@/lib/heic-decode-server";

export async function convertHeicToPng(input: Buffer): Promise<Buffer> {
  return decodeHeicToRaster(input);
}
