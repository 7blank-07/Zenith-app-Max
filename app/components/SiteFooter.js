import Image from 'next/image';
import Link from 'next/link';
import packageMetadata from '../../package.json';
import MarketNavLink from './MarketNavLink.client';

const CONTACT_EMAIL = 'zenithfcmofficial@gmail.com';

const SOCIAL_LINKS = [
  {
    name: 'X (Twitter)',
    url: 'https://x.com/zenithfcm',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/HM2JajuQjQ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
      </svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/zenithfcm/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  }
];

const FOOTER_COLUMNS = Object.freeze([
  {
    title: 'Company',
    ariaLabel: 'Company links',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Contact', href: '/contact' },
      { label: 'Bug / Feature Request', href: '/bug-feature-request' }
    ]
  },
  {
    title: 'Tools',
    ariaLabel: 'Tools links',
    links: [
      { label: 'Squad Builder', href: '/tools?tool=squadbuilder' },
      { label: 'Compare Players', href: '/tools?tool=compare' },
      { label: 'Watchlist', href: '/watchlist' }
    ]
  },
  {
    title: 'Explore',
    ariaLabel: 'Explore links',
    links: [
      { label: 'Players', href: '/players' },
      { label: 'Market', href: '/market', market: true },
      { label: 'Redeem Codes', href: '/fc-mobile-redeem-codes' },
      { label: 'Blogs', href: '/blogs' }
    ]
  },
  {
    title: 'Legal',
    ariaLabel: 'Legal links',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      { label: 'Disclaimer', href: '/disclaimer' }
    ]
  }
]);

function FooterNavLink({ href, label, market = false, meta = '' }) {
  const linkContent = (
    <>
      <span>{label}</span>
      {meta ? <span className="zenith-footer-link-meta">{meta}</span> : null}
    </>
  );

  if (market) {
    return (
      <MarketNavLink href={href} className="zenith-footer-link">
        {linkContent}
      </MarketNavLink>
    );
  }

  return (
    <Link href={href} className="zenith-footer-link">
      {linkContent}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="zenith-footer" role="contentinfo">
      <div className="zenith-footer-inner">
        <div className="zenith-footer-main">
          <div className="zenith-footer-brand-column">
            <Link href="/" className="zenith-footer-brand" aria-label="ZenithFCM home">
              <Image
                src="/assets/images/zenith_logo_main.png"
                alt="ZenithFCM logo"
                className="zenith-footer-logo"
                width={1024}
                height={1024}
                priority={false}
              />
              <span className="zenith-footer-brand-name">ZenithFCM</span>
            </Link>
            <p className="zenith-footer-description">
              The ultimate FC Mobile database, market tracker, and squad building platform for enthusiasts worldwide.
            </p>
            <div className="zenith-footer-socials">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zenith-footer-social-link"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="zenith-footer-links-container">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="zenith-footer-nav-col">
                <h3 className="zenith-footer-nav-title">{column.title}</h3>
                <ul className="zenith-footer-nav-list">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterNavLink {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="zenith-footer-sub">
        <div className="zenith-footer-inner">
          <span className="zenith-footer-copyright">@ Copyright by ZenithFCM 2026. All rights reserved.</span>
          <p className="zenith-footer-legal-text">
            Trademarks, logos, player images, card designs, and other game-related assets on this site belong to their respective owners. 
            Some visual materials are owned by Electronic Arts Inc. and/or its licensors. This website is independent and not affiliated 
            with or endorsed by Electronic Arts Inc., which holds no responsibility for the content or operations of this platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
