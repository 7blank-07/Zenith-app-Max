/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
      }
    ];
  }
};

module.exports = nextConfig;
