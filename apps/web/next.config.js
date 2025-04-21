/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui-components", "shared-types", "api-client"],
};

module.exports = nextConfig; 