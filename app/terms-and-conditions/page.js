import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Terms & Conditions | ZenithFCM',
  description: 'Read the terms and conditions for using ZenithFCM.',
  alternates: { canonical: '/terms-and-conditions' },
  openGraph: {
    title: 'Terms & Conditions | ZenithFCM',
    description: 'Read the terms and conditions for using ZenithFCM.',
    url: `${siteUrl}/terms-and-conditions`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function TermsAndConditionsPage() {
  return (
    <StaticInfoPage
      title="Terms & Conditions"
      intro="By using ZenithFCM, you agree to use the platform lawfully and in good faith within the FC Mobile community."
      sections={[
        {
          heading: 'Usage expectations',
          body: (
            <ul>
              <li>Use ZenithFCM content and tools for personal, informational, and non-abusive purposes</li>
              <li>Do not attempt to disrupt, overload, or exploit platform services</li>
              <li>Respect community standards when submitting feedback or requests</li>
            </ul>
          )
        },
        {
          heading: 'Service scope',
          body: (
            <p>
              We continuously improve data accuracy and functionality, but platform features may evolve, change, or be retired without prior notice.
            </p>
          )
        }
      ]}
    />
  );
}
