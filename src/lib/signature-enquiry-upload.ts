import { uploadContentImage } from "@/lib/content-upload";
import { resolveUploadImageExtension } from "@/lib/image-format";
import { randomBytes } from "crypto";

const MAX_WALL_PHOTO_BYTES = 4 * 1024 * 1024;

export async function saveSignatureEnquiryWallPhoto(file: File): Promise<{
  publicPath: string;
  buffer: Buffer;
  contentType: string;
  filename: string;
}> {
  if (file.size <= 0 || file.size > MAX_WALL_PHOTO_BYTES) {
    throw new Error("Wall photo must be smaller than 4 MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = resolveUploadImageExtension(buffer, file.name, file.type);

  if (!extension) {
    throw new Error("Upload a JPG, PNG, WebP, HEIC, or other supported image.");
  }

  const token = randomBytes(6).toString("hex");
  const filename = `enquiry-wall-${Date.now()}-${token}${extension}`;
  const publicPath = await uploadContentImage({
    directory: "site/enquiry-photos",
    filename,
    buffer,
    extension,
  });

  return {
    publicPath,
    buffer,
    contentType: file.type || "application/octet-stream",
    filename,
  };
}
