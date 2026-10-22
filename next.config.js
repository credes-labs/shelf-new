/** @type {import('next').NextConfig} */
const cmsUrl = (
  process.env.PAYLOAD_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://shelf-e3aq.vercel.app'
    : 'http://localhost:3001')
).replace(/\/+$/, '');

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Tree-shake barrel imports so only used icons ship to the client.
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: `${cmsUrl}/admin`,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${cmsUrl}/admin/:path*`,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
