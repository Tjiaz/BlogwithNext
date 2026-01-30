// next.config.js - SIMPLE VERSION
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable image optimization temporarily
  images: {
    unoptimized: true,
  },
  // Remove any experimental options causing errors
  // experimental: {}, // Comment out or remove
};

module.exports = nextConfig;
