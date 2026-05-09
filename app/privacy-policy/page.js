import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Privacy Policy | ZenithFCM - FC Mobile Database & Tools',
  description: 'Review the ZenithFCM Privacy Policy. Learn about our data practices, cookie usage, and commitment to user transparency in our independent FC Mobile community.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | ZenithFCM',
    description: 'Detailed privacy and data transparency policy for ZenithFCM, an independent fan-operated FC Mobile platform.',
    url: `${siteUrl}/privacy-policy`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <StaticInfoPage
      title="Privacy Policy"
      intro={
        <>
          Effective Date: May 9, 2026. <br /><br />
          This Privacy Policy describes how <strong>ZenithFCM</strong> ("we," "us," or "our") collects, uses, and discloses information when you visit and interact with our website, tools, and blog. ZenithFCM is an independent fan-operated platform and is not affiliated with, endorsed by, or officially connected to Electronic Arts Inc. (EA).
        </>
      }
      sections={[
        {
          heading: '1. Information We Collect',
          body: (
            <>
              <p>We are committed to data transparency and minimization. Because ZenithFCM is a public-access resource that does not require user accounts or registration, our data collection is limited to the following categories:</p>
              <ul>
                <li><strong>Direct Communication:</strong> If you contact us via email, we collect your email address and the content of your message to facilitate a response.</li>
                <li><strong>Technical and Usage Information:</strong> When you access our site, we automatically collect certain technical data, including your IP address, browser type, device identifiers, operating system, and details regarding your interaction with our tools and pages.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to maintain site functionality, analyze traffic patterns, and optimize user experience.</li>
              </ul>
            </>
          )
        },
        {
          heading: '2. How We Use Information',
          body: (
            <>
              <p>The information we collect is used solely to provide and improve our services, including:</p>
              <ul>
                <li>Operating and maintaining the player database, squad builder, and market tools.</li>
                <li>Monitoring and analyzing site performance and user engagement trends.</li>
                <li>Responding to inquiries and providing user support.</li>
                <li>Ensuring the technical security and integrity of our platform.</li>
                <li>Serving relevant, non-intrusive advertisements through third-party partners.</li>
              </ul>
              <p><strong>ZenithFCM does not sell your personal information to third parties.</strong></p>
            </>
          )
        },
        {
          heading: '3. Cookies & Analytics',
          body: (
            <>
              <p>ZenithFCM utilizes cookies (small data files stored on your device) to enhance performance and remember certain preferences. We may employ third-party service providers, such as Google Analytics, to help us understand how visitors navigate the site.</p>
              <p>These analytics providers use cookies to collect and generate information about your use of the website (including your IP address), which is transmitted to and stored on their servers. You may manage or disable cookies through your browser settings, though this may impact the functionality of certain tools on our site.</p>
            </>
          )
        },
        {
          heading: '4. Google AdSense & Third-Party Advertising',
          body: (
            <>
              <p>We may partner with third-party advertising companies, such as Google AdSense, to serve advertisements on ZenithFCM. These companies use cookies and web beacons to serve ads based on your prior visits to our site or other websites on the internet.</p>
              <ul>
                <li><strong>Personalized Advertising:</strong> Google\'s use of advertising cookies enables it and its partners to serve ads to you based on your visit to ZenithFCM and other sites.</li>
                <li><strong>User Controls:</strong> You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#2dd5c0' }}>Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor\'s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: '#2dd5c0' }}>www.aboutads.info</a>.</li>
              </ul>
            </>
          )
        },
        {
          heading: '5. Data Security',
          body: (
            <p>
              We implement reasonable administrative and technical safeguards designed to protect the limited information we collect from unauthorized access, disclosure, or alteration. However, no method of electronic transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          )
        },
        {
          heading: '6. User Rights & Choices',
          body: (
            <>
              <p>Depending on your jurisdiction (such as the EEA or California), you may have certain rights regarding your information, including the right to request access to or deletion of any personal data you have shared with us (e.g., via email communication).</p>
              <p>Because we do not maintain user profiles, you can primarily exercise your privacy choices by managing your browser\'s cookie settings and adjusting your advertising preferences through Google\'s transparency tools.</p>
            </>
          )
        },
        {
          heading: '7. Children’s Privacy',
          body: (
            <p>
              ZenithFCM is intended for a general audience and does not knowingly collect personal information from children under the age of 13. If we become aware that we have inadvertently collected personal data from a child under 13, we will take immediate steps to delete such information from our records.
            </p>
          )
        },
        {
          heading: '8. External Links',
          body: (
            <p>
              Our website contains links to third-party platforms. ZenithFCM is not responsible for the privacy practices, policies, or content of these external sites. We encourage users to review the privacy statements of any third-party website they visit.
            </p>
          )
        },
        {
          heading: '9. Policy Updates',
          body: (
            <p>
              We may revise this Privacy Policy periodically to reflect changes in our practices or for legal, technical, or regulatory reasons. Significant updates will be noted by a revised "Effective Date" at the top of this page.
            </p>
          )
        },
        {
          heading: '10. Contact Information',
          body: (
            <>
              <p>For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
              <p><strong>ZenithFCM Official</strong><br />
              Email: <a href="mailto:zenithfcmofficial@gmail.com" style={{ color: '#2dd5c0' }}>zenithfcmofficial@gmail.com</a></p>
              <p>Usage of this website is also subject to our <Link href="/terms-and-conditions" style={{ color: '#2dd5c0' }}>Terms and Conditions</Link>.</p>
            </>
          )
        }
      ]}
    />
  );
}
