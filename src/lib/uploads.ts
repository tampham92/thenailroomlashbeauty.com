import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

import { UPLOAD_DIR } from "./paths";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  formatMb,
} from "./limits";

export const UPLOAD_URL_PREFIX = "/uploads/";

export { MAX_UPLOAD_BYTES };

/**
 * Uploads live OUTSIDE public/ on purpose: `next build` snapshots the public
 * directory, so anything written there at runtime is never served. These files
 * are streamed by the /uploads/[...path] route handler instead.
 */
export { UPLOAD_DIR };

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export const ACCEPTED_TYPES = ACCEPTED_IMAGE_TYPES;

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  );
}

/** Resolves a request path to a file inside UPLOAD_DIR, or null if it escapes. */
export function resolveUploadPath(segments: string[]): string | null {
  if (segments.length !== 1) return null;

  const name = segments[0];
  if (!/^[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(name)) return null;

  const target = path.resolve(UPLOAD_DIR, name);
  if (path.dirname(target) !== path.resolve(UPLOAD_DIR)) return null;

  return target;
}

export type UploadResult =
  | { ok: true; src: string }
  | { ok: false; error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "No file selected." };

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    return {
      ok: false,
      error: `Unsupported file type "${file.type || "unknown"}". Use JPG, PNG, WebP or AVIF.`,
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is ${formatMb(file.size)} — the limit is ${formatMb(MAX_UPLOAD_BYTES)}.`,
    };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const name = `${slugify(file.name)}-${randomBytes(4).toString("hex")}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);

  return { ok: true, src: `${UPLOAD_URL_PREFIX}${name}` };
}

/**
 * Only ever deletes inside data/uploads — the images migrated from WordPress
 * live in public/images and must survive an admin removing them from a gallery.
 */
export async function deleteUploadIfUnused(
  src: string,
  stillUsed: boolean,
): Promise<void> {
  if (stillUsed) return;
  if (!src.startsWith(UPLOAD_URL_PREFIX)) return;

  const target = resolveUploadPath([src.slice(UPLOAD_URL_PREFIX.length)]);
  if (!target) return;

  await fs.rm(target, { force: true });
}
