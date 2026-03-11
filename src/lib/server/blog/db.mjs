import pg from 'pg';
import { getBlogDatabaseConfig } from './env.mjs';

const { Pool } = pg;
const BLOG_POOL_KEY = '__zenithBlogDatabasePool';

function getPoolStore() {
  return globalThis;
}

export function createBlogPool(rawEnv = process.env) {
  return new Pool(getBlogDatabaseConfig(rawEnv));
}

export function getBlogPool(rawEnv = process.env) {
  const store = getPoolStore();
  if (!store[BLOG_POOL_KEY]) {
    store[BLOG_POOL_KEY] = createBlogPool(rawEnv);
  }
  return store[BLOG_POOL_KEY];
}

export async function closeBlogPool() {
  const store = getPoolStore();
  const pool = store[BLOG_POOL_KEY];
  if (!pool) return;
  delete store[BLOG_POOL_KEY];
  await pool.end();
}

export async function runBlogQuery(text, values = [], options = {}) {
  const executor = options.client || getBlogPool(options.env);
  return executor.query(text, values);
}

export async function withBlogClient(callback, options = {}) {
  const pool = getBlogPool(options.env);
  const client = await pool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function withBlogTransaction(callback, options = {}) {
  return withBlogClient(async (client) => {
    await client.query('BEGIN');

    try {
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        error.rollbackError = rollbackError;
      }
      throw error;
    }
  }, options);
}
