#!/usr/bin/env bun
/**
 * Release script for create-x4
 *
 * Usage:
 *   bun run release          # patch (1.0.4 → 1.0.5)
 *   bun run release minor    # minor (1.0.4 → 1.1.0)
 *   bun run release major    # major (1.0.4 → 2.0.0)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PKG_PATH = join(ROOT, 'package.json');

type BumpType = 'patch' | 'minor' | 'major';

function bump(version: string, type: BumpType): string {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function run(cmd: string, cwd?: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: cwd ?? ROOT });
}

// Parse args
const type = (process.argv[2] ?? 'patch') as BumpType;
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error(`Invalid bump type: ${process.argv[2]}`);
  console.error('Usage: bun run release [patch|minor|major]');
  process.exit(1);
}

// Read current version
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
const oldVersion = pkg.version;
const newVersion = bump(oldVersion, type);
const tag = `create-x4@${newVersion}`;

console.log(`\nReleasing create-x4: ${oldVersion} → ${newVersion} (${type})\n`);

// Ensure working directory is clean
try {
  execSync('git diff --quiet HEAD', { cwd: ROOT });
} catch {
  console.error('Working directory has uncommitted changes. Commit or stash first.');
  process.exit(1);
}

// Run tests
console.log('Running tests...\n');
run('bun run test');

// Build
console.log('\nBuilding...\n');
run('bun run build');

// Bump version
pkg.version = newVersion;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
console.log(`\nBumped package.json to ${newVersion}`);

// Commit, tag, push
const repoRoot = join(ROOT, '..');
run(`git add create-x4/package.json`, repoRoot);
run(`git commit -m "chore(create-x4): release ${newVersion}"`, repoRoot);
run(`git tag "${tag}"`, repoRoot);
run(`git push origin main`, repoRoot);
run(`git push origin "${tag}"`, repoRoot);

console.log(`\n✓ Released ${tag}`);
console.log(`  npm: https://www.npmjs.com/package/create-x4/v/${newVersion}`);
console.log(`  CI:  https://github.com/corbanb/x4-mono/actions/workflows/publish-create-x4.yml`);
