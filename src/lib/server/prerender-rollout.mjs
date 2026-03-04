const MAX_PRERENDER_LIMIT = 10000;

const PRERENDER_TIER_LIMITS = Object.freeze({
  '1k': 1000,
  '5k': 5000,
  '10k': 10000
});

function normalizeTier(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^tier[-_]?/, '');
  if (normalized === '1k' || normalized === '1000') return '1k';
  if (normalized === '5k' || normalized === '5000') return '5k';
  if (normalized === '10k' || normalized === '10000') return '10k';
  return null;
}

function parseExplicitLimit() {
  const parsed = Number.parseInt(process.env.TOP_PLAYERS_PRERENDER_LIMIT || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(parsed, MAX_PRERENDER_LIMIT);
}

export function getPlayerPrerenderLimit() {
  const tier = normalizeTier(process.env.PRERENDER_TIER);
  if (tier) return PRERENDER_TIER_LIMITS[tier];

  const explicitLimit = parseExplicitLimit();
  if (explicitLimit) return explicitLimit;

  return MAX_PRERENDER_LIMIT;
}

export function getPrerenderRolloutState() {
  const tier = normalizeTier(process.env.PRERENDER_TIER) || '10k';
  const limit = getPlayerPrerenderLimit();
  const nextTier = tier === '1k' ? '5k' : tier === '5k' ? '10k' : null;

  return {
    tier,
    limit,
    nextTier,
    maxLimit: MAX_PRERENDER_LIMIT
  };
}
