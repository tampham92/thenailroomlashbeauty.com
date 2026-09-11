/**
 * Signed session tokens built on Web Crypto so the same helpers run in both the
 * Node server and the Edge middleware.
 */

export const SESSION_COOKIE = "tnr_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short (min 16 characters). See .env.example.",
    );
  }
  return value;
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(),
    encoder.encode(payload),
  );
  return `${payload}.${toHex(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !/^[0-9a-f]+$/.test(signature)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromHex(signature),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}
