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

      {
        source: '/api/rpc/tracer/mainnet',
        destination: 'https://rpcapi-tracing.fantom.network/',
      },
      {
        source: '/api/rpc/tracer/testnet',
        destination: 'https://rpcapi-tracing.testnet.fantom.network/',
      },
    ]
  },
}

module.exports = nextConfig
