import { closeBlogPool } from '../../src/lib/server/blog/db.mjs';
import { getBlogEnvironment } from '../../src/lib/server/blog/env.mjs';
import {
  getBlogBootstrapUserConfig,
  seedBlogBootstrapUsers
} from '../../src/lib/server/blog/auth.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function parseArgs(argv) {
  const config = {
    dryRun: false,
    admin: {},
    editor: {}
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

    if (key.startsWith('admin-')) {
      config.admin[key.replace('admin-', '').replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
      continue;
    }

    if (key.startsWith('editor-')) {
      config.editor[key.replace('editor-', '').replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
    }
  }

  return config;
}

function mergeUserConfig(baseConfig, overrides) {
  return {
    ...baseConfig,
    name: toText(overrides.name) || baseConfig.name,
    email: toText(overrides.email) || baseConfig.email,
    password: toText(overrides.password) || baseConfig.password
  };
}

function validateBootstrapUser(user, label) {
  if (!user.email) {
    throw new Error(`${label} email is required. Use env vars or CLI flags before seeding blog users.`);
  }

  if (!user.password) {
    throw new Error(`${label} password is required. Use env vars or CLI flags before seeding blog users.`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const defaults = getBlogBootstrapUserConfig(process.env);
  const environment = getBlogEnvironment(process.env);

  const config = {
    admin: mergeUserConfig(defaults.admin, args.admin),
    editor: mergeUserConfig(defaults.editor, args.editor)
  };

  validateBootstrapUser(config.admin, 'Admin user');
  validateBootstrapUser(config.editor, 'Editor user');

  console.log('[blog-users] Admin email:', config.admin.email);
  console.log('[blog-users] Editor email:', config.editor.email);

  if (args.dryRun) {
    console.log('[blog-users] Dry run complete. No database changes were made.');
    return;
  }

  if (!environment.databaseUrl) {
    throw new Error('DATABASE_URL is required to seed blog users.');
  }

  const result = await seedBlogBootstrapUsers(config);

  console.log('[blog-users] Seeded admin user:', result.admin?.email || 'unknown');
  console.log('[blog-users] Seeded editor user:', result.editor?.email || 'unknown');
}

main()
  .catch((error) => {
    console.error('[blog-users] Failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closeBlogPool();
    } catch {
      // noop
    }
  });
