import { resolvePlayerIdentifiersFromSlug } from './src/lib/server/player-seo-contract.mjs';
import { buildPlayerSlug, parsePlayerSlug } from './src/lib/player-slug.mjs';

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function assertThrows(name, fn, expectedMsg) {
    try {
      await fn();
      console.error(`[FAIL] ${name} - Expected to throw`);
      failed++;
    } catch (e) {
      if (e.message.includes(expectedMsg)) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name} - Threw unexpected error: ${e.message}`);
        failed++;
      }
    }
  }

  async function assertResolves(name, fn, expected) {
    try {
      const res = await fn();
      if (res.playerId === expected.playerId && res.recordId === expected.recordId) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name} - Expected ${JSON.stringify(expected)} but got ${JSON.stringify(res)}`);
        failed++;
      }
    } catch (e) {
      console.error(`[FAIL] ${name} - Threw unexpected error: ${e.message}`);
      failed++;
    }
  }

  // 1. Valid UUID suffix lookup
  await assertResolves('Valid UUID suffix lookup', 
    () => resolvePlayerIdentifiersFromSlug('player-name-120-0201201'), 
    { playerId: '0f371ac6376d2ab86bfe697773730201', recordId: '0f371ac6376d2ab86bfe697773730201' }
  );

  // 2. Non-existent player slug suffix
  await assertThrows('Non-existent slug should throw graceful 404 error', 
    () => resolvePlayerIdentifiersFromSlug('fake-player-99-9999999'), 
    'Player slug could not be resolved'
  );

  // 3. Invalid slug format
  await assertThrows('Empty slug object throws', 
    () => resolvePlayerIdentifiersFromSlug('invalid---123'), 
    'Invalid player slug'
  );

  // 4. Legacy pure-integer slug bypasses DB
  await assertResolves('Legacy pure-integer slug bypasses DB', 
    () => resolvePlayerIdentifiersFromSlug('20180903'), 
    { playerId: '20180903', recordId: '' }
  );

  // 5. Build slug from vision_players UUID
  const slug5 = buildPlayerSlug({
    name: 'Lionel Messi',
    ovr: 120,
    playerId: '0f371ac6-376d-4ab8-6bfe-697773730201',
    recordId: '0f371ac6-376d-4ab8-6bfe-697773730201'
  });
  if (slug5 === 'lionel-messi-120-0201201') {
    console.log('[PASS] Build slug correctly extracts numeric suffix from UUID');
    passed++;
  } else {
    console.error(`[FAIL] Build slug failed for UUID. Got: ${slug5}`);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
