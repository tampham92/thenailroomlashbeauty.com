/**
 * Upload limits, shared by the client picker, the server action and
 * next.config.ts so the three can never drift apart.
 *
 * The layers must stay ordered, largest outermost:
 *
 *   app check      12 MB   (MAX_UPLOAD_BYTES, friendly error)
 *   Server Action  13 MB   (SERVER_ACTION_BODY_LIMIT, hard 500 past this)
 *   nginx          15 MB   (client_max_body_size, 413 past this)
 *
 * Server Actions cap request bodies at 1 MB by default, which rejects any
 * phone photo before the action runs — the browser just shows "a server error
 * occurred". The limit below has to exceed MAX_UPLOAD_BYTES plus the few KB of
 * multipart boundaries and field metadata.
 */

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/** Passed to experimental.serverActions.bodySizeLimit. */
export const SERVER_ACTION_BODY_LIMIT = "13mb";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/**
 * iPhones shoot HEIC by default. Browsers cannot display it, so the server
 * converts these to JPEG on upload rather than making the salon change a
 * setting on the phone.
 */
export const CONVERTED_IMAGE_TYPES = ["image/heic", "image/heif"] as const;

export const UPLOADABLE_IMAGE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...CONVERTED_IMAGE_TYPES,
] as const;

/** Extensions are the fallback: iOS often reports an empty MIME type. */
export const EXTENSION_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

/** Best guess at a file's image type, tolerating a missing MIME type. */
export function detectImageType(name: string, mime: string): string | null {
  if ((UPLOADABLE_IMAGE_TYPES as readonly string[]).includes(mime)) return mime;
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return EXTENSION_TO_TYPE[ext] ?? null;
}

export const ACCEPT_ATTRIBUTE = [
  ...UPLOADABLE_IMAGE_TYPES,
  ".heic",
  ".heif",
].join(",");

export const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
