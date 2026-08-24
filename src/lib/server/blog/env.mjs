import path from 'node:path';
import { BLOG_MIGRATIONS_TABLE } from './constants.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function resolveSsl(rawEnv) {
  const explicit = toText(rawEnv.BLOG_DATABASE_SSL || rawEnv.DATABASE_SSL || rawEnv.PGSSLMODE);
  if (!explicit) return false;

  const normalized = explicit.toLowerCase();
  if (['0', 'false', 'off', 'disable'].includes(normalized)) return false;

  if (['no-verify', 'allow', 'prefer'].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  return {
    rejectUnauthorized: toBoolean(
      rawEnv.BLOG_DATABASE_SSL_REJECT_UNAUTHORIZED ?? rawEnv.DATABASE_SSL_REJECT_UNAUTHORIZED,
      false
    )
  };
}

function resolveDatabaseUrl(rawEnv) {
  return toText(rawEnv.BLOG_DATABASE_URL || rawEnv.DATABASE_URL);
}

export function getBlogEnvironment(rawEnv = process.env) {
  const databaseUrl = resolveDatabaseUrl(rawEnv);
  const migrationsDir = toText(rawEnv.BLOG_MIGRATIONS_DIR) || path.join(process.cwd(), 'scripts', 'db');

  return {
    databaseUrl,
    ssl: resolveSsl(rawEnv),
    maxConnections: Math.max(1, toInteger(rawEnv.BLOG_DATABASE_MAX_CONNECTIONS, 10)),
    idleTimeoutMs: Math.max(1_000, toInteger(rawEnv.BLOG_DATABASE_IDLE_TIMEOUT_MS, 30_000)),
    connectionTimeoutMs: Math.max(1_000, toInteger(rawEnv.BLOG_DATABASE_CONNECTION_TIMEOUT_MS, 10_000)),
    applicationName: toText(rawEnv.BLOG_DATABASE_APPLICATION_NAME) || 'zenith-blog-cms',
    migrationsDir,
    migrationsTable: BLOG_MIGRATIONS_TABLE
  };
}

export function assertBlogDatabaseUrl(rawEnv = process.env) {
  const { databaseUrl } = getBlogEnvironment(rawEnv);
  if (!databaseUrl) {
    throw new Error('BLOG_DATABASE_URL or DATABASE_URL is required to use the blog PostgreSQL data layer.');
  }
  return databaseUrl;
}

export function getBlogDatabaseConfig(rawEnv = process.env) {
  const environment = getBlogEnvironment(rawEnv);
  let connectionString = assertBlogDatabaseUrl(rawEnv);
  const parsedUrl = new URL(connectionString);
  const requiresSsl = parsedUrl.searchParams.get('sslmode') === 'require';
  if (requiresSsl) {
    parsedUrl.searchParams.delete('sslmode');
    connectionString = parsedUrl.toString();
  }

  return {
    connectionString,
    ssl: requiresSsl ? { rejectUnauthorized: false } : environment.ssl,
    max: environment.maxConnections,
    idleTimeoutMillis: environment.idleTimeoutMs,
    connectionTimeoutMillis: environment.connectionTimeoutMs,
    application_name: environment.applicationName,
    allowExitOnIdle: true
  };
}

export function getBlogMigrationsDirectory(rawEnv = process.env) {
  return getBlogEnvironment(rawEnv).migrationsDir;
}
