import fs from "fs";
import path from "path";
import { ARTWORK_IMAGE_EXTENSIONS } from "@/lib/artwork-image";
import { convertHeicToPng } from "@/lib/heic-to-image";

const ARTWORKS_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "artworks",
);

function resolveArtworkFile(filename: string): string | null {
  const safeName = path.basename(filename);
  const resolved = path.resolve(ARTWORKS_DIR, safeName);

  if (!resolved.startsWith(ARTWORKS_DIR)) {
    return null;
  }

  if (fs.existsSync(resolved)) {
    return resolved;
  }

  if (!fs.existsSync(ARTWORKS_DIR)) {
    return null;
  }

  const match = fs
    .readdirSync(ARTWORKS_DIR)
    .find((entry) => entry.toLowerCase() === safeName.toLowerCase());

  return match ? path.join(ARTWORKS_DIR, match) : null;
}

function getContentType(extension: string): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
    case ".heif":
      return "image/png";
    default:
      return "image/jpeg";
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;

  if (segments.length !== 2 || segments[0] !== "artworks") {
    return new Response("Not found", { status: 404 });
  }

  const filePath = resolveArtworkFile(segments[1]);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(filePath).toLowerCase();

  if (
    !ARTWORK_IMAGE_EXTENSIONS.includes(
      extension as (typeof ARTWORK_IMAGE_EXTENSIONS)[number],
    )
  ) {
    return new Response("Unsupported format", { status: 415 });
  }

  const input = fs.readFileSync(filePath);
  const shouldConvert = extension === ".heic" || extension === ".heif";

  let output: Buffer;

  if (shouldConvert) {
    try {
      output = await convertHeicToPng(input);
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      return new Response("Failed to convert image", { status: 500 });
    }
  } else {
    output = input;
  }

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": getContentType(extension),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
