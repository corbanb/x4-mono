import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async redirects() {
    return [
      {
        source: '/docs',
        destination: 'https://github.com/studiox4/x4-agent-plugins',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
