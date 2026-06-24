import convert from "heic-convert";
import sharp from "sharp";

const WEBP_QUALITY = 85;

export async function convertHeicToRaster(buffer: Buffer): Promise<Buffer> {
  const output = await convert({
    buffer,
    format: "PNG",
  });

  return Buffer.from(output);
}

export async function normalizeImageToWebp(
  buffer: Buffer,
  extension: string,
): Promise<{ buffer: Buffer; extension: string }> {
  let input = buffer;

  if (extension === ".heic" || extension === ".heif") {
    input = await convertHeicToRaster(buffer);
  }

  if (extension === ".webp") {
    return { buffer: input, extension: ".webp" };
  }

  const webp = await sharp(input)
    .rotate()
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer: webp, extension: ".webp" };
}
