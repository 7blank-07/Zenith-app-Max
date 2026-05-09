import Link from 'next/link';
import StaticInfoPage from '../components/StaticInfoPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Terms and Conditions | ZenithFCM - Usage Policy',
  description: 'Read the ZenithFCM Terms and Conditions. Understand the rules, non-affiliation notice, and usage policies for our FC Mobile database and tools.',
  alternates: { canonical: '/terms-and-conditions' },
  openGraph: {
    title: 'Terms and Conditions | ZenithFCM',
    description: 'Official terms and conditions governing the use of ZenithFCM, an independent FC Mobile fan platform.',
    url: `${siteUrl}/terms-and-conditions`,
    siteName: 'ZenithFCM',
    type: 'website'
  }
};

export default function TermsAndConditionsPage() {
  return (
    <StaticInfoPage
      title="Terms and Conditions"
      intro={
        <>
          Last Updated: May 9, 2026. <br /><br />
          Welcome to <strong>ZenithFCM</strong>. By accessing or using our website, tools, and informational resources, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use this website.
        </>
      }
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: (
            <p>
              By visiting ZenithFCM, you acknowledge that you have read, understood, and agreed to these Terms and Conditions, as well as our Privacy Policy. These terms apply to all visitors and users who access the service.
            </p>
          )
        },
        {
          heading: '2. Eligibility / Age Requirements',
          body: (
            <p>
              ZenithFCM is intended for a general audience. Users must be at least <strong>13 years old</strong>. If you are under the age of 13, you may only use this website under the direct supervision of a parent or legal guardian who agrees to be bound by these Terms.
            </p>
          )
        },
        {
          heading: '3. Acceptable Use & Prohibited Activities',
          body: (
            <>
              <p>ZenithFCM provides tools and data for personal, non-commercial use. You agree not to engage in any of the following prohibited activities:</p>
              <ul>
                <li><strong>Unauthorized Data Extraction:</strong> Scraping, crawling, or using automated systems (bots) to extract data, player stats, or content from ZenithFCM is strictly prohibited.</li>
                <li><strong>System Abuse:</strong> Attempting to disrupt, overburden, or compromise the security of our servers or networks.</li>
                <li><strong>Malicious Code:</strong> Introducing viruses, malware, or any other harmful technology to the site.</li>
                <li><strong>Spam:</strong> Using our contact information for unauthorized advertising or solicitation.</li>
              </ul>
              <p>We reserve the right to restrict or block access to users who violate these rules.</p>
            </>
          )
        },
        {
          heading: '4. User Communications & Feedback',
          body: (
            <>
              <p>ZenithFCM does not feature user accounts or public posting areas. Any communication with us occurs via email.</p>
              <p>By sending us feedback, suggestions, or bug reports, you grant ZenithFCM a perpetual, royalty-free, and irrevocable right to use, implement, and share those ideas for any purpose without compensation to you.</p>
            </>
          )
        },
        {
          heading: '5. Intellectual Property Rights',
          body: (
            <>
              <p>
                The design, layout, custom tools, original articles, and branding of ZenithFCM are the exclusive intellectual property of ZenithFCM and are protected by copyright and trademark laws.
              </p>
              <p>
                You may not reproduce, distribute, or create derivative works from our content without explicit written permission.
              </p>
            </>
          )
        },
        {
          heading: '6. FC Mobile / EA Non-Affiliation Notice',
          body: (
            <p>
              <strong>ZenithFCM is an independent fan-operated platform.</strong> We are NOT affiliated with, endorsed by, sponsored by, or officially connected to Electronic Arts Inc. (EA), EA SPORTS, FC Mobile, or FIFA. All game-related assets, player names, club logos, and trademarks used on this site remain the property of their respective owners and are used here for informational and community-driven purposes only.
            </p>
          )
        },
        {
          heading: '7. Data Accuracy & Tool Limitations',
          body: (
            <p>
              While we strive to provide accurate and up-to-date information, ZenithFCM does not guarantee the completeness or accuracy of player stats, market values, or calculator results. All data is provided for <strong>informational purposes only</strong>. We are not responsible for any in-game decisions or losses resulting from the use of our tools.
            </p>
          )
        },
        {
          heading: '8. Disclaimer of Warranties',
          body: (
            <p>
              ZenithFCM is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not warrant that the website will be uninterrupted, error-free, or free of harmful components.
            </p>
          )
        },
        {
          heading: '9. Limitation of Liability',
          body: (
            <p>
              To the maximum extent permitted by law, ZenithFCM and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the site, even if advised of the possibility of such damages.
            </p>
          )
        },
        {
          heading: '10. Third-Party Links',
          body: (
            <p>
              Our site may contain links to external websites that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites.
            </p>
          )
        },
        {
          heading: '11. Advertising & Sponsored Content',
          body: (
            <p>
              ZenithFCM may display advertisements from third-party partners like Google AdSense. We are not responsible for the content of these ads or the practices of the advertisers. Please refer to our Privacy Policy for more details on how cookies are used for advertising.
            </p>
          )
        },
        {
          heading: '12. Service Changes & Access Restriction',
          body: (
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the website or its tools at any time without notice. We also reserve the right to block specific IP addresses or users from accessing the site if we detect patterns of abuse or violation of these terms.
            </p>
          )
        },
        {
          heading: '13. Privacy Policy Reference',
          body: (
            <p>
              Your use of the site is also governed by our <Link href="/privacy-policy" style={{ color: '#2dd5c0' }}>Privacy Policy</Link>, which outlines how we handle data and cookies.
            </p>
          )
        },
        {
          heading: '14. Contact Information',
          body: (
            <>
              <p>If you have any questions regarding these Terms and Conditions, please contact us at:</p>
              <p><strong>ZenithFCM Official</strong><br />
              Email: <a href="mailto:zenithfcmofficial@gmail.com" style={{ color: '#2dd5c0' }}>zenithfcmofficial@gmail.com</a></p>
            </>
          )
        }
      ]}
    />
  );
}
