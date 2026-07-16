// A deliberately simple session scheme for a single shared dashboard
// password (no per-user accounts). The session cookie is a signed,
// expiring token — not just a plain "authenticated=true" flag, which
// anyone could set by hand in devtools. Uses the Web Crypto API so the
// exact same signing/verification code runs correctly in both a normal
// Node API route and Edge middleware.

export const SESSION_COOKIE = "packora_dashboard_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getAuthSecret(): string | null {
  return process.env.DASHBOARD_AUTH_SECRET || null;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function isDashboardAuthConfigured(): boolean {
  return Boolean(process.env.DASHBOARD_PASSWORD && process.env.DASHBOARD_AUTH_SECRET);
}

// Constant-time comparison so login attempts can't be sped up by timing
// how quickly a wrong-but-close-to-correct password gets rejected.
export function passwordMatches(candidate: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;

  if (!expected || !candidate) {
    return false;
  }

  const expectedBytes = new TextEncoder().encode(expected);
  const candidateBytes = new TextEncoder().encode(candidate);

  if (expectedBytes.length !== candidateBytes.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < expectedBytes.length; i += 1) {
    mismatch |= expectedBytes[i] ^ candidateBytes[i];
  }

  return mismatch === 0;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getAuthSecret();

  if (!secret) {
    return null;
  }

  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );

  return `${payloadB64}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secret = getAuthSecret();

  if (!secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signatureB64] = parts;

  try {
    const key = await getHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureB64) as BufferSource,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) {
      return false;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    ) as SessionPayload;

    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
