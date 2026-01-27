/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  transpilePackages: ["antd", "@ant-design/icons"],
  // 忽略 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 检查
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
