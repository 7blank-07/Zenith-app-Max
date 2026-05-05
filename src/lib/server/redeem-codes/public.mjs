import React from 'react';
import { getBlogEnvironment } from '../blog/env.mjs';
import { runBlogQuery } from '../blog/db.mjs';
import {
  REDEEM_CODE_SCOPE,
  REDEEM_CODE_STATUS,
  REDEEM_LAUNCHED_LINKS,
  REDEEM_ROUTE_KEY
} from './constants.mjs';
import { getNewestActiveRedeemCode, listPublicRedeemCodes } from './repository.mjs';

const { cache } = React;

const REDEEM_SETUP_TITLE = 'Redeem code CMS is not configured yet';
const REDEEM_SETUP_DESCRIPTION =
  'Set `BLOG_DATABASE_URL` (or `DATABASE_URL`), run `npm run db:migrate:blog`, and open /admin/redeem-codes to publish your first code.';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeSearch(value) {
  return toText(value).slice(0, 160);
}

function normalizeSection(value) {
  const normalized = toText(value).toLowerCase();
  return ['all', 'active', 'latest', 'expired'].includes(normalized) ? normalized : 'all';
}

function isSameUtcDate(left, right) {
  if (!(left instanceof Date) || Number.isNaN(left.getTime())) return false;
  if (!(right instanceof Date) || Number.isNaN(right.getTime())) return false;

  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export async function getRedeemPublicAvailability(rawEnv = process.env) {
  const { databaseUrl } = getBlogEnvironment(rawEnv);
  if (!databaseUrl) {
    return {
      isConfigured: false,
      title: REDEEM_SETUP_TITLE,
      description: REDEEM_SETUP_DESCRIPTION
    };
  }

  try {
    const result = await runBlogQuery(`SELECT to_regclass('public.redeem_codes') AS table_name`);
    const isConfigured = Boolean(result.rows[0]?.table_name);

    return {
      isConfigured,
      title: REDEEM_SETUP_TITLE,
      description: isConfigured ? '' : REDEEM_SETUP_DESCRIPTION
    };
  } catch (error) {
    console.error('[redeem-codes] availability check failed', {
      message: error instanceof Error ? error.message : String(error)
    });

    return {
      isConfigured: false,
      title: REDEEM_SETUP_TITLE,
      description: REDEEM_SETUP_DESCRIPTION
    };
  }
}

function resolveScopes(routeConfig) {
  if (routeConfig?.sharedGlobalCodes === true) {
    return [REDEEM_CODE_SCOPE.GLOBAL];
  }

  const scope = routeConfig?.scope || REDEEM_CODE_SCOPE.GLOBAL;
  if (scope === REDEEM_CODE_SCOPE.GLOBAL) {
    return [REDEEM_CODE_SCOPE.GLOBAL];
  }

  if (routeConfig?.includeGlobalScope === false) {
    return [scope];
  }

  return [REDEEM_CODE_SCOPE.GLOBAL, scope];
}

function sortByPublishedDate(input = []) {
  return [...(Array.isArray(input) ? input : [])].sort((left, right) =>
    String(right?.publishedAt || '').localeCompare(String(left?.publishedAt || ''))
  );
}

function sortExpiredByDate(input = []) {
  return [...(Array.isArray(input) ? input : [])].sort((left, right) => {
    const rightDate = right?.expiresAt || right?.publishedAt || '';
    const leftDate = left?.expiresAt || left?.publishedAt || '';
    return String(rightDate).localeCompare(String(leftDate));
  });
}

function resolveLatestUpdatedAt(input = []) {
  const timestamps = (Array.isArray(input) ? input : [])
    .map((entry) => entry?.updatedAt || entry?.publishedAt || entry?.expiresAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .map((value) => value.getTime());

  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : '';
}

function getFaqEntries(routeConfig) {
  if (Array.isArray(routeConfig?.faqEntries) && routeConfig.faqEntries.length) {
    return routeConfig.faqEntries;
  }

  const keyword = routeConfig?.primaryKeyword || 'fc mobile redeem codes';

  return [
    {
      question: `How often is ${keyword} updated on Zenith?`,
      answer:
        'We refresh listings whenever the editorial team publishes a new active code. Active entries appear first, while expired entries stay archived.'
    },
    {
      question: 'How do I use a redeem code safely?',
      answer:
        'Copy the code, redeem it on the official FC Mobile redemption flow, and avoid modified codes from unknown third-party sources.'
    },
    {
      question: 'Why can a code appear in expired section?',
      answer:
        'A code moves to expired when its campaign ends or when a newer active code replaces it in the same country scope.'
    }
  ];
}

function toSectionState(section) {
  const normalized = normalizeSection(section);
  return {
    value: normalized,
    showActive: normalized === 'all' || normalized === 'active',
    showLatest: normalized === 'all' || normalized === 'latest',
    showExpired: normalized === 'all' || normalized === 'expired'
  };
}

export async function getRedeemHubPageData(routeConfig, { search = '', section = 'all' } = {}) {
  const availability = await getRedeemPublicAvailability();
  const normalizedSearch = normalizeSearch(search);
  const selectedSection = toSectionState(section);
  const faq = getFaqEntries(routeConfig);

  if (!availability.isConfigured) {
    return {
      availability,
      route: routeConfig,
      links: REDEEM_LAUNCHED_LINKS,
      search: normalizedSearch,
      section: selectedSection,
      activeCodes: [],
      latestCodes: [],
      expiredCodes: [],
      updatedAt: '',
      faq
    };
  }

  const scopes = resolveScopes(routeConfig);
  const codes = await listPublicRedeemCodes({
    scopes,
    search: normalizedSearch,
    limit: 300
  });

  const activeCodes = sortByPublishedDate(codes.filter((entry) => entry.status === REDEEM_CODE_STATUS.ACTIVE)).slice(0, 16);
  const expiredCodes = sortExpiredByDate(codes.filter((entry) => entry.status === REDEEM_CODE_STATUS.EXPIRED)).slice(0, 24);
  const latestPool = routeConfig?.todayOnly
    ? sortByPublishedDate(
        codes.filter((entry) => {
          const publishedAt = entry?.publishedAt ? new Date(entry.publishedAt) : null;
          return isSameUtcDate(publishedAt, new Date());
        })
      )
    : sortByPublishedDate(codes);
  const latestCodes = latestPool.slice(0, 20);
  const updatedAt = resolveLatestUpdatedAt([...activeCodes, ...latestCodes, ...expiredCodes]);

  return {
    availability,
    route: routeConfig,
    links: REDEEM_LAUNCHED_LINKS,
    search: normalizedSearch,
    section: selectedSection,
    activeCodes,
    latestCodes,
    expiredCodes,
    updatedAt,
    faq
  };
}

export const getCachedRedeemHubPageData = cache(async (routeConfig, search = '', section = 'all') =>
  getRedeemHubPageData(routeConfig, { search, section })
);

export async function getHomeRedeemCodeWidgetData() {
  const availability = await getRedeemPublicAvailability();
  if (!availability.isConfigured) {
    return {
      availability,
      code: null
    };
  }

  const code = await getNewestActiveRedeemCode({ scopes: [REDEEM_CODE_SCOPE.GLOBAL] });
  return {
    availability,
    code
  };
}

export function getRedeemRouteScopeGroup(routeKey) {
  if (routeKey === REDEEM_ROUTE_KEY.GLOBAL || routeKey === REDEEM_ROUTE_KEY.GLOBAL_TODAY) {
    return [REDEEM_CODE_SCOPE.GLOBAL];
  }

  if (routeKey === REDEEM_ROUTE_KEY.INDIA) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.INDIA];
  }

  if (routeKey === REDEEM_ROUTE_KEY.INDONESIA) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.INDONESIA];
  }

  if (routeKey === REDEEM_ROUTE_KEY.MALAYSIA) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.MALAYSIA];
  }

  if (routeKey === REDEEM_ROUTE_KEY.VIETNAM) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.VIETNAM];
  }

  if (routeKey === REDEEM_ROUTE_KEY.THAILAND) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.THAILAND];
  }

  if (routeKey === REDEEM_ROUTE_KEY.PHILIPPINES) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.PHILIPPINES];
  }

  if (routeKey === REDEEM_ROUTE_KEY.USA) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.USA];
  }

  if (routeKey === REDEEM_ROUTE_KEY.UAE) {
    return [REDEEM_CODE_SCOPE.GLOBAL, REDEEM_CODE_SCOPE.UAE];
  }

  return [REDEEM_CODE_SCOPE.GLOBAL];
}
