/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["shared-types", "api-client"],
  typescript: {
    // Makes TypeScript checks produce warnings instead of blocking the build
    ignoreBuildErrors: true,
    tsconfigPath: "./tsconfig.json",
  },
  eslint: {
    // Makes ESLint checks produce warnings instead of blocking the build
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },
};

module.exports = nextConfig; 