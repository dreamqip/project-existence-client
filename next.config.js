/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/rpc/mainnet',
        destination: 'https://rpc.ankr.com/fantom',
      },
      {
        source: '/api/rpc/testnet',
        destination: 'https://rpc.ankr.com/fantom_testnet',
      },
      {
        source: '/api/rpc/fakenet',
        destination: 'http://localhost:18545',
      },
    ]
  },
}

module.exports = nextConfig
