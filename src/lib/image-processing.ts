import sharp from "sharp";
import { toSafeBuffer } from "@/lib/buffer-utils";
import { decodeHeicToRaster } from "@/lib/heic-decode-server";
import { isHeicBuffer, isHeicExtension } from "@/lib/image-format";

const WEBP_QUALITY = 85;

async function rasterizeToWebp(input: Buffer): Promise<Buffer> {
  const safeInput = toSafeBuffer(input);

  return toSafeBuffer(
    await sharp(safeInput)
      .rotate()
      .webp({ quality: WEBP_QUALITY })
      .toBuffer(),
  );
}

export async function convertHeicToRaster(buffer: Buffer): Promise<Buffer> {
  return decodeHeicToRaster(buffer);
}

export async function normalizeImageToWebp(
  buffer: Buffer,
  extension: string,
): Promise<{ buffer: Buffer; extension: string }> {
  const safeInput = toSafeBuffer(buffer);
  const needsHeicDecode = isHeicExtension(extension) || isHeicBuffer(safeInput);

  let raster = safeInput;

  if (needsHeicDecode) {
    raster = await decodeHeicToRaster(safeInput);
  }

  if (extension === ".webp" && !needsHeicDecode) {
    return { buffer: raster, extension: ".webp" };
  }

  return {
    buffer: await rasterizeToWebp(raster),
    extension: ".webp",
  };
}
