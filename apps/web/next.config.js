/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@qbit/shared-types", "@qbit/api-client"],
  typescript: {
    // Type checking is enabled for production builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // ESLint checking is enabled for production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  // Use stable turbopack config instead of experimental
  turbopack: {
    resolveAlias: {
      '@': path.join(__dirname, 'src'),
    },
  },
};

module.exports = nextConfig; 