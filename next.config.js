/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => [
    { source: '/players', destination: '/' },
    { source: '/watchlist', destination: '/' },
    { source: '/market', destination: '/' },
    { source: '/squad-builder', destination: '/' },
    { source: '/compare', destination: '/' },
    { source: '/shard-calculator', destination: '/' },
    { source: '/player/:id', destination: '/' }
  ]
};

module.exports = nextConfig;
