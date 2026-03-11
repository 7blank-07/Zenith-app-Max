const BLOG_ADMIN_SESSION_COOKIE_NAME = 'zenith_blog_admin_session';
const BLOG_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const encoder = new TextEncoder();
const signingKeyCache = new Map();

function toText(value, fallback = '') {
  if (Array.isArray(value)) {
    return toText(value[0], fallback);
  }

  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function base64UrlEncode(bytes) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = toText(value)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  if (!normalized) {
    return new Uint8Array();
  }

  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getCryptoRuntime() {
  return globalThis.crypto?.subtle ? globalThis.crypto : null;
}

function isSafeAdminPath(value) {
  const text = toText(value);
  return text.startsWith('/admin') && !text.startsWith('//');
}

async function getSigningKey(secret) {
  if (!secret) return null;
  if (signingKeyCache.has(secret)) {
    return signingKeyCache.get(secret);
  }

  const cryptoRuntime = getCryptoRuntime();
  if (!cryptoRuntime?.subtle) {
    return null;
  }

  const promise = cryptoRuntime.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  signingKeyCache.set(secret, promise);
  return promise;
}

function normalizeSessionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const userId = toText(payload.sub || payload.userId);
  const role = toText(payload.role).toLowerCase();
  const sessionVersion = Math.max(1, toInteger(payload.ver ?? payload.sessionVersion, 1));
  const issuedAt = toInteger(payload.iat ?? payload.issuedAt, 0);
  const expiresAt = toInteger(payload.exp ?? payload.expiresAt, 0);

  if (!userId || !role || !issuedAt || !expiresAt) {
    return null;
  }

  return {
    sub: userId,
    role,
    ver: sessionVersion,
    iat: issuedAt,
    exp: expiresAt
  };
}

export { BLOG_ADMIN_SESSION_COOKIE_NAME, BLOG_ADMIN_SESSION_TTL_SECONDS };

export function getBlogSessionSecret(rawEnv = process.env) {
  return toText(rawEnv.BLOG_SESSION_SECRET || rawEnv.SESSION_SECRET);
}

export function hasBlogSessionSecret(rawEnv = process.env) {
  return Boolean(getBlogSessionSecret(rawEnv));
}

export function normalizeAdminNextPath(value, fallback = '/admin/blogs') {
  return isSafeAdminPath(value) ? toText(value) : fallback;
}

export function buildAdminLoginPath(nextPath = '/admin/blogs') {
  const normalizedNextPath = normalizeAdminNextPath(nextPath, '/admin/blogs');
  if (!normalizedNextPath || normalizedNextPath === '/admin/blogs') {
    return '/admin';
  }

  const params = new URLSearchParams({ next: normalizedNextPath });
  return `/admin?${params.toString()}`;
}

export function getBlogSessionCookieOptions(rawEnv = process.env) {
  const secure = toText(rawEnv.NODE_ENV).toLowerCase() === 'production'
    || toText(rawEnv.NEXT_PUBLIC_SITE_URL).toLowerCase().startsWith('https://');

  return {
    name: BLOG_ADMIN_SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: BLOG_ADMIN_SESSION_TTL_SECONDS
  };
}

export async function createSignedBlogSessionToken(input, rawEnv = process.env) {
  const secret = getBlogSessionSecret(rawEnv);
  const cryptoRuntime = getCryptoRuntime();

  if (!secret || !cryptoRuntime?.subtle) {
    throw new Error('BLOG_SESSION_SECRET is required to create blog admin sessions.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = normalizeSessionPayload({
    sub: input?.sub || input?.userId,
    role: input?.role,
    ver: input?.ver ?? input?.sessionVersion,
    iat: now,
    exp: now + Math.max(60, toInteger(input?.maxAge, BLOG_ADMIN_SESSION_TTL_SECONDS))
  });

  if (!payload) {
    throw new Error('A valid user id, role, and session version are required to create a blog admin session.');
  }

  const serializedPayload = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(encoder.encode(serializedPayload));
  const signingKey = await getSigningKey(secret);
  const signatureBuffer = await cryptoRuntime.subtle.sign('HMAC', signingKey, encoder.encode(encodedPayload));
  const signature = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${encodedPayload}.${signature}`;
}

export async function verifySignedBlogSessionToken(token, rawEnv = process.env) {
  const secret = getBlogSessionSecret(rawEnv);
  const cryptoRuntime = getCryptoRuntime();
  const value = toText(token);

  if (!value || !secret || !cryptoRuntime?.subtle) {
    return null;
  }

  const [encodedPayload, encodedSignature, ...rest] = value.split('.');
  if (!encodedPayload || !encodedSignature || rest.length) {
    return null;
  }

  const signingKey = await getSigningKey(secret);
  const isValidSignature = await cryptoRuntime.subtle.verify(
    'HMAC',
    signingKey,
    base64UrlDecode(encodedSignature),
    encoder.encode(encodedPayload)
  );

  if (!isValidSignature) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)));
    const payload = normalizeSessionPayload(decodedPayload);

    if (!payload) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
