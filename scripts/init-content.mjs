#!/usr/bin/env node
/**
 * Seeds the live content directory from the defaults committed in content/.
 *
 * Existing files are never overwritten: on a server CONTENT_DIR holds what the
 * salon edited through /admin, and the repo copy is only a starting point.
 * Run this before `next build` on every deploy — the build prerenders pages
 * from CONTENT_DIR, so it must exist and be populated first.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const repoDefaults = path.join(process.cwd(), "content");
const target = path.resolve(process.env.CONTENT_DIR ?? repoDefaults);
const uploads = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads"),
);

await fs.mkdir(target, { recursive: true });
await fs.mkdir(uploads, { recursive: true });

const files = (await fs.readdir(repoDefaults)).filter((f) => f.endsWith(".json"));

let copied = 0;
let kept = 0;

for (const file of files) {
  const dest = path.join(target, file);
  try {
    await fs.access(dest);
    kept++;
  } catch {
    await fs.copyFile(path.join(repoDefaults, file), dest);
    copied++;
  }
}

if (path.resolve(repoDefaults) === target) {
  console.log(`content: using the in-repo directory (${target}).`);
  console.log(
    "  Set CONTENT_DIR to a path outside the checkout before deploying,",
  );
  console.log("  or a git pull will overwrite content edited in /admin.");
} else {
  console.log(`content: ${target}  (${copied} seeded, ${kept} kept)`);
}
console.log(`uploads: ${uploads}`);
