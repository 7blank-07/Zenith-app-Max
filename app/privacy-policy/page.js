import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Privacy Policy | ZenithFCM',
  description: 'Read the privacy policy for ZenithFCM.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | ZenithFCM',
    description: 'Read the privacy policy for ZenithFCM.',
    url: `${siteUrl}/privacy-policy`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <StaticInfoPage
      title="Privacy Policy"
      intro="ZenithFCM is committed to protecting user trust by minimizing data collection and using analytics responsibly."
      sections={[
        {
          heading: 'Information use',
          body: (
            <>
              <p>
                We use operational and analytics signals to improve platform performance, reliability, and content quality across ZenithFCM.
              </p>
              <p>We do not intentionally collect sensitive personal data beyond what is required for standard website operation.</p>
            </>
          )
        },
        {
          heading: 'Policy updates',
          body: (
            <p>
              This page may be updated as the platform evolves. Continued use of ZenithFCM indicates acceptance of the latest posted policy.
            </p>
          )
        }
      ]}
    />
  );
}
