/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  staticPageGenerationTimeout: 600,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['ssh2', 'ssh2-sftp-client', 'cpu-features'],
  },
  async redirects() {
    return [
      // Simple path redirects (no query param logic here to avoid loops)
      {
        source: '/compare',
        destination: '/tools/player-compare',
        permanent: true,
      },
      {
        source: '/watchlist',
        destination: '/tools/watchlist',
        permanent: true,
      },
      // English duplicates to global
      {
        source: '/in/fc-mobile-redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      },
      {
        source: '/us/ea-redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      },
      {
        source: '/ph/ea-fc-mobile-redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      },
      // Old Malaysia slug to new slug
      {
        source: '/my/fc-mobile-redeem-codes',
        destination: '/my/kod-redeem-fc-mobile',
        permanent: true,
      },
      // Old regional blog posts
      {
        source: '/blogs/redeem-codes/codigos-de-canje-de-fc-mobile-spanish',
        destination: '/es/codigos-de-canje-de-fc-mobile',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes/kod-fifa-arabic',
        destination: '/ae/kod-fifa',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes/kode-redeem-fc-mobile-indo',
        destination: '/id/kode-redeem-fc-mobile',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes/kod-redeem-fc-mobile-malaysia',
        destination: '/my/kod-redeem-fc-mobile',
        permanent: true,
      },
      {
        source: '/blogs/redeem-codes',
        destination: '/fc-mobile-redeem-codes',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
