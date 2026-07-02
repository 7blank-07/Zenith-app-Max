import pg from 'pg';

const { Pool } = pg;
const MARKET_POOL_KEY = '__zenithMarketDatabasePool';

function getPoolStore() {
  return globalThis;
}

export function createMarketPool(rawEnv = process.env) {
  // Use MARKET_DATABASE_URL if available, otherwise build it from DATABASE_URL
  let connectionString = rawEnv.MARKET_DATABASE_URL;
  
  if (!connectionString && rawEnv.DATABASE_URL) {
    // Attempt to derive market URL from business DB URL by changing the database name
    try {
      const url = new URL(rawEnv.DATABASE_URL);
      url.pathname = '/zenith_market';
      // Force localhost for internal VPS communication if needed, 
      // but usually the host in DATABASE_URL is correct
      connectionString = url.toString();
    } catch {
      // Fallback to a hardcoded internal default if URL parsing fails
      connectionString = 'postgresql://zenith_bot:zenith6Z%40@127.0.0.1:5432/zenith_market';
    }
  }

  // Final fallback
  if (!connectionString) {
    connectionString = 'postgresql://zenith_bot:zenith6Z%40@127.0.0.1:5432/zenith_market';
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getMarketPool(rawEnv = process.env) {
  const store = getPoolStore();
  if (!store[MARKET_POOL_KEY]) {
    store[MARKET_POOL_KEY] = createMarketPool(rawEnv);
  }
  return store[MARKET_POOL_KEY];
}

export async function runMarketQuery(text, values = []) {
  console.log('[market-db] MARKET_DATABASE_URL:', process.env.MARKET_DATABASE_URL);
  console.log('[market-db] DATABASE_URL:', process.env.DATABASE_URL);
  const pool = getMarketPool();
  return pool.query(text, values);
}
