import { REDEEM_SCOPE_TO_PUBLISHED_PATHS } from './constants.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizePath(pathValue) {
  const trimmed = toText(pathValue);
  return trimmed.startsWith('/') ? trimmed : '';
}

function addScopePaths(target, scope) {
  const paths = REDEEM_SCOPE_TO_PUBLISHED_PATHS[toText(scope)];
  for (const path of Array.isArray(paths) ? paths : []) {
    const normalized = normalizePath(path);
    if (normalized) target.add(normalized);
  }
}

export function buildRedeemRevalidationPaths({ previousCode = null, nextCode = null, extraPaths = [] } = {}) {
  const targetPaths = new Set([
    '/',
    '/sitemap.xml',
    '/fc-mobile-redeem-codes'
  ]);

  addScopePaths(targetPaths, previousCode?.scope);
  addScopePaths(targetPaths, nextCode?.scope);

  for (const entry of Array.isArray(extraPaths) ? extraPaths : []) {
    const normalized = normalizePath(entry);
    if (normalized) targetPaths.add(normalized);
  }

  return [...targetPaths];
}

export function buildRedeemRevalidationPathsFromPayload(body = {}) {
  return buildRedeemRevalidationPaths({
    previousCode: body.previousRedeemCode || body.previousCode,
    nextCode: body.redeemCode || body.nextCode,
    extraPaths: body.redeemPaths || []
  });
}
