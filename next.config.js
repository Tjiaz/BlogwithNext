/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "miro.medium.com",
      "www.kdnuggets.com",
      "i.ibb.co",
      "localhost",
      "wp-content.com",
      "orionx.net",
      "yager-research.ca",
      "insideainews.com",
      "analyticsindiamag.com",
      "your-wordpress-domain.com",
      "azbytegems.com",
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
  env: {
    NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  },
};

module.exports = nextConfig;
