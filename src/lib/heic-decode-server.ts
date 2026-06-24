import { createRequire } from "node:module";
import libheif from "libheif-js";
import sharp from "sharp";
import { toSafeBuffer } from "@/lib/buffer-utils";

const require = createRequire(import.meta.url);

interface HeicDecodedImage {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

const decodeHeic = require("heic-decode/lib.js")(libheif).one as (options: {
  buffer: Uint8Array;
}) => Promise<HeicDecodedImage>;

export async function decodeHeicToRaster(buffer: Buffer): Promise<Buffer> {
  const input = toSafeBuffer(buffer);
  const image = await decodeHeic({ buffer: new Uint8Array(input) });
  const pixels = toSafeBuffer(image.data);

  return toSafeBuffer(
    await sharp(pixels, {
      raw: {
        width: image.width,
        height: image.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer(),
  );
}
