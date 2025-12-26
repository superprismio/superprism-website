export const ATTACHMENT_MIME_LOOKUP = {
  txt: "text/plain",
  md: "text/markdown",
  json: "application/json",
  csv: "text/csv",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
} as const;

export type AttachmentAllowedExtension = keyof typeof ATTACHMENT_MIME_LOOKUP;

export const ATTACHMENT_ACCEPT_ATTRIBUTE = Object.keys(ATTACHMENT_MIME_LOOKUP)
  .map((extension) => `.${extension}`)
  .join(",");

// Allowed file types for upload (subset of ATTACHMENT_MIME_LOOKUP)
export const UPLOAD_ALLOWED_EXTENSIONS = [
  "txt",
  "md",
  "json",
  "csv",
  "pdf",
] as const;

export type UploadAllowedExtension =
  (typeof UPLOAD_ALLOWED_EXTENSIONS)[number];

export const UPLOAD_ACCEPT_ATTRIBUTE = UPLOAD_ALLOWED_EXTENSIONS.map(
  (extension) => `.${extension}`
).join(",");

export function getAttachmentExtension(
  fileName: string
): AttachmentAllowedExtension | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (!extension || !(extension in ATTACHMENT_MIME_LOOKUP)) {
    return null;
  }

  return extension as AttachmentAllowedExtension;
}

export function isAttachmentMimeTypeAllowed(
  extension: AttachmentAllowedExtension,
  mimeType: string | undefined
): boolean {
  const expectedType = ATTACHMENT_MIME_LOOKUP[extension];

  if (!mimeType) {
    return true;
  }

  if (mimeType === expectedType) {
    return true;
  }

  // Allow for browsers that fallback to octet-stream even when the extension matches.
  if (mimeType === "application/octet-stream") {
    return true;
  }

  return false;
}

export function isUploadAllowed(fileName: string): boolean {
  const extension = getAttachmentExtension(fileName);
  if (!extension) return false;
  return UPLOAD_ALLOWED_EXTENSIONS.includes(extension as UploadAllowedExtension);
}
