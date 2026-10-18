import type { SignatureCoverOrientation, SignatureProject } from "@/types/site-config";

export function resolveSignatureCoverOrientation(
  project: Pick<SignatureProject, "coverOrientation">,
): SignatureCoverOrientation {
  return project.coverOrientation === "portrait" ? "portrait" : "landscape";
}
