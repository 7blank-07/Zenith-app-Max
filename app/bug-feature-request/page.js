import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const contactEmail = 'zenithfcm@gmail.com';

export const metadata = {
  title: 'Bug / Feature Request | ZenithFCM',
  description: 'Share bug reports, feature suggestions, and product improvements with ZenithFCM.',
  alternates: { canonical: '/bug-feature-request' },
  openGraph: {
    title: 'Bug / Feature Request | ZenithFCM',
    description: 'Share bug reports, feature suggestions, and product improvements with ZenithFCM.',
    url: `${siteUrl}/bug-feature-request`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function BugFeatureRequestPage() {
  return (
    <StaticInfoPage
      title="Bug / Feature Request"
      intro="ZenithFCM improves through community input. If something feels off or missing, tell us and help shape the next release."
      sections={[
        {
          heading: 'Send your ideas',
          body: (
            <>
              <p>
                Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with subject line <strong>ZenithFCM Feedback</strong>.
              </p>
              <ul>
                <li>Bug reports: include route, device, and what happened</li>
                <li>Feature suggestions: describe the player problem it solves</li>
                <li>Improvement ideas: UX, speed, and quality-of-life upgrades</li>
              </ul>
            </>
          )
        },
        {
          heading: 'High-impact areas',
          body: (
            <p>
              Useful feedback often comes from flows inside <Link href="/players">Players</Link>, <Link href="/market">Market</Link>,{' '}
              <Link href="/tools">Tools</Link>, and <Link href="/fc-mobile-redeem-codes">Redeem Codes</Link>.
            </p>
          )
        }
      ]}
    />
  );
}
