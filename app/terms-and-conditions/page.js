import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Terms and Conditions | ZenithFCM - Platform Usage Rules',
  description: 'Read the ZenithFCM Terms and Conditions. Understand the rules for using our FC Mobile tools, player database, and community resources.',
  alternates: { canonical: '/terms-and-conditions' },
  openGraph: {
    title: 'Terms and Conditions | ZenithFCM',
    description: 'Official terms and conditions governing the use of the ZenithFCM platform and its FC Mobile resources.',
    url: `${siteUrl}/terms-and-conditions`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function TermsAndConditionsPage() {
  return (
    <StaticInfoPage
      title="Terms and Conditions"
      intro="Last Updated: May 5, 2026. By accessing or using ZenithFCM, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use this website."
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: (
            <p>
              By using ZenithFCM, you acknowledge that you have read, understood, and agreed to these Terms and Conditions in their entirety.
            </p>
          )
        },
        {
          heading: '2. Eligibility & Age Requirement',
          body: (
            <p>
              You must be at least <strong>13 years old</strong> to use ZenithFCM. If you are under 13, you should use this website only with parental or guardian consent and supervision.
            </p>
          )
        },
        {
          heading: '3. User Accounts',
          body: (
            <>
              <p>Certain features may require registration. You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>Restricting access to your account to prevent unauthorized use.</li>
                <li>Notifying us immediately of any security breaches or suspicious activity.</li>
              </ul>
              <p>You are solely responsible for all activities conducted under your account.</p>
            </>
          )
        },
        {
          heading: '4. Acceptable Use & Conduct',
          body: (
            <>
              <p>You agree to use ZenithFCM responsibly and lawfully. You may <strong>not</strong>:</p>
              <ul>
                <li>Post false, harmful, abusive, or misleading content.</li>
                <li>Violate intellectual property rights or harass other users.</li>
                <li>Introduce malware, bots, or malicious code.</li>
                <li>Attempt unauthorized access to our systems or disrupt website performance.</li>
              </ul>
              <p>Misuse may result in suspension or permanent termination of access.</p>
            </>
          )
        },
        {
          heading: '5. User-Generated Content',
          body: (
            <>
              <p>
                By submitting comments, feedback, or suggestions, you grant ZenithFCM a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute such content to improve our services.
              </p>
              <p>You remain solely responsible for ensuring your content does not violate any laws or third-party rights.</p>
            </>
          )
        },
        {
          heading: '6. Intellectual Property Rights',
          body: (
            <>
              <p>
                All ZenithFCM branding, design, tools, and original content are the property of ZenithFCM and protected by copyright laws.
              </p>
              <p>
                <strong>FC Mobile, EA SPORTS, and Electronic Arts</strong> assets remain the property of their respective owners. ZenithFCM is an independent fan-built platform and is not officially affiliated with or endorsed by Electronic Arts.
              </p>
            </>
          )
        },
        {
          heading: '7. Disclaimer of Warranties',
          body: (
            <p>
              ZenithFCM is provided on an “as is” and “as available” basis. While we strive for accuracy, we do not guarantee that player data, market insights, or tools will always be complete, current, or error-free.
            </p>
          )
        },
        {
          heading: '8. Limitation of Liability',
          body: (
            <p>
              To the fullest extent permitted by law, ZenithFCM shall not be liable for any damages arising from the use or inability to use the website, inaccuracies in content, or market decisions based on website information.
            </p>
          )
        },
        {
          heading: '9. Third-Party Links',
          body: (
            <p>
              ZenithFCM may include links to third-party websites for convenience. We are not responsible for the content, policies, or practices of these external platforms.
            </p>
          )
        },
        {
          heading: '10. Termination & Changes',
          body: (
            <>
              <p>
                We reserve the right to suspend or terminate access at any time for violations of these terms.
              </p>
              <p>
                We may update these Terms and Conditions periodically. Continued use of the website constitutes acceptance of the revised terms.
              </p>
            </>
          )
        },
        {
          heading: '11. Privacy & Contact',
          body: (
            <>
              <p>
                Your use of ZenithFCM is also subject to our <Link href="/privacy-policy" style={{ color: '#2dd5c0' }}>Privacy Policy</Link> and <Link href="/disclaimer" style={{ color: '#2dd5c0' }}>Disclaimer</Link>.
              </p>
              <p>For legal inquiries, contact us at: <a href="mailto:zenithfcmofficial@gmail.com" style={{ color: '#2dd5c0' }}>zenithfcmofficial@gmail.com</a></p>
            </>
          )
        }
      ]}
    />
  );
}
