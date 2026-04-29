import {
  REDEEM_ROUTE_CONFIG,
  REDEEM_ROUTE_KEY,
  REDEEM_ROUTE_REVALIDATE_SECONDS,
  getRedeemRouteConfigByKey
} from './constants.mjs';
import { getCachedRedeemHubPageData } from './public.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toTextArray(values) {
  return Array.isArray(values) ? values.map((value) => toText(value)).filter(Boolean) : [];
}

export function parseRedeemSearchParam(searchParams, key, options = {}) {
  const rawValue = Array.isArray(searchParams?.[key]) ? searchParams[key][0] : searchParams?.[key];
  const normalized = toText(rawValue);
  if (!normalized) {
    return options.defaultValue || '';
  }

  if (Array.isArray(options.allowedValues) && options.allowedValues.length) {
    return options.allowedValues.includes(normalized) ? normalized : options.defaultValue || '';
  }

  return normalized.slice(0, options.maxLength || 160);
}

function buildLanguageAlternates() {
  return {
    'x-default': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path,
    en: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path,
    'en-x-today': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL_TODAY].path,
    'en-IN': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDIA].path,
    'id-ID': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path,
    'ms-MY': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path,
    'vi-VN': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.VIETNAM].path,
    'th-TH': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path,
    'en-PH': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PHILIPPINES].path,
    'en-US': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.USA].path,
    'ar-AE': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path
  };
}

export function buildRedeemRouteMetadata(routeConfig) {
  const canonicalPath = routeConfig?.path || REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path;
  const title = toText(routeConfig?.title, 'FC Mobile Redeem Codes | Zenith');
  const description = toText(routeConfig?.metaDescription);

  return {
    title,
    description,
    keywords: [toText(routeConfig?.primaryKeyword), ...toTextArray(routeConfig?.secondaryKeywords)].filter(Boolean),
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates()
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
      siteName: 'Zenith'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export async function getRedeemRoutePageData(routeKey, { search = '', section = 'all' } = {}) {
  const routeConfig = getRedeemRouteConfigByKey(routeKey);
  if (!routeConfig) {
    return null;
  }

  return getCachedRedeemHubPageData(routeConfig, search, section);
}

export { REDEEM_ROUTE_REVALIDATE_SECONDS };
