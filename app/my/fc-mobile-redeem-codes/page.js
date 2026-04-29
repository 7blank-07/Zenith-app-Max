import SiteChrome from '../../components/SiteChrome';
import RedeemCodeHubPage from '../../components/redeem/RedeemCodeHubPage';
import { REDEEM_ROUTE_KEY, getRedeemRouteConfigByKey } from '../../../src/lib/server/redeem-codes/constants.mjs';
import { buildRedeemCollectionSchema, buildRedeemBreadcrumbSchema, buildRedeemFaqSchema, serializeJsonLd } from '../../../src/lib/server/redeem-codes/schema.mjs';
import {
  REDEEM_ROUTE_REVALIDATE_SECONDS,
  buildRedeemRouteMetadata,
  getRedeemRoutePageData,
  parseRedeemSearchParam
} from '../../../src/lib/server/redeem-codes/seo.mjs';

export const revalidate = REDEEM_ROUTE_REVALIDATE_SECONDS;

const routeConfig = getRedeemRouteConfigByKey(REDEEM_ROUTE_KEY.MALAYSIA);

export async function generateMetadata() {
  return buildRedeemRouteMetadata(routeConfig);
}

export default async function RedeemCodesMalaysiaPage({ searchParams = {} }) {
  const search = parseRedeemSearchParam(searchParams, 'q', { maxLength: 160 });
  const section = parseRedeemSearchParam(searchParams, 'section', {
    defaultValue: 'all',
    allowedValues: ['all', 'active', 'latest', 'expired']
  });

  const pageData = await getRedeemRoutePageData(REDEEM_ROUTE_KEY.MALAYSIA, {
    search,
    section
  });

  const schemaEntries = [...(pageData?.activeCodes || []), ...(pageData?.latestCodes || [])].slice(0, 30);
  const schemas = [
    buildRedeemBreadcrumbSchema(routeConfig.breadcrumb),
    buildRedeemFaqSchema(pageData?.faq || []),
    pageData?.availability?.isConfigured === false
      ? null
      : buildRedeemCollectionSchema({
          title: routeConfig.h1,
          description: routeConfig.intro,
          path: routeConfig.path,
          entries: schemaEntries
        })
  ].filter(Boolean);

  return (
    <SiteChrome activeView="home">
      <main className="main-content">
        {schemas.map((schema, index) => (
          <script
            key={`redeem-malaysia-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <RedeemCodeHubPage pageData={pageData} />
      </main>
    </SiteChrome>
  );
}
