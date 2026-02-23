import * as p from '@clack/prompts';
import pc from 'picocolors';

export function handleCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
}

export function exitWithError(msg: string): never {
  p.log.error(pc.red(msg));
  process.exit(1);
}
