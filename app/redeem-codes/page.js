import { Suspense } from 'react';
import SiteChrome from '../components/SiteChrome';
import RedeemCodesInteractions from '../components/RedeemCodesInteractions.client';
import redeemCodesData from '../../src/data/redeemCodes.json';

// ISR: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Redeem Codes | Zenith',
  description: 'Working FC Mobile redeem codes with rewards. Updated regularly. Copy codes instantly and claim your rewards.',
  alternates: { canonical: '/redeem-codes' },
  openGraph: {
    title: 'Redeem Codes | Zenith',
    description: 'Working FC Mobile redeem codes with rewards. Updated regularly.',
    url: `${siteUrl}/redeem-codes`,
    siteName: 'Zenith',
    type: 'website'
  }
};

export default async function RedeemCodesPage() {
  // In a real app, you'd fetch from an API or database
  // For now, we're loading from the JSON file
  const codes = redeemCodesData.codes;

  return (
    <SiteChrome activeView="redeem-codes">
      <main className="main-content">
        {/* Page Header */}
        <div className="view-header">
          <h1>Redeem Codes</h1>
          <p className="view-subtitle">Working FC Mobile codes — updated regularly</p>
        </div>

        {/* Content */}
        <div className="codes-container">
          <Suspense fallback={<div className="codes-loading">Loading codes...</div>}>
            <RedeemCodesInteractions codes={codes} />
          </Suspense>
        </div>

        {/* Additional Info Section */}
        <div className="codes-info-section">
          <div className="info-card">
            <h3>How to Redeem</h3>
            <ol className="info-list">
              <li>Copy a code from the list below</li>
              <li>Open EA Sports FC Mobile</li>
              <li>Go to Settings → Redeem Code</li>
              <li>Paste the code and claim your reward</li>
            </ol>
          </div>

          <div className="info-card">
            <h3>Tips</h3>
            <ul className="info-list">
              <li>Codes are case-sensitive</li>
              <li>Check the expiry date before redeeming</li>
              <li>Each code can be used only once per account</li>
              <li>Follow our Twitter for new codes</li>
            </ul>
          </div>
        </div>
      </main>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: 'FC Mobile Redeem Codes',
            description: 'Working redeem codes for EA Sports FC Mobile with rewards',
            url: `${siteUrl}/redeem-codes`,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: codes.slice(0, 10).map((code, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: code.code,
                description: code.reward
              }))
            }
          })
        }}
      />
    </SiteChrome>
  );
}
