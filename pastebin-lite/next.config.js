/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_MODE: process.env.TEST_MODE,
  },
}

module.exports = nextConfig