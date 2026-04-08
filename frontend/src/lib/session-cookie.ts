const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const DEV_SESSION_COOKIE_SECRET = "gerenciador-pilates-dev-session-secret";

let signingKeyPromise: Promise<CryptoKey> | null = null;

function getSessionCookieSecret() {
  const secret = process.env.SESSION_COOKIE_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_COOKIE_SECRET nao configurado em producao.");
  }

  return DEV_SESSION_COOKIE_SECRET;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function serializePayload(payload: unknown) {
  return bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
}

function deserializePayload<T>(value: string) {
  return JSON.parse(textDecoder.decode(base64UrlToBytes(value))) as T;
}

async function getSigningKey() {
  if (!signingKeyPromise) {
    signingKeyPromise = crypto.subtle.importKey(
      "raw",
      textEncoder.encode(getSessionCookieSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }

  return signingKeyPromise;
}

export async function encodeSignedSessionCookie(payload: unknown, scope: string) {
  const serializedPayload = serializePayload(payload);
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(`${scope}.${serializedPayload}`));

  return `${serializedPayload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function decodeSignedSessionCookie<T>(value: string | undefined, scope: string) {
  if (!value || !value.includes(".")) {
    return null;
  }

  const [serializedPayload, signature] = value.split(".");

  if (!serializedPayload || !signature) {
    return null;
  }

  try {
    const key = await getSigningKey();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      textEncoder.encode(`${scope}.${serializedPayload}`)
    );

    if (!isValid) {
      return null;
    }

    return deserializePayload<T>(serializedPayload);
  } catch {
    return null;
  }
}

export function decodeLegacySessionCookie<T>(value: string | undefined) {
  if (!value || value.includes(".")) {
    return null;
  }

  try {
    return deserializePayload<T>(value);
  } catch {
    return null;
  }
}
