import "server-only";

import path from "node:path";

import { SITE_CONFIG } from "./site-shape";

/**
 * Runtime data locations.
 *
 * On a server these must point OUTSIDE the checkout: content/*.json is tracked
 * in git but rewritten by the admin, so leaving it inside the repo means the
 * next `git pull` overwrites whatever the salon edited. Set CONTENT_DIR and
 * UPLOAD_DIR to writable paths that survive deploys (see DEPLOY.md).
 */
export const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.join(process.cwd(), "content");

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "data", "uploads");

/**
 * Canonical origin. Must be set per environment, otherwise a staging copy
 * advertises the production domain in its canonical tags and sitemap.
 */
export const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || SITE_CONFIG.url;

/** Set on any non-production host so search engines never index a copy. */
export const NOINDEX = process.env.SITE_NOINDEX === "1";
