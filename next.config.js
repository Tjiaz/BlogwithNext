/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "miro.medium.com",
      "www.kdnuggets.com",
      "i.ibb.co",
      "localhost",
      "wp-content.com",
    ],
  },

  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
