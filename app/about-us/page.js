import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'About ZenithFCM | Built for the FC Mobile Community',
  description: 'Learn more about ZenithFCM, a fan-built platform dedicated to providing the FC Mobile community with smarter tools, reliable data, and market insights.',
  alternates: { canonical: '/about-us' },
  openGraph: {
    title: 'About ZenithFCM | ZenithFCM',
    description: 'Learn how ZenithFCM simplifies FC Mobile decisions through data, tools, and community-focused resources.',
    url: `${siteUrl}/about-us`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function AboutUsPage() {
  return (
    <StaticInfoPage
      title="About ZenithFCM"
      intro="ZenithFCM was built with one clear purpose: to make FC Mobile easier, smarter, and more practical for every player."
      sections={[
        {
          heading: 'Our Purpose',
          body: (
            <>
              <p>
                As dedicated FC Mobile fans, we understood the frustration of searching through multiple websites, outdated pages, and scattered resources just to find accurate player data, market trends, redeem codes, or useful tools.
              </p>
              <p>
                Players needed a faster, cleaner, and more reliable solution — so <strong>ZenithFCM</strong> was created. We are a fan-built platform focused on giving players the tools and information they actually need to make better decisions.
              </p>
            </>
          )
        },
        {
          heading: 'Who We Are',
          body: (
            <>
              <p>
                We’re FC Mobile players who wanted a better experience. ZenithFCM is not an official publisher or corporate platform; it was created by fans who understand squad building, market investments, and the daily decisions that shape progression.
              </p>
              <p>Our platform is built around real player needs:</p>
              <ul>
                <li>Quick access to trustworthy data</li>
                <li>Practical tools for squad planning</li>
                <li>A smooth, time-saving user experience</li>
              </ul>
            </>
          )
        },
        {
          heading: 'What We Offer',
          body: (
            <>
              <p>We combine essential FC Mobile resources into one streamlined platform:</p>
              <ul>
                <li><strong>Player Database:</strong> Detailed stats, comparisons, and performance analysis to help you build stronger squads.</li>
                <li><strong>Market Insights:</strong> Price movements and trends to help you buy and sell smarter.</li>
                <li><strong>Redeem Codes:</strong> The latest rewards and updates in one convenient place.</li>
                <li><strong>Tools & Guides:</strong> Gameplay simulators and strategic content for smarter progression.</li>
              </ul>
            </>
          )
        },
        {
          heading: 'Our Philosophy',
          body: (
            <>
              <p>Everything at ZenithFCM is built around three core principles:</p>
              <ul>
                <li><strong>Clarity:</strong> Clean design and straightforward information without unnecessary clutter.</li>
                <li><strong>Speed:</strong> Fast-loading pages and efficient navigation for quick answers.</li>
                <li><strong>Utility:</strong> Features designed to solve real FC Mobile problems.</li>
              </ul>
            </>
          )
        },
        {
          heading: 'Why ZenithFCM Exists',
          body: (
            <>
              <p>
                We believe FC Mobile players deserve a platform that respects their time. Every coin, every purchase, and every squad decision matters.
              </p>
              <p>
                ZenithFCM exists to simplify those decisions by offering reliable resources that help players build better squads and stay informed.
              </p>
            </>
          )
        },
        {
          heading: 'Our Vision',
          body: (
            <>
              <p>
                We aim to become the trusted destination for FC Mobile players by continuously improving our ecosystem. We are dedicated to evolving with the game while staying focused on helping players make better decisions every day.
              </p>
              <p>
                ZenithFCM is more than just a resource — it’s a platform built by fans, for fans.
              </p>
              <p style={{ marginTop: '20px' }}>
                Explore our <Link href="/players" style={{ color: '#2dd5c0' }}>Player Database</Link>, <Link href="/market" style={{ color: '#2dd5c0' }}>Market Tools</Link>, and <Link href="/tools" style={{ color: '#2dd5c0' }}>Simulators</Link> today.
              </p>
            </>
          )
        }
      ]}
    />
  );
}
