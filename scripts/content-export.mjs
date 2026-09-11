#!/usr/bin/env node
/**
 * Bundles the live content and uploads into one archive.
 *
 * These directories are deliberately outside the git checkout, so they are the
 * only thing a new server cannot get from `git clone`. Always move them
 * together: content references uploads by path, so migrating one without the
 * other leaves broken images.
 *
 *   node scripts/content-export.mjs [output.tar.gz]
 */
import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const contentDir = path.resolve(
  process.env.CONTENT_DIR ?? path.join(process.cwd(), "content"),
);
const uploadDir = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads"),
);

const stamp = new Date().toISOString().slice(0, 10);
const out = path.resolve(process.argv[2] ?? `thenailroom-content-${stamp}.tar.gz`);

for (const dir of [contentDir, uploadDir]) {
  try {
    await fs.access(dir);
  } catch {
    console.error(`Not found: ${dir}`);
    process.exit(1);
  }
}

const count = async (dir) => (await fs.readdir(dir)).filter((f) => f !== ".gitkeep").length;

// The archive always has the same two top-level directories, whatever the
// source paths were, so import does not need to know the old layout.
let staged = null;
let tarArgs;

if (path.dirname(contentDir) === path.dirname(uploadDir)) {
  tarArgs = [
    "-czf", out,
    "-C", path.dirname(contentDir),
    path.basename(contentDir),
    path.basename(uploadDir),
  ];
  if (path.basename(contentDir) !== "content" || path.basename(uploadDir) !== "uploads") {
    staged = await fs.mkdtemp(path.join(os.tmpdir(), "tnr-export-"));
    await fs.cp(contentDir, path.join(staged, "content"), { recursive: true });
    await fs.cp(uploadDir, path.join(staged, "uploads"), { recursive: true });
    tarArgs = ["-czf", out, "-C", staged, "content", "uploads"];
  }
} else {
  staged = await fs.mkdtemp(path.join(os.tmpdir(), "tnr-export-"));
  await fs.cp(contentDir, path.join(staged, "content"), { recursive: true });
  await fs.cp(uploadDir, path.join(staged, "uploads"), { recursive: true });
  tarArgs = ["-czf", out, "-C", staged, "content", "uploads"];
}

execFileSync("tar", tarArgs, { stdio: "inherit" });
if (staged) await fs.rm(staged, { recursive: true, force: true });

const size = (await fs.stat(out)).size;
console.log(`content : ${contentDir} (${await count(contentDir)} files)`);
console.log(`uploads : ${uploadDir} (${await count(uploadDir)} files)`);
console.log(`archive : ${out} (${(size / 1024 / 1024).toFixed(1)} MB)`);
