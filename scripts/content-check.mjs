#!/usr/bin/env node
/**
 * Verifies that every image referenced by the live content actually exists.
 *
 * Catches the classic half-migration: content/*.json copied to a new server
 * but the uploads directory left behind, so the site renders broken images.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const contentDir = path.resolve(
  process.env.CONTENT_DIR ?? path.join(process.cwd(), "content"),
);
const uploadDir = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads"),
);
const publicImages = path.join(process.cwd(), "public");

/** Pulls every "/images/..." or "/uploads/..." string out of a parsed JSON value. */
function collect(node, found = new Set()) {
  if (typeof node === "string") {
    if (node.startsWith("/images/") || node.startsWith("/uploads/")) found.add(node);
  } else if (Array.isArray(node)) {
    for (const item of node) collect(item, found);
  } else if (node && typeof node === "object") {
    for (const value of Object.values(node)) collect(value, found);
  }
  return found;
}

const files = (await fs.readdir(contentDir)).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  console.error(`No content found in ${contentDir}`);
  process.exit(1);
}

const referenced = new Set();
for (const file of files) {
  const raw = await fs.readFile(path.join(contentDir, file), "utf8");
  collect(JSON.parse(raw), referenced);
}

const missing = [];
for (const ref of referenced) {
  const target = ref.startsWith("/uploads/")
    ? path.join(uploadDir, path.basename(ref))
    : path.join(publicImages, ref);
  try {
    await fs.access(target);
  } catch {
    missing.push({ ref, target });
  }
}

const uploads = [...referenced].filter((r) => r.startsWith("/uploads/")).length;
console.log(`content : ${contentDir} (${files.length} files)`);
console.log(`uploads : ${uploadDir}`);
console.log(
  `images  : ${referenced.size} referenced (${uploads} uploaded, ${referenced.size - uploads} shipped with the repo)`,
);

if (missing.length === 0) {
  console.log("OK — every referenced image is present.");
  process.exit(0);
}

console.error(`\nMISSING ${missing.length} image(s):`);
for (const m of missing) console.error(`  ${m.ref}\n    expected at ${m.target}`);
console.error(
  "\nIf these are /uploads/ paths, the upload directory was not migrated.",
);
process.exit(1);
