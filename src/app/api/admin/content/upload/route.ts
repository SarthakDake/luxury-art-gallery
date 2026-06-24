import { assertAdminSession } from "@/lib/admin";
import { ARTWORK_IMAGE_EXTENSIONS } from "@/lib/artwork-image";
import { uploadContentImage } from "@/lib/content-upload";
import {
  buildArtworkImageFilename,
  buildPortraitFilename,
} from "@/lib/site-data/slug";
import path from "path";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function getExtension(filename: string): string | null {
  const extension = path.extname(filename).toLowerCase();
  return ARTWORK_IMAGE_EXTENSIONS.includes(
    extension as (typeof ARTWORK_IMAGE_EXTENSIONS)[number],
  )
    ? extension
    : null;
}

export async function POST(request: Request) {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "artwork");
  const slug = String(formData.get("slug") ?? "artwork").trim();
  const galleryIndex = Number(formData.get("galleryIndex") ?? "0");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "Image must be 15 MB or smaller." }, { status: 400 });
  }

  const extension = getExtension(file.name);

  if (!extension) {
    return Response.json(
      {
        error: `Use ${ARTWORK_IMAGE_EXTENSIONS.join(", ")} images only.`,
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (kind === "portrait") {
      const filename = buildPortraitFilename(extension);
      const publicPath = await uploadContentImage({
        directory: "",
        filename,
        buffer,
        extension,
      });
      return Response.json({ path: publicPath, filename });
    }

    if (kind === "cover") {
      const filename = buildArtworkImageFilename(slug, "cover", extension);
      const publicPath = await uploadContentImage({
        directory: "artworks",
        filename,
        buffer,
        extension,
      });
      return Response.json({ path: publicPath, filename });
    }

    if (kind === "gallery") {
      const filename = buildArtworkImageFilename(
        slug,
        "gallery",
        extension,
        Number.isFinite(galleryIndex) ? galleryIndex : 0,
      );
      const publicPath = await uploadContentImage({
        directory: "artworks",
        filename,
        buffer,
        extension,
      });
      return Response.json({ path: publicPath, filename });
    }

    if (kind === "video-poster") {
      const filename = buildArtworkImageFilename(slug, "video-poster", extension);
      const publicPath = await uploadContentImage({
        directory: "artworks",
        filename,
        buffer,
        extension,
      });
      return Response.json({ path: publicPath, filename });
    }

    const filename = buildArtworkImageFilename(slug, "gallery", extension, 0);
    const publicPath = await uploadContentImage({
      directory: "artworks",
      filename,
      buffer,
      extension,
    });
    return Response.json({ path: publicPath, filename });
  } catch (error) {
    console.error("[upload] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not save image. Check server write permissions.";
    return Response.json({ error: message }, { status: 500 });
  }
}
