import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const contactEmail = 'zenithfcmofficial@gmail.com';

export const metadata = {
  title: 'Bug & Feature Requests | Help Us Improve ZenithFCM',
  description: 'Found a bug or have an idea for a new feature? Share your feedback with the ZenithFCM team and help us build the best FC Mobile tools.',
  alternates: { canonical: '/bug-feature-request' },
  openGraph: {
    title: 'Bug & Feature Requests | ZenithFCM',
    description: 'Report issues or suggest new features for ZenithFCM.',
    url: `${siteUrl}/bug-feature-request`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function BugFeatureRequestPage() {
  return (
    <StaticInfoPage
      title="Bug & Feature Requests"
      intro="ZenithFCM is built for the community. Your reports and suggestions directly shape the future of our platform."
      sections={[
        {
          heading: 'Reporting a Bug',
          body: (
            <>
              <p>
                If you encounter a technical issue or data error, please email us at <a href={`mailto:${contactEmail}`} style={{ color: '#2dd5c0' }}>{contactEmail}</a> with the subject <strong>"Bug Report"</strong>.
              </p>
              <p>Please include as much detail as possible:</p>
              <ul>
                <li>The page or tool where the bug occurred.</li>
                <li>Your device type (e.g., iPhone 15, Android Tablet) and browser.</li>
                <li>Steps to reproduce the issue.</li>
                <li>Any screenshots that might help us understand the problem.</li>
              </ul>
            </>
          )
        },
        {
          heading: 'Requesting a Feature',
          body: (
            <>
              <p>
                Have an idea for a new tool or improvement? We love hearing new concepts! Send your ideas to <a href={`mailto:${contactEmail}`} style={{ color: '#2dd5c0' }}>{contactEmail}</a> with the subject <strong>"Feature Request"</strong>.
              </p>
              <p>Tell us about:</p>
              <ul>
                <li>The specific problem the feature would solve.</li>
                <li>How it would benefit other FC Mobile players.</li>
                <li>Any similar tools or examples you've seen.</li>
              </ul>
            </>
          )
        },
        {
          heading: 'High-Impact Focus',
          body: (
            <p>
              We are currently prioritizing improvements to our <Link href="/players" style={{ color: '#2dd5c0' }}>Player Database</Link>, <Link href="/market" style={{ color: '#2dd5c0' }}>Market Analysis Tools</Link>, and the <Link href="/squad-builder" style={{ color: '#2dd5c0' }}>Squad Builder</Link>.
            </p>
          )
        },
        {
          heading: 'Our Process',
          body: (
            <p>
              Our team reviews every piece of feedback. While we can't implement every suggestion immediately, we track all requests and prioritize them based on community impact and technical feasibility.
            </p>
          )
        }
      ]}
    />
  );
}
