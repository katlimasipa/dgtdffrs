/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  transpilePackages: ['@deriv/core'],
  turbopack: {},
}

module.exports = withPWA(nextConfig)
