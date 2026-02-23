import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const webAppSrc = path.resolve(__dirname, '../../web/src');
const packagesSrc = path.resolve(__dirname, '../../../packages');
const storybookDir = path.resolve(__dirname);

const config: StorybookConfig = {
  stories: [
    '../../../apps/web/src/**/*.stories.@(ts|tsx)',
    '../../../packages/shared/ui/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    // Aliases
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': webAppSrc,
        'next/navigation': path.resolve(storybookDir, 'mocks/next-navigation.ts'),
        'next/link': path.resolve(storybookDir, 'mocks/next-link.tsx'),
        'next/image': path.resolve(storybookDir, 'mocks/next-image.tsx'),
        'next-themes': path.resolve(storybookDir, 'mocks/next-themes.tsx'),
        '@x4/auth/client': path.resolve(storybookDir, 'mocks/auth-client.ts'),
        '@x4/shared/api-client': path.resolve(storybookDir, 'mocks/trpc-client.ts'),
      };
    }

    // Add SWC loader for TypeScript from web app, packages, and .storybook
    config.module?.rules?.push({
      test: /\.(ts|tsx)$/,
      include: [webAppSrc, packagesSrc, storybookDir],
      use: [
        {
          loader: require.resolve('swc-loader'),
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      ],
    });

    // Remove Storybook's default CSS rules to avoid double-processing
    if (config.module?.rules) {
      config.module.rules = config.module.rules.filter((rule) => {
        if (rule && typeof rule === 'object' && 'test' in rule && rule.test instanceof RegExp) {
          return !rule.test.test('.css');
        }
        return true;
      });
    }

    // Add our own CSS rule with PostCSS for Tailwind v4
    config.module?.rules?.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: { importLoaders: 1 },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: {
                '@tailwindcss/postcss': {},
              },
            },
          },
        },
      ],
    });

    return config;
  },
};

export default config;
