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
              <p>For help with the player database, market tools, or any site features, please reach out to our support email:</p>
              <p>
                <a href={`mailto:${contactEmail}`} style={{ color: '#2dd5c0', fontWeight: '600' }}>{contactEmail}</a>
              </p>
              <p>We aim to respond to all inquiries within 24-48 hours.</p>
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
