/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || '',
  },
  // output: 'standalone',
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;