import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const contactEmail = 'zenithfcm@gmail.com';

export const metadata = {
  title: 'Contact | ZenithFCM',
  description: 'Get in touch with ZenithFCM for feedback, collaboration, and platform-related support.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | ZenithFCM',
    description: 'Get in touch with ZenithFCM for feedback, collaboration, and platform-related support.',
    url: `${siteUrl}/contact`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function ContactPage() {
  return (
    <StaticInfoPage
      title="Contact ZenithFCM"
      intro="We welcome partnerships, support questions, and platform feedback from the FC Mobile community."
      sections={[
        {
          heading: 'Primary contact',
          body: (
            <>
              <p>Email us directly for all platform inquiries:</p>
              <p>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
            </>
          )
        },
        {
          heading: 'What to include',
          body: (
            <ul>
              <li>Your page URL or route, if relevant</li>
              <li>A short description of your request</li>
              <li>Screenshots or context that helps us reproduce the issue quickly</li>
            </ul>
          )
        }
      ]}
    />
  );
}
