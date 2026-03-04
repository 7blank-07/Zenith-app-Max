import { getPrerenderRolloutState } from '../src/lib/server/prerender-rollout.mjs';
import { readTopPlayerIds } from '../src/lib/server/top-players.mjs';

async function run() {
  const rollout = getPrerenderRolloutState();
  const availableIds = await readTopPlayerIds(10000);
  const cappedCount = Math.min(rollout.limit, availableIds.length);

  console.log('[rollout-status] current tier:', rollout.tier);
  console.log('[rollout-status] prerender limit:', rollout.limit);
  console.log('[rollout-status] available top-player IDs:', availableIds.length);
  console.log('[rollout-status] pages prerendered this tier:', cappedCount);
  console.log('[rollout-status] next tier:', rollout.nextTier || 'none');
  console.log('[rollout-status] note: uncached new-player pages are generated on first request and cached afterward.');
}

run().catch((error) => {
  console.error(`[rollout-status] failed: ${error.message}`);
  process.exitCode = 1;
});
