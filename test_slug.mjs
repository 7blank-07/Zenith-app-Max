import 'dotenv/config';
import { resolvePlayerIdentifiersFromSlug } from './src/lib/server/player-seo-contract.mjs';

async function run() {
  try {
    const ids = await resolvePlayerIdentifiersFromSlug('eusebio-120-3114943');
    console.log('Resolved IDs:', ids);
  } catch (err) {
    console.error(err);
  }
}
run();
