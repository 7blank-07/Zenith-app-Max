import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'About ZenithFCM | The Ultimate FC Mobile Database & Tools',
  description: 'Learn about ZenithFCM, an independent fan-built platform providing the FC Mobile community with a faster, cleaner player database, market insights, and squad tools.',
  alternates: { canonical: '/about-us' },
  openGraph: {
    title: 'About ZenithFCM | ZenithFCM',
    description: 'The story behind ZenithFCM — a platform built by fans, for fans, focused on clarity, speed, and utility in FC Mobile.',
    url: `${siteUrl}/about-us`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function AboutUsPage() {
  return (
    <StaticInfoPage
      title="About ZenithFCM"
      intro="ZenithFCM is a comprehensive, independent resource dedicated to helping FC Mobile players make smarter decisions through data, speed, and practical tools."
      sections={[
        {
          heading: '1. About ZenithFCM',
          body: (
            <>
              <p>
                <strong>ZenithFCM</strong> is a high-performance database and utility platform built specifically for the FC Mobile community. We provide players with an all-in-one destination to track player statistics, analyze market trends, and optimize their squads using professional-grade tools.
              </p>
              <p>
                Our mission is simple: to provide the cleanest, fastest, and most useful resource for players who want to master their progression in the game.
              </p>
            </>
          )
        },
        {
          heading: '2. Our Purpose',
          body: (
            <p>
              We believe that information should be accessible and actionable. ZenithFCM was created to eliminate the noise and provide a streamlined experience where players can find exactly what they need — whether it’s a specific player\'s work rates, the latest redeem codes, or a complex training simulator — in just a few clicks.
            </p>
          )
        },
        {
          heading: '3. Who We Are',
          body: (
            <p>
              We are a small team of dedicated FC Mobile enthusiasts and developers who live and breathe the game. We aren’t just building a website; we are building the tools that we wanted to use ourselves. As active members of the community, we understand the nuances of squad building, the volatility of the market, and the importance of staying updated with every reset.
            </p>
          )
        },
        {
          heading: '4. Why ZenithFCM Exists',
          body: (
            <p>
              The FC Mobile ecosystem is vast and moves quickly. Existing resources often felt cluttered, slow on mobile devices, or difficult to navigate. We saw a need for a platform that prioritized <strong>user experience</strong> and <strong>utility</strong>. ZenithFCM exists to bridge the gap between raw game data and practical player strategy, offering a faster and more modern alternative for the community.
            </p>
          )
        },
        {
          heading: '5. What We Offer',
          body: (
            <>
              <p>ZenithFCM provides a robust suite of tools designed for every type of player:</p>
              <ul>
                <li><strong>Advanced Player Database:</strong> Comprehensive stats, hidden traits, and filtering options for over 10,000 players.</li>
                <li><strong>Squad Builder & Comparison:</strong> Interactive tools to plan your dream team and compare players side-by-side.</li>
                <li><strong>Market Insights:</strong> Real-time price tracking and refresh timers to help you maximize your coins.</li>
                <li><strong>Redeem Codes & News:</strong> A dedicated hub for the latest official rewards and game updates.</li>
                <li><strong>Simulators & Blogs:</strong> In-depth guides, training simulators, and strategy articles written by experts.</li>
              </ul>
            </>
          )
        },
        {
          heading: '6. Our Philosophy: Clarity, Speed, Utility',
          body: (
            <>
              <p>Every feature we build is guided by three core principles:</p>
              <ul>
                <li><strong>Clarity:</strong> We present data in a way that is easy to read and understand, even on small screens.</li>
                <li><strong>Speed:</strong> We optimize our platform for lightning-fast load times, ensuring you spend more time playing and less time waiting.</li>
                <li><strong>Utility:</strong> We only build features that solve real problems for players. If it doesn’t help you build a better squad or save time, it doesn’t belong on ZenithFCM.</li>
              </ul>
            </>
          )
        },
        {
          heading: '7. Our Independence / Non-Affiliation',
          body: (
            <p>
              <strong>ZenithFCM is an independent, fan-operated platform.</strong> We are NOT affiliated with, endorsed by, sponsored by, or officially connected to Electronic Arts Inc. (EA), EA SPORTS, FC Mobile, or FIFA. Our platform is a community-driven project created to support the player base. All game-related trademarks and assets belong to their respective owners.
            </p>
          )
        },
        {
          heading: '8. Our Vision',
          body: (
            <p>
              Our vision is to become the primary "second screen" for every FC Mobile player. We are committed to evolving alongside the game, constantly adding new features, and refining our data to ensure ZenithFCM remains the most reliable and efficient toolset in the community.
            </p>
          )
        },
        {
          heading: '9. Community Commitment',
          body: (
            <>
              <p>
                We believe in continuous improvement. We listen to community feedback and use it to drive our development roadmap. ZenithFCM is built for you, and we are dedicated to maintaining a transparent, trustworthy, and player-first platform for years to come.
              </p>
              <p style={{ marginTop: '20px' }}>
                Ready to optimize your team? <Link href="/players" style={{ color: '#2dd5c0' }}>Browse the Database</Link> or check out our <Link href="/tools" style={{ color: '#2dd5c0' }}>latest Tools</Link>.
              </p>
              <p style={{ marginTop: '10px' }}>
                Explore our <Link href="/players" style={{ color: '#2dd5c0' }}>Player Database</Link> and <Link href="/tools" style={{ color: '#2dd5c0' }}>Simulators</Link> today.
              </p>
            </>
          )
        }
      ]}
    />
  );
}
