/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/r/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;