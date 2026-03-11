import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { BLOG_USER_ROLE } from './constants.mjs';
import { runBlogQuery, withBlogTransaction } from './db.mjs';
import { getBlogEnvironment } from './env.mjs';
import {
  buildAdminLoginPath,
  createSignedBlogSessionToken,
  getBlogSessionCookieOptions,
  getBlogSessionSecret,
  normalizeAdminNextPath,
  verifySignedBlogSessionToken
} from './session.mjs';
import { assertBlogPermission, canAccessBlogAdmin } from './permissions.mjs';
import { serializeBlogUserRow } from './serializers.mjs';

const scrypt = promisify(scryptCallback);

const GET_BLOG_AUTH_USER_BY_EMAIL_QUERY = `
  SELECT id, name, email, password_hash, role, is_active, session_version, created_at, updated_at
  FROM users
  WHERE LOWER(email) = LOWER($1)
  LIMIT 1
`;

const GET_BLOG_AUTH_USER_BY_ID_QUERY = `
  SELECT id, name, email, password_hash, role, is_active, session_version, created_at, updated_at
  FROM users
  WHERE id = $1
  LIMIT 1
`;

const INSERT_BLOG_AUTH_USER_QUERY = `
  INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, email, password_hash, role, is_active, session_version, created_at, updated_at
`;

const UPDATE_BLOG_AUTH_USER_QUERY = `
  UPDATE users
  SET
    name = $2,
    email = $3,
    password_hash = $4,
    role = $5,
    is_active = $6,
    session_version = CASE
      WHEN password_hash <> $4 OR role <> $5 OR is_active IS DISTINCT FROM $6 THEN session_version + 1
      ELSE session_version
    END,
    updated_at = NOW()
  WHERE id = $1
  RETURNING id, name, email, password_hash, role, is_active, session_version, created_at, updated_at
`;

function toText(value, fallback = '') {
  if (Array.isArray(value)) {
    return toText(value[0], fallback);
  }

  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

function isSupportedRole(role) {
  return role === BLOG_USER_ROLE.ADMIN || role === BLOG_USER_ROLE.EDITOR;
}

function toAuthUser(row) {
  if (!row) return null;

  const safeUser = serializeBlogUserRow(row);
  return safeUser
    ? {
        ...safeUser,
        passwordHash: toText(row.password_hash)
      }
    : null;
}

function sanitizeBlogAdminUser(user) {
  const safeUser = serializeBlogUserRow(user);
  return canAccessBlogAdmin(safeUser) ? safeUser : null;
}

async function queryAuthUser(query, values = [], options = {}) {
  const result = await runBlogQuery(query, values, options);
  return toAuthUser(result.rows[0] || null);
}

async function getAuthUserByEmail(email, options = {}) {
  return queryAuthUser(GET_BLOG_AUTH_USER_BY_EMAIL_QUERY, [normalizeEmail(email)], options);
}

async function getAuthUserById(id, options = {}) {
  return queryAuthUser(GET_BLOG_AUTH_USER_BY_ID_QUERY, [toText(id)], options);
}

function encodeBase64Url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

function decodeBase64Url(value) {
  return Buffer.from(String(value || ''), 'base64url');
}

export function getBlogAuthAvailability(rawEnv = process.env) {
  const { databaseUrl } = getBlogEnvironment(rawEnv);
  const sessionSecret = getBlogSessionSecret(rawEnv);
  const missing = [];

  if (!databaseUrl) {
    missing.push('DATABASE_URL');
  }

  if (!sessionSecret) {
    missing.push('BLOG_SESSION_SECRET');
  }

  return {
    isConfigured: missing.length === 0,
    hasDatabaseUrl: Boolean(databaseUrl),
    hasSessionSecret: Boolean(sessionSecret),
    missing
  };
}

export function getBlogBootstrapUserConfig(rawEnv = process.env) {
  return {
    admin: {
      name: toText(rawEnv.BLOG_ADMIN_NAME) || 'Zenith Admin',
      email: normalizeEmail(rawEnv.BLOG_ADMIN_EMAIL),
      password: toText(rawEnv.BLOG_ADMIN_PASSWORD),
      role: BLOG_USER_ROLE.ADMIN
    },
    editor: {
      name: toText(rawEnv.BLOG_EDITOR_NAME) || 'Zenith Editor',
      email: normalizeEmail(rawEnv.BLOG_EDITOR_EMAIL),
      password: toText(rawEnv.BLOG_EDITOR_PASSWORD),
      role: BLOG_USER_ROLE.EDITOR
    }
  };
}

export async function hashBlogPassword(password) {
  const normalizedPassword = String(password ?? '');

  if (normalizedPassword.length < 8) {
    throw new Error('Blog admin passwords must be at least 8 characters long.');
  }

  const salt = randomBytes(16);
  const derivedKey = await scrypt(normalizedPassword, salt, 64);
  return `scrypt$${encodeBase64Url(salt)}$${encodeBase64Url(derivedKey)}`;
}

export async function verifyBlogPassword(password, passwordHash) {
  const normalizedHash = toText(passwordHash);
  if (!normalizedHash.startsWith('scrypt$')) {
    return false;
  }

  const [, encodedSalt, encodedHash] = normalizedHash.split('$');
  if (!encodedSalt || !encodedHash) {
    return false;
  }

  const salt = decodeBase64Url(encodedSalt);
  const expectedHash = decodeBase64Url(encodedHash);
  const actualHash = Buffer.from(await scrypt(String(password ?? ''), salt, expectedHash.length));

  return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
}

export async function authenticateBlogUser({ email, password } = {}) {
  const availability = getBlogAuthAvailability();
  if (!availability.isConfigured) {
    throw new Error('Blog admin authentication is not configured.');
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password ?? '');

  if (!normalizedEmail || !normalizedPassword) {
    return null;
  }

  const user = await getAuthUserByEmail(normalizedEmail);
  if (!user?.isActive || !isSupportedRole(user.role)) {
    return null;
  }

  const passwordMatches = await verifyBlogPassword(normalizedPassword, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return sanitizeBlogAdminUser(user);
}

export async function resolveBlogSessionUserFromToken(token) {
  const availability = getBlogAuthAvailability();
  if (!availability.isConfigured) {
    return null;
  }

  const session = await verifySignedBlogSessionToken(token);
  if (!session) {
    return null;
  }

  const user = await getAuthUserById(session.sub);
  if (!user?.isActive || !isSupportedRole(user.role)) {
    return null;
  }

  if (user.sessionVersion !== session.ver || user.role !== session.role) {
    return null;
  }

  return sanitizeBlogAdminUser(user);
}

export async function getBlogSessionUser() {
  const availability = getBlogAuthAvailability();
  if (!availability.isConfigured) {
    return null;
  }

  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const cookieName = getBlogSessionCookieOptions().name;
  const token = cookieStore.get(cookieName)?.value;
  return resolveBlogSessionUserFromToken(token);
}

export async function createBlogSession(user) {
  const safeUser = sanitizeBlogAdminUser(user);
  if (!safeUser) {
    throw new Error('Only active editors or admins can create a blog admin session.');
  }

  const token = await createSignedBlogSessionToken({
    userId: safeUser.id,
    role: safeUser.role,
    sessionVersion: safeUser.sessionVersion
  });

  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const options = getBlogSessionCookieOptions();
  cookieStore.set(options.name, token, options);
  return safeUser;
}

export async function clearBlogSession() {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const options = getBlogSessionCookieOptions();
  cookieStore.set(options.name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0)
  });
}

export async function requireBlogSessionUser({ nextPath = '/admin/blogs', permission = 'admin-access' } = {}) {
  const user = await getBlogSessionUser();

  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect(buildAdminLoginPath(normalizeAdminNextPath(nextPath, '/admin/blogs')));
  }

  assertBlogPermission(user, permission);
  return user;
}

export async function upsertBlogBootstrapUser({ name, email, password, role, isActive = true } = {}, options = {}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = toText(role).toLowerCase();
  const normalizedName = toText(name);

  if (!normalizedName) {
    throw new Error('A display name is required when seeding blog bootstrap users.');
  }

  if (!normalizedEmail) {
    throw new Error('An email is required when seeding blog bootstrap users.');
  }

  if (!isSupportedRole(normalizedRole)) {
    throw new Error(`Unsupported blog bootstrap role "${role}".`);
  }

  const passwordHash = await hashBlogPassword(password);

  return withBlogTransaction(async (client) => {
    const existing = await getAuthUserByEmail(normalizedEmail, { ...options, client });

    if (!existing) {
      const inserted = await client.query(INSERT_BLOG_AUTH_USER_QUERY, [
        normalizedName,
        normalizedEmail,
        passwordHash,
        normalizedRole,
        Boolean(isActive)
      ]);

      return sanitizeBlogAdminUser(inserted.rows[0] || null);
    }

    const updated = await client.query(UPDATE_BLOG_AUTH_USER_QUERY, [
      existing.id,
      normalizedName,
      normalizedEmail,
      passwordHash,
      normalizedRole,
      Boolean(isActive)
    ]);

    return sanitizeBlogAdminUser(updated.rows[0] || null);
  }, options);
}

export async function seedBlogBootstrapUsers(input, options = {}) {
  const config = input || {};
  const admin = await upsertBlogBootstrapUser(config.admin, options);
  const editor = await upsertBlogBootstrapUser(config.editor, options);
  return { admin, editor };
}
