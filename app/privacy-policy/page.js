import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Privacy Policy | ZenithFCM - Your Data Security',
  description: 'Read the ZenithFCM Privacy Policy. Learn how we collect, use, and protect your information when using our FC Mobile tools, player database, and market insights.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | ZenithFCM',
    description: 'Understand how ZenithFCM handles your data. Our Privacy Policy outlines our practices for data collection, security, and user rights.',
    url: `${siteUrl}/privacy-policy`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <StaticInfoPage
      title="Privacy Policy"
      intro="Last Updated: May 5, 2026. At ZenithFCM, your privacy matters. This Privacy Policy explains how ZenithFCM collects, uses, stores, and protects your information when you access or use our website, tools, and services. By using ZenithFCM, you agree to the practices outlined in this policy."
      sections={[
        {
          heading: '1. Information We Collect',
          body: (
            <>
              <p><strong>1.1 Personal Information:</strong> When you create an account, subscribe, or contact us, we may collect details such as your name, username, email address, and feedback messages.</p>
              <p><strong>1.2 Usage Information:</strong> We collect data on how you interact with ZenithFCM, including pages visited, features used, player searches, and market tool interactions.</p>
              <p><strong>1.3 Device Information:</strong> We automatically collect limited technical info like browser type, device type, operating system, and IP address for analytics.</p>
              <p><strong>1.4 Cookies & Tracking:</strong> We use cookies to improve performance, remember preferences, and analyze traffic. You can control these through your browser settings.</p>
            </>
          )
        },
        {
          heading: '2. How We Use Your Information',
          body: (
            <>
              <p><strong>2.1 Services:</strong> To operate ZenithFCM’s player database, market insights, and tools effectively.</p>
              <p><strong>2.2 Personalization:</strong> To improve recommendations and optimize content for your specific needs.</p>
              <p><strong>2.3 Communication:</strong> To send platform updates, security alerts, and feature announcements.</p>
              <p><strong>2.4 Optimization:</strong> To improve site speed, enhance mobile reliability, and fix bugs.</p>
            </>
          )
        },
        {
          heading: '3. Information Sharing',
          body: (
            <>
              <p><strong>3.1 Third-Party Services:</strong> We work with trusted providers for analytics, hosting, and security. They are expected to handle data responsibly.</p>
              <p><strong>3.2 Legal Compliance:</strong> We may disclose info when required by law or to protect platform integrity and our users.</p>
            </>
          )
        },
        {
          heading: '4. Data Security',
          body: (
            <p>
              ZenithFCM takes reasonable security measures to protect your information from unauthorized access, misuse, or disclosure. However, no online system can guarantee absolute security.
            </p>
          )
        },
        {
          heading: '5. Your Choices & Rights',
          body: (
            <>
              <p><strong>5.1 Access & Updates:</strong> You may review or update account information where account systems are available.</p>
              <p><strong>5.2 Marketing Opt-Out:</strong> You can unsubscribe from optional communications at any time.</p>
              <p><strong>5.3 Cookie Controls:</strong> You may disable cookies through your browser settings.</p>
            </>
          )
        },
        {
          heading: '6. Children’s Privacy',
          body: (
            <p>
              ZenithFCM is not intended for children under 13 without parental or guardian consent. We do not knowingly collect personal information from children under 13.
            </p>
          )
        },
        {
          heading: '7. Advertising & Analytics',
          body: (
            <p>
              We use partners for advertising and performance analytics. These services may collect data such as IP address and device type to provide personalized ads and audience insights.
            </p>
          )
        },
        {
          heading: '8. External Links',
          body: (
            <p>
              ZenithFCM may contain links to third-party websites. We are not responsible for the privacy practices, policies, or content of external platforms.
            </p>
          )
        },
        {
          heading: '9. Changes to This Policy',
          body: (
            <p>
              We may update this Privacy Policy periodically for legal or operational reasons. Updates will be reflected on this page with a revised “Last Updated” date.
            </p>
          )
        },
        {
          heading: '10. Contact Us',
          body: (
            <>
              <p>If you have questions, concerns, or privacy-related requests, please contact us:</p>
              <p><strong>ZenithFCM</strong><br />Email: <a href="mailto:zenithfcm@gmail.com" style={{ color: '#2dd5c0' }}>zenithfcm@gmail.com</a></p>
              <p>Continued use of this site is also subject to our <Link href="/terms-and-conditions" style={{ color: '#2dd5c0' }}>Terms and Conditions</Link>.</p>
            </>
          )
        }
      ]}
    />
  );
}
