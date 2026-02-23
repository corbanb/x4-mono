import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@x4/shared', '@x4/auth'],
  experimental: {
    optimizePackageImports: ['@x4/shared'],
  },
  webpack: (config) => {
    // Exclude Storybook story files from compilation
    config.module.rules.unshift({
      test: /\.stories\.(ts|tsx)$/,
      type: 'javascript/auto',
      use: [],
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
