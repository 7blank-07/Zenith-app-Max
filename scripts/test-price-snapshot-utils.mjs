import assert from 'node:assert/strict';
import {
  parseCapturedAtToMs,
  getPriceForRankWithFallback,
  selectLatestSnapshotWithPrice,
  buildHistorySnapshots
} from '../src/lib/server/price-snapshot-utils.mjs';

function testParseCapturedAtToMs() {
  const iso = parseCapturedAtToMs('2025-03-30T10:30:00Z');
  assert.equal(Number.isFinite(iso), true, 'ISO date should parse');

  const us = parseCapturedAtToMs('03/30/2025 10:30:00');
  assert.equal(Number.isFinite(us), true, 'US date should parse');

  const invalid = parseCapturedAtToMs('not-a-date');
  assert.equal(Number.isNaN(invalid), true, 'Invalid date should be NaN');
}

function testPriceFallback() {
  const row = { price0: null, price1: 1000, price2: 1200, price3: null, price4: null, price5: null };
  const direct = getPriceForRankWithFallback(row, 2);
  assert.deepEqual(direct, { value: 1200, resolvedRank: 2 }, 'Preferred rank should be used when present');

  const fallbackDown = getPriceForRankWithFallback(row, 3);
  assert.deepEqual(fallbackDown, { value: 1200, resolvedRank: 2 }, 'Should fallback to nearest lower rank first');

  const fallbackUp = getPriceForRankWithFallback({ price0: null, price1: null, price2: 1500 }, 0);
  assert.deepEqual(fallbackUp, { value: 1500, resolvedRank: 2 }, 'Should fallback upward when lower ranks are missing');
}

function testLatestSelection() {
  const rows = [
    { asset_id: 1, captured_at: '2025-03-29T10:00:00Z', price0: null, price1: 900, price2: null, price3: null, price4: null, price5: null },
    { asset_id: 1, captured_at: '2025-03-30T10:00:00Z', price0: null, price1: 1100, price2: null, price3: null, price4: null, price5: null }
  ];
  const latest = selectLatestSnapshotWithPrice(rows, 1);
  assert.equal(latest?.row?.captured_at, '2025-03-30T10:00:00Z', 'Latest captured_at should win');
  assert.equal(latest?.price?.value, 1100, 'Latest price value should be returned');
}

function testLatestSelectionWithFallbackRank() {
  const rows = [
    { asset_id: 1, captured_at: '2025-03-29T10:00:00Z', price0: 900, price1: null, price2: null, price3: null, price4: null, price5: null },
    { asset_id: 1, captured_at: '2025-03-30T10:00:00Z', price0: 1200, price1: null, price2: null, price3: null, price4: null, price5: null }
  ];
  const latest = selectLatestSnapshotWithPrice(rows, 3);
  assert.equal(latest?.row?.captured_at, '2025-03-30T10:00:00Z', 'Latest row should still be selected with fallback rank');
  assert.equal(latest?.price?.resolvedRank, 0, 'Fallback should resolve to rank 0 when requested rank is missing');
  assert.equal(latest?.price?.value, 1200, 'Fallback latest value should be returned');
}

function testHistorySnapshots() {
  const rows = [
    { captured_at: '2025-03-28T00:00:00Z', price0: null, price1: 800, price2: null, price3: null, price4: null, price5: null },
    { captured_at: '2025-03-30T00:00:00Z', price0: null, price1: null, price2: 1200, price3: null, price4: null, price5: null },
    { captured_at: 'invalid', price0: 700, price1: null, price2: null, price3: null, price4: null, price5: null }
  ];

  const snapshots = buildHistorySnapshots(rows, 1);
  assert.equal(snapshots.length, 2, 'Only valid dated rows with price should survive');
  assert.equal(snapshots[0].capturedAt, '2025-03-28T00:00:00Z', 'Snapshots should be ascending by date');
  assert.equal(snapshots[1].resolvedRank, 2, 'Should fallback to available rank when preferred is missing');

  const startMs = Date.parse('2025-03-29T00:00:00Z');
  const filtered = buildHistorySnapshots(rows, 1, { startMs });
  assert.equal(filtered.length, 1, 'Range filter should reduce snapshot set');
  assert.equal(filtered[0].capturedAt, '2025-03-30T00:00:00Z', 'Filtered snapshot should be the in-range row');
}

function run() {
  testParseCapturedAtToMs();
  testPriceFallback();
  testLatestSelection();
  testLatestSelectionWithFallbackRank();
  testHistorySnapshots();
  console.log('price-snapshot-utils tests passed');
}

run();
