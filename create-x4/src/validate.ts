import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NPM_RESERVED_NAMES } from './constants.js';

const KEBAB_CASE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SCOPE_RE = /^@[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const BUNDLE_ID_RE = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

type ValidationResult = { valid: true } | { valid: false; error: string };

export function validateProjectName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, error: 'Project name is required.' };
  }

  if (name.length > 214) {
    return { valid: false, error: 'Project name must be 214 characters or fewer.' };
  }

  if (NPM_RESERVED_NAMES.has(name)) {
    return { valid: false, error: `"${name}" is a reserved name.` };
  }

  if (!KEBAB_CASE_RE.test(name)) {
    return {
      valid: false,
      error: 'Project name must be lowercase kebab-case (e.g., my-app).',
    };
  }

  return { valid: true };
}

export function validateScope(scope: string): ValidationResult {
  if (!scope.startsWith('@')) {
    return { valid: false, error: 'Scope must start with @ (e.g., @my-org).' };
  }

  if (!SCOPE_RE.test(scope)) {
    return {
      valid: false,
      error: 'Scope must be lowercase kebab-case (e.g., @my-org).',
    };
  }

  return { valid: true };
}

export function validateBundleId(bundleId: string): ValidationResult {
  if (!BUNDLE_ID_RE.test(bundleId)) {
    return {
      valid: false,
      error:
        'Bundle ID must be reverse-domain notation (e.g., com.myapp). Only lowercase letters and numbers, at least two segments.',
    };
  }

  return { valid: true };
}

export function validateTargetDir(name: string, cwd: string): ValidationResult {
  const target = resolve(cwd, name);
  if (existsSync(target)) {
    return {
      valid: false,
      error: `Directory "${name}" already exists. Choose a different name or delete the existing directory.`,
    };
  }

  return { valid: true };
}

/** Derive default scope from project name */
export function deriveScope(name: string): string {
  return `@${name}`;
}

/** Derive default bundle ID from project name (strip hyphens for Java compat) */
export function deriveBundleId(name: string): string {
  const clean = name.replace(/-/g, '');
  return `com.${clean}`;
}
