import sharp from "sharp";
import { toSafeBuffer } from "@/lib/buffer-utils";
import { decodeHeicToRaster } from "@/lib/heic-decode-server";
import { isHeicBuffer, isHeicExtension } from "@/lib/image-format";

const DISPLAY_WEBP_QUALITY = 90;

/**
 * Convert formats browsers cannot display (HEIC/HEIF/TIFF/BMP) into WebP for
 * delivery only. The original upload remains untouched on disk/blob.
 */
export async function rasterizeForBrowserDisplay(
  buffer: Buffer,
  extension: string,
): Promise<Buffer> {
  const safeInput = toSafeBuffer(buffer);
  const needsHeicDecode = isHeicExtension(extension) || isHeicBuffer(safeInput);

  if (needsHeicDecode) {
    const raster = await decodeHeicToRaster(safeInput);
    return toSafeBuffer(
      await sharp(raster)
        .rotate()
        .webp({ quality: DISPLAY_WEBP_QUALITY })
        .toBuffer(),
    );
  }

  return toSafeBuffer(
    await sharp(safeInput)
      .rotate()
      .webp({ quality: DISPLAY_WEBP_QUALITY })
      .toBuffer(),
  );
}
