import { assertAdminSession } from "@/lib/admin";
import { uploadContentImage } from "@/lib/content-upload";
import { toSafeBuffer } from "@/lib/buffer-utils";
import { resolveUploadImageExtension } from "@/lib/image-format";
import {
  buildArtworkImageFilename,
  buildPortraitFilename,
} from "@/lib/site-data/slug";
import { ARTWORK_IMAGE_EXTENSIONS } from "@/lib/artwork-image";

export const runtime = "nodejs";
/** Large iPhone originals can take longer to stream into Blob storage. */
export const maxDuration = 300;

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
  const videoIndex = Number(formData.get("videoIndex") ?? "0");
  const mimeType = String(formData.get("mimeType") ?? "");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  if (file.size <= 0) {
    return Response.json({ error: "The selected file is empty." }, { status: 400 });
  }

  const buffer = toSafeBuffer(new Uint8Array(await file.arrayBuffer()));
  const extension = resolveUploadImageExtension(
    buffer,
    file.name,
    mimeType || file.type,
  );

  if (!extension) {
    return Response.json(
      {
        error: `Unsupported image type. Use ${ARTWORK_IMAGE_EXTENSIONS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  try {
    if (kind === "portrait") {
      const filename = buildPortraitFilename(extension);
      const publicPath = await uploadContentImage({
        directory: "portraits",
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
      const filename = buildArtworkImageFilename(
        slug,
        "video-poster",
        extension,
        Number.isFinite(videoIndex) ? videoIndex : 0,
      );
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
