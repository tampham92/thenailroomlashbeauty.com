#!/usr/bin/env node
/**
 * Runs a command with the variables from an env file, without involving a shell.
 *
 *   node scripts/with-env.mjs /etc/thenailroom.env npm run deploy:build
 *
 * `set -a; . file` would work too, but it *executes* the file: a password
 * containing a space, quote, $, & or < is then run as a command instead of
 * assigned, and the variable silently ends up empty. Parsing it here means any
 * password works, quoted or not.
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const [envPath, command, ...args] = process.argv.slice(2);

if (!envPath || !command) {
  console.error("Usage: node scripts/with-env.mjs <env-file> <command> [args...]");
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(envPath, "utf8");
} catch (error) {
  console.error(`Cannot read ${envPath}: ${error.code}`);
  if (error.code === "EACCES") {
    console.error("Fix with: sudo chown root:www-data " + envPath + " && sudo chmod 640 " + envPath);
  }
  process.exit(1);
}

const env = { ...process.env };
const loaded = [];

raw.split("\n").forEach((line, index) => {
  const text = line.trim();
  if (!text || text.startsWith("#")) return;

  const eq = text.indexOf("=");
  if (eq < 1) {
    console.error(`${envPath}:${index + 1}: ignored, not a KEY=value line`);
    return;
  }

  const key = text.slice(0, eq).trim().replace(/^export\s+/, "");
  let value = text.slice(eq + 1).trim();

  // Strip one layer of matching quotes; leave everything inside untouched.
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
    (value.startsWith("'") && value.endsWith("'") && value.length > 1)
  ) {
    value = value.slice(1, -1);
  }

  env[key] = value;
  loaded.push(key);
});

const required = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"];
const missing = required.filter((k) => !env[k]);
if (missing.length > 0) {
  console.error(`\n${envPath} is missing a value for: ${missing.join(", ")}`);
  console.error("Sign-in will fail until these are set.");
  process.exit(1);
}
if (env.ADMIN_SESSION_SECRET.length < 16) {
  console.error(`\nADMIN_SESSION_SECRET is ${env.ADMIN_SESSION_SECRET.length} characters; 16 is the minimum.`);
  console.error("Generate one with: openssl rand -base64 32");
  process.exit(1);
}

console.log(`env: ${loaded.join(", ")}`);

spawn(command, args, { stdio: "inherit", env })
  .on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
