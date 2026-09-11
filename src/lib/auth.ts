import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "./session";

const encoder = new TextEncoder();

/** Length-safe, constant-time comparison of two secrets. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const viewA = new Uint8Array(hashA);
  const viewB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < viewA.length; i++) diff |= viewA[i] ^ viewB[i];
  return diff === 0;
}

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. See .env.example.");
  }
  return safeEqual(input, expected);
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for every admin page and server action. The middleware already blocks
 * unauthenticated navigation, but server actions are reachable directly, so
 * each one must check too.
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
