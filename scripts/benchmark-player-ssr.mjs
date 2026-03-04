import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import {
  PLAYER_PAGE_REVALIDATE_SECONDS,
  PLAYER_SEO_FIELDS,
  PLAYER_STABLE_RECORD_FIELDS,
  resolvePlayerSeoContract
} from '../src/lib/server/player-seo-contract.mjs';

const DEFAULT_SAMPLES = 50;
const DEFAULT_MOCK_LATENCY_MS = 120;
const DEFAULT_START_ID = 100000;

function parseArgs(argv) {
  const parsed = {
    mode: 'auto',
    samples: DEFAULT_SAMPLES,
    startId: DEFAULT_START_ID,
    rank: 0,
    baseUrl: process.env.ZENITH_API_BASE_URL || 'https://zenithfcm.com/api',
    mockLatencyMs: DEFAULT_MOCK_LATENCY_MS,
    siteName: 'Zenith',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.split('=');
    const key = rawKey.slice(2);
    let value = inlineValue;

    if (value === undefined && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      value = argv[index + 1];
      index += 1;
    }

    if (key === 'mode' && value) parsed.mode = value;
    if (key === 'samples' && value) parsed.samples = Number.parseInt(value, 10);
    if (key === 'start-id' && value) parsed.startId = Number.parseInt(value, 10);
    if (key === 'rank' && value) parsed.rank = Number.parseInt(value, 10);
    if (key === 'base-url' && value) parsed.baseUrl = value;
    if (key === 'mock-latency-ms' && value) parsed.mockLatencyMs = Number.parseInt(value, 10);
    if (key === 'site-name' && value) parsed.siteName = value;
    if (key === 'site-url' && value) parsed.siteUrl = value;
    if (key === 'output' && value) parsed.outputPath = value;
  }

  parsed.samples = Number.isFinite(parsed.samples) && parsed.samples > 0 ? parsed.samples : DEFAULT_SAMPLES;
  parsed.startId = Number.isFinite(parsed.startId) ? parsed.startId : DEFAULT_START_ID;
  parsed.rank = Number.isFinite(parsed.rank) ? parsed.rank : 0;
  parsed.mockLatencyMs = Number.isFinite(parsed.mockLatencyMs) && parsed.mockLatencyMs >= 0
    ? parsed.mockLatencyMs
    : DEFAULT_MOCK_LATENCY_MS;

  return parsed;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function estimateBuildMinutes(avgMs, pageCount, concurrency) {
  if (!avgMs || !concurrency) return 0;
  const totalMs = (avgMs * pageCount) / concurrency;
  return totalMs / 60000;
}

function recommendInitialTier(avgMs, p95Ms) {
  if (avgMs <= 200 && p95Ms <= 320) {
    return { initialTier: 5000, nextTier: 10000, rationale: 'Healthy latency; start at 5k and scale to 10k after one stable deploy.' };
  }
  if (avgMs <= 350 && p95Ms <= 500) {
    return { initialTier: 1000, nextTier: 5000, rationale: 'Moderate latency; start conservative and scale in two stages.' };
  }
  return { initialTier: 1000, nextTier: 1000, rationale: 'High latency; optimize fetch/render path before scaling.' };
}

function createSampleIds(count, startId) {
  return Array.from({ length: count }, (_, index) => String(startId + index));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createMockFetch(mockLatencyMs) {
  return async function mockFetch(url) {
    await sleep(mockLatencyMs + Math.floor(Math.random() * 25));
    const urlValue = typeof url === 'string' ? url : url.toString();
    const idMatch = urlValue.match(/\/players\/([^/?]+)/i);
    const playerId = decodeURIComponent(idMatch?.[1] || '0');
    const numericId = Number.parseInt(playerId, 10) || 0;
    const payload = {
      data: {
        player_id: playerId,
        name: `Benchmark Player ${playerId}`,
        ovr: 80 + (numericId % 20),
        position: ['GK', 'CB', 'CM', 'RW', 'ST'][numericId % 5],
        image: `https://example.com/player/${playerId}.png`,
        summary: `Synthetic benchmark payload for ${playerId}.`,
        rank: numericId % 6,
        is_untradable: numericId % 2 === 0
      }
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
}

async function loadRouteBaseline() {
  const require = createRequire(import.meta.url);
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfig = require(nextConfigPath);
  const rewrites = typeof nextConfig.rewrites === 'function' ? await nextConfig.rewrites() : [];
  const trackedRoutes = ['/players', '/player/:id', '/market'];

  return trackedRoutes.map((route) => {
    const match = rewrites.find((rewrite) => rewrite.source === route);
    return { route, rewriteTarget: match ? match.destination : '(none)' };
  });
}

async function loadMetadataBaseline() {
  const layoutPath = path.join(process.cwd(), 'app', 'layout.js');
  const layoutSource = await fs.readFile(layoutPath, 'utf8');
  const titleMatch = layoutSource.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const descriptionMatch = layoutSource.match(/description:\s*['"`]([^'"`]+)['"`]/);
  return {
    title: titleMatch ? titleMatch[1] : '(not found)',
    description: descriptionMatch ? descriptionMatch[1] : '(not found)'
  };
}

async function resolveBenchmarkMode(config) {
  if (config.mode === 'mock') {
    return { mode: 'mock', fetchImpl: createMockFetch(config.mockLatencyMs) };
  }

  if (config.mode === 'live') {
    return { mode: 'live', fetchImpl: globalThis.fetch };
  }

  const probeId = String(config.startId);
  try {
    await resolvePlayerSeoContract(probeId, {
      rank: config.rank,
      baseUrl: config.baseUrl,
      fetchImpl: globalThis.fetch,
      metadataOptions: { siteName: config.siteName, siteUrl: config.siteUrl }
    });
    return { mode: 'live', fetchImpl: globalThis.fetch };
  } catch (error) {
    return {
      mode: 'mock',
      fetchImpl: createMockFetch(config.mockLatencyMs),
      warning: `Live probe failed (${error.message}). Falling back to mock mode.`
    };
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const modeSelection = await resolveBenchmarkMode(args);
  const routeBaseline = await loadRouteBaseline();
  const metadataBaseline = await loadMetadataBaseline();
  const sampleIds = createSampleIds(args.samples, args.startId);

  const durations = [];
  let failures = 0;

  for (const playerId of sampleIds) {
    const startedAt = performance.now();
    try {
      const { record, metadata } = await resolvePlayerSeoContract(playerId, {
        rank: args.rank,
        baseUrl: args.baseUrl,
        fetchImpl: modeSelection.fetchImpl,
        metadataOptions: { siteName: args.siteName, siteUrl: args.siteUrl }
      });

      if (!record.playerId || !metadata.title) {
        throw new Error('Contract validation failed: missing playerId/title');
      }
      durations.push(performance.now() - startedAt);
    } catch (error) {
      failures += 1;
      console.error(`[benchmark] player ${playerId} failed: ${error.message}`);
    }
  }

  const avgMs = average(durations);
  const p95Ms = percentile(durations, 0.95);
  const recommendation = recommendInitialTier(avgMs, p95Ms);
  const buildEstimate = {
    pages1000At10WorkersMinutes: estimateBuildMinutes(avgMs, 1000, 10),
    pages5000At10WorkersMinutes: estimateBuildMinutes(avgMs, 5000, 10),
    pages10000At10WorkersMinutes: estimateBuildMinutes(avgMs, 10000, 10)
  };

  const report = {
    phase: 1,
    benchmarkMode: modeSelection.mode,
    warning: modeSelection.warning,
    samplesRequested: args.samples,
    samplesCompleted: durations.length,
    failures,
    avgMs: Number(avgMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
    recommendation,
    buildEstimateMinutesAt10Workers: Object.fromEntries(
      Object.entries(buildEstimate).map(([key, value]) => [key, Number(value.toFixed(2))])
    ),
    routeBaseline,
    metadataBaseline,
    revalidateSeconds: PLAYER_PAGE_REVALIDATE_SECONDS,
    stableRecordFields: PLAYER_STABLE_RECORD_FIELDS,
    seoFields: PLAYER_SEO_FIELDS
  };

  if (args.outputPath) {
    const outputPath = path.isAbsolute(args.outputPath)
      ? args.outputPath
      : path.join(process.cwd(), args.outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log('=== Phase 1 Benchmark Report ===');
  if (report.warning) console.log(`Warning: ${report.warning}`);
  console.log(`Mode: ${report.benchmarkMode}`);
  console.log(`Samples: ${report.samplesCompleted}/${report.samplesRequested} (failures: ${report.failures})`);
  console.log(`Average: ${report.avgMs}ms`);
  console.log(`P95: ${report.p95Ms}ms`);
  console.log(`Initial tier: ${report.recommendation.initialTier}`);
  console.log(`Next tier: ${report.recommendation.nextTier}`);
  console.log(`Rationale: ${report.recommendation.rationale}`);
  console.log('Route baseline:', report.routeBaseline);
  console.log('Metadata baseline:', report.metadataBaseline);
  console.log('Build estimates @10 workers (minutes):', report.buildEstimateMinutesAt10Workers);
}

run().catch((error) => {
  console.error('[benchmark] Phase 1 benchmark failed:', error);
  process.exitCode = 1;
});
