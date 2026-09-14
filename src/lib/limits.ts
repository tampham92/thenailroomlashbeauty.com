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

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

export const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
