import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';
const contactEmail = 'zenithfcmofficial@gmail.com';

export const metadata = {
  title: 'Contact Us | ZenithFCM - Feedback & Support',
  description: 'Have questions or feedback? Contact the ZenithFCM team for support, business inquiries, or collaboration opportunities within the FC Mobile community.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | ZenithFCM',
    description: 'Get in touch with ZenithFCM for support, feedback, and partnerships.',
    url: `${siteUrl}/contact`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function ContactPage() {
  return (
    <StaticInfoPage
      title="Contact Us"
      intro="We value your input and are here to help. Whether you have a question about our tools or want to discuss a partnership, we'd love to hear from you."
      sections={[
        {
          heading: 'General Support',
          body: (
            <>
              <p>For help with the player database, market tools, or any site features, you can reach out to us via email or on our social media platforms (Discord, X, or Instagram):</p>
              <p>
                <a href={`mailto:${contactEmail}`} style={{ color: '#2dd5c0', fontWeight: '600' }}>{contactEmail}</a>
              </p>
              <p>We aim to respond to all inquiries within 24-48 hours. For faster community-driven support, we recommend joining our Discord.</p>
            </>
          )
        },
        {
          heading: 'Social Media',
          body: (
            <>
              <p>Join our growing community and stay updated with the latest FC Mobile news and ZenithFCM features:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Discord:</strong> <a href="https://discord.gg/HM2JajuQjQ" target="_blank" rel="noopener noreferrer" style={{ color: '#2dd5c0' }}>Join our Discord Server</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>X (Twitter):</strong> <a href="https://x.com/zenithfcm" target="_blank" rel="noopener noreferrer" style={{ color: '#2dd5c0' }}>Follow us on X</a>
                </li>
                <li>
                  <strong>Instagram:</strong> <a href="https://www.instagram.com/zenithfcm/" target="_blank" rel="noopener noreferrer" style={{ color: '#2dd5c0' }}>Follow us on Instagram</a>
                </li>
              </ul>
            </>
          )
        },
        {
          heading: 'Report a Bug',
          body: (
            <>
              <p>Found a technical issue or have a suggestion for a new feature?</p>
              <p>
                <a href="/bug-feature-request" style={{ color: '#2dd5c0', fontWeight: '600' }}>Submit a Bug or Feature Request</a>
              </p>
            </>
          )
        },
        {
          heading: 'Partnerships & Business',
          body: (
            <p>
              Interested in collaborating with ZenithFCM? We are open to working with content creators, community leaders, and developers in the FC Mobile ecosystem. Please use the subject line <strong>"Partnership Inquiry"</strong> in your email.
            </p>
          )
        },
        {
          heading: 'Media & Press',
          body: (
            <p>
              For media inquiries or requests for platform data/insights for your articles or videos, please contact us at the email address above with the subject line <strong>"Media Request"</strong>.
            </p>
          )
        },
        {
          heading: 'Quick Links',
          body: (
            <>
              <p>Looking for something else? Here are some quick links to our most popular features:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="/players" style={{ color: '#2dd5c0' }}>Player Database</a> - Search and filter through the latest FC Mobile players.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="/market" style={{ color: '#2dd5c0' }}>Market Tools</a> - Track player prices and market trends.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="/squad-builder" style={{ color: '#2dd5c0' }}>Squad Builder</a> - Create and share your dream team.
                </li>
                <li>
                  <a href="/compare" style={{ color: '#2dd5c0' }}>Player Comparison</a> - Compare stats and attributes of different players side-by-side.
                </li>
              </ul>
            </>
          )
        },
        {
          heading: 'What to Include',
          body: (
            <>
              <p>To help us assist you faster, please include:</p>
              <ul>
                <li>Your device and browser information.</li>
                <li>Relevant page URLs or player names.</li>
                <li>A clear description of your request or issue.</li>
              </ul>
            </>
          )
        }
      ]}
    />
  );
}
