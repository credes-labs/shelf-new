/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
