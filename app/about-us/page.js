import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'About Us | ZenithFCM',
  description: 'Learn about ZenithFCM, the FC Mobile database, market, and tools platform built for the community.',
  alternates: { canonical: '/about-us' },
  openGraph: {
    title: 'About Us | ZenithFCM',
    description: 'Learn about ZenithFCM, the FC Mobile database, market, and tools platform built for the community.',
    url: `${siteUrl}/about-us`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function AboutUsPage() {
  return (
    <StaticInfoPage
      title="About ZenithFCM"
      intro="ZenithFCM is a fan-built FC Mobile platform focused on practical data, live market visibility, and tools that help players make better squad decisions."
      sections={[
        {
          heading: 'What we build',
          body: (
            <>
              <p>
                We combine a player database, market insights, redeem code coverage, and gameplay tools in one streamlined experience.
              </p>
              <p>
                Every release is shaped around speed, clarity, and utility so you can move from browsing to decision-making quickly.
              </p>
            </>
          )
        },
        {
          heading: 'Our product direction',
          body: (
            <>
              <p>
                ZenithFCM prioritizes a clean interface, mobile reliability, and trustworthy FC Mobile data surfaces.
              </p>
              <p>
                Explore live pages on <Link href="/players">Players</Link>, <Link href="/market">Market</Link>,{' '}
                <Link href="/tools">Tools</Link>, and <Link href="/blogs">Blogs</Link>.
              </p>
            </>
          )
        }
      ]}
    />
  );
}
