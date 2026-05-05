import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Disclaimer | ZenithFCM',
  description: 'Read the ZenithFCM disclaimer and platform affiliation notice.',
  alternates: { canonical: '/disclaimer' },
  openGraph: {
    title: 'Disclaimer | ZenithFCM',
    description: 'Read the ZenithFCM disclaimer and platform affiliation notice.',
    url: `${siteUrl}/disclaimer`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function DisclaimerPage() {
  return (
    <StaticInfoPage
      title="Disclaimer"
      intro="ZenithFCM is a fan-operated informational platform built for FC Mobile users."
      sections={[
        {
          heading: 'Independent platform notice',
          body: (
            <p>
              ZenithFCM is not affiliated with, endorsed by, or officially connected to EA Sports. All game trademarks and brand names belong to
              their respective owners.
            </p>
          )
        },
        {
          heading: 'Data and content scope',
          body: (
            <p>
              Player, market, and tool outputs are provided for informational support. Availability and values can change based on in-game updates and
              external data sources.
            </p>
          )
        }
      ]}
    />
  );
}
