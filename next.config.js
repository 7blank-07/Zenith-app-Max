/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => [
    { source: '/watchlist', destination: '/' },
    { source: '/squad-builder', destination: '/' },
    { source: '/compare', destination: '/' },
    { source: '/shard-calculator', destination: '/' }
  ]
};

module.exports = nextConfig;
