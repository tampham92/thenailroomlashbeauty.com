#!/usr/bin/env node
/**
 * Restores an archive made by content-export.mjs into CONTENT_DIR/UPLOAD_DIR.
 *
 *   node scripts/content-import.mjs archive.tar.gz
 *
 * Refuses to clobber a populated destination unless --force is given, and in
 * that case moves the existing directories aside rather than deleting them.
 */
import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const archive = process.argv[2] && path.resolve(process.argv[2]);
const force = process.argv.includes("--force");

if (!archive) {
  console.error("Usage: node scripts/content-import.mjs <archive.tar.gz> [--force]");
  process.exit(1);
}

const contentDir = path.resolve(
  process.env.CONTENT_DIR ?? path.join(process.cwd(), "content"),
);
const uploadDir = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads"),
);

const populated = async (dir) => {
  try {
    return (await fs.readdir(dir)).filter((f) => f !== ".gitkeep").length > 0;
  } catch {
    return false;
  }
};

const busy = [];
if (await populated(contentDir)) busy.push(contentDir);
if (await populated(uploadDir)) busy.push(uploadDir);

if (busy.length > 0 && !force) {
  console.error("Refusing to overwrite existing data:");
  for (const dir of busy) console.error(`  ${dir}`);
  console.error("\nRe-run with --force (the current contents are moved aside, not deleted).");
  process.exit(1);
}

const staged = await fs.mkdtemp(path.join(os.tmpdir(), "tnr-import-"));
execFileSync("tar", ["-xzf", archive, "-C", staged], { stdio: "inherit" });

for (const name of ["content", "uploads"]) {
  try {
    await fs.access(path.join(staged, name));
  } catch {
    console.error(`Archive is missing its "${name}" directory — not an export from content-export.mjs?`);
    await fs.rm(staged, { recursive: true, force: true });
    process.exit(1);
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
for (const [name, target] of [["content", contentDir], ["uploads", uploadDir]]) {
  if (await populated(target)) {
    const backup = `${target}.bak-${stamp}`;
    await fs.rename(target, backup);
    console.log(`moved aside : ${target} -> ${backup}`);
  } else {
    await fs.rm(target, { recursive: true, force: true });
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(path.join(staged, name), target, { recursive: true });
}

await fs.rm(staged, { recursive: true, force: true });

console.log(`content : ${contentDir}`);
console.log(`uploads : ${uploadDir}`);
console.log("\nNow verify with: node scripts/content-check.mjs");
