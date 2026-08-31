import { listRedirects } from '../src/lib/server/redirects/repository.mjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const redirects = await listRedirects();
    console.log(JSON.stringify(redirects, null, 2));
  } catch (err) {
    console.error("Error fetching redirects:", err);
  }
  process.exit(0);
}

run();
