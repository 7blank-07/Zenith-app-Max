import fs from 'node:fs/promises';
import path from 'node:path';
import { closeBlogPool, getBlogPool } from '../../src/lib/server/blog/db.mjs';
import { getBlogEnvironment, getBlogMigrationsDirectory } from '../../src/lib/server/blog/env.mjs';

function parseArgs(argv) {
  const config = {
    dryRun: false,
    migrationsDir: undefined
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--dry-run') {
      config.dryRun = true;
      continue;
    }

    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.split('=');
    const key = rawKey.slice(2);
    let value = inlineValue;

    if (value === undefined && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      value = argv[index + 1];
      index += 1;
    }

    if (!value) continue;
    if (key === 'dir' || key === 'migrations-dir') {
      config.migrationsDir = value;
    }
  }

  return config;
}

async function listMigrationFiles(migrationsDir) {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));
}

async function readSqlFile(migrationsDir, fileName) {
  const fullPath = path.join(migrationsDir, fileName);
  return fs.readFile(fullPath, 'utf8');
}

async function ensureMigrationsTable(client, tableName) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id bigserial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      executed_at timestamptz NOT NULL DEFAULT NOW()
    )
  `);
}

async function loadAppliedMigrationNames(client, tableName) {
  const result = await client.query(`SELECT name FROM ${tableName}`);
  return new Set(result.rows.map((row) => String(row.name)));
}

async function applyMigration(client, tableName, fileName, sql) {
  await client.query('BEGIN');

  try {
    await client.query(sql);
    await client.query(`INSERT INTO ${tableName} (name) VALUES ($1)`, [fileName]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const environment = getBlogEnvironment(process.env);
  const migrationsDir = path.isAbsolute(args.migrationsDir || '')
    ? args.migrationsDir
    : path.resolve(args.migrationsDir || getBlogMigrationsDirectory(process.env));

  const migrationFiles = await listMigrationFiles(migrationsDir);
  if (!migrationFiles.length) {
    console.log('[blog-migrations] No .sql migration files found.');
    return;
  }

  console.log('[blog-migrations] Directory:', migrationsDir);
  console.log('[blog-migrations] Files:', migrationFiles.join(', '));

  if (args.dryRun) {
    console.log('[blog-migrations] Dry run complete. No database changes were made.');
    return;
  }

  if (!environment.databaseUrl) {
    throw new Error('DATABASE_URL is required to run blog migrations.');
  }

  const pool = getBlogPool(process.env);
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client, environment.migrationsTable);
    const applied = await loadAppliedMigrationNames(client, environment.migrationsTable);

    for (const fileName of migrationFiles) {
      if (applied.has(fileName)) {
        console.log(`[blog-migrations] Skipping already applied migration: ${fileName}`);
        continue;
      }

      const sql = await readSqlFile(migrationsDir, fileName);
      console.log(`[blog-migrations] Applying ${fileName}`);
      await applyMigration(client, environment.migrationsTable, fileName, sql);
    }

    console.log('[blog-migrations] All migrations applied successfully.');
  } finally {
    client.release();
    await closeBlogPool();
  }
}

main().catch((error) => {
  console.error('[blog-migrations] Failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
