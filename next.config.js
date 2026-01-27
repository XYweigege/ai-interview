/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  transpilePackages: ["antd", "@ant-design/icons"],
};

module.exports = nextConfig;
