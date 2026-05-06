import SiteChrome from '../SiteChrome';
import {
  REDEEM_ROUTE_KEY,
  getRedeemRouteConfigByKey
} from '../../../src/lib/server/redeem-codes/constants.mjs';
import {
  buildRedeemBreadcrumbSchema,
  buildRedeemCollectionSchema,
  buildRedeemFaqSchema,
  serializeJsonLd
} from '../../../src/lib/server/redeem-codes/schema.mjs';
import {
  buildRedeemRouteMetadata,
  getRedeemRoutePageData,
  parseRedeemSearchParam
} from '../../../src/lib/server/redeem-codes/seo.mjs';
import RedeemCodeHubPage from './RedeemCodeHubPage';

function sanitizeSchemaKey(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function resolveSearchParams(searchParams) {
  return Promise.resolve(searchParams || {});
}

function resolveSchemaLanguage(routeConfig) {
  if (typeof routeConfig?.locale === 'string' && routeConfig.locale.trim()) {
    return routeConfig.locale;
  }

  if (typeof routeConfig?.hreflang === 'string' && routeConfig.hreflang.trim()) {
    return routeConfig.hreflang;
  }

  return 'en';
}

async function renderRedeemRoutePage(routeConfig, searchParams = {}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const search = parseRedeemSearchParam(resolvedSearchParams, 'q', { maxLength: 160 });
  const section = parseRedeemSearchParam(resolvedSearchParams, 'section', {
    defaultValue: 'all',
    allowedValues: ['all', 'active', 'latest', 'expired']
  });

  const pageData = await getRedeemRoutePageData(routeConfig.key, {
    search,
    section
  });
  const schemaEntries = [...(pageData?.activeCodes || []), ...(pageData?.latestCodes || [])].slice(0, 30);
  const schemaLanguage = resolveSchemaLanguage(routeConfig);
  const collectionDescription = [routeConfig.intro, routeConfig.globalCodeNote].filter(Boolean).join(' ');
  const schemaKeyBase = sanitizeSchemaKey(routeConfig.key || REDEEM_ROUTE_KEY.GLOBAL);
  const schemas = [
    buildRedeemBreadcrumbSchema(routeConfig.breadcrumb, undefined, { inLanguage: schemaLanguage }),
    buildRedeemFaqSchema(pageData?.faq || [], { inLanguage: schemaLanguage }),
    pageData?.availability?.isConfigured === false
      ? null
      : buildRedeemCollectionSchema({
          title: routeConfig.h1,
          description: collectionDescription,
          path: routeConfig.path,
          entries: schemaEntries,
          inLanguage: schemaLanguage
        })
  ].filter(Boolean);

  return (
    <SiteChrome activeView="redeem">
      <main className="main-content redeem-main-content">
        {schemas.map((schema, index) => (
          <script
            key={`${schemaKeyBase}-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <RedeemCodeHubPage pageData={pageData} />
      </main>
    </SiteChrome>
  );
}

export function createRedeemRouteModule(routeKey) {
  const routeConfig = getRedeemRouteConfigByKey(routeKey);
  if (!routeConfig) {
    throw new Error(`Unknown redeem route key: ${routeKey}`);
  }

  return {
    async generateMetadata() {
      return buildRedeemRouteMetadata(routeConfig);
    },
    async Page({ searchParams = {} }) {
      return renderRedeemRoutePage(routeConfig, searchParams);
    }
  };
}
