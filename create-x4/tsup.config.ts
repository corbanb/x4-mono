import { defineConfig } from 'tsup';
import { builtinModules } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const nodeExternals = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)];
const pkg = JSON.parse(readFileSync(join(import.meta.dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  define: {
    PKG_VERSION: JSON.stringify(pkg.version),
  },
  banner: {
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __createRequire } from "node:module";',
      'const require = __createRequire(import.meta.url);',
    ].join('\n'),
  },
  outExtension: () => ({ js: '.mjs' }),
  noExternal: [/.*/],
  external: nodeExternals,
  target: 'node18',
  platform: 'node',
  minify: false,
});
