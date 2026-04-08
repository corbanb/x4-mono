/**
 * Dev server launcher with automatic port conflict resolution.
 * Finds available ports for each service before starting turbo dev.
 */
import net from 'net';

const SERVICES = [
  { key: 'PORT_WEB', default: 3000, label: 'Web         ' },
  { key: 'PORT_MARKETING', default: 3001, label: 'Marketing   ' },
  { key: 'PORT_API', default: 3002, label: 'API         ' },
  { key: 'PORT_DOCS', default: 3003, label: 'Docs        ' },
  { key: 'PORT_STORYBOOK', default: 6006, label: 'Storybook   ' },
] as const;

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function findFreePort(start: number, taken: Set<number>): Promise<number> {
  let port = start;
  while (taken.has(port) || !(await isPortFree(port))) {
    port++;
  }
  return port;
}

const taken = new Set<number>();
const resolved: Record<string, string> = {};
const lines: string[] = [];

for (const { key, default: defaultPort, label } of SERVICES) {
  const requested = process.env[key] ? Number(process.env[key]) : defaultPort;
  const port = await findFreePort(requested, taken);
  taken.add(port);
  resolved[key] = String(port);
  const note = port !== defaultPort ? `  ← was :${defaultPort}` : '';
  lines.push(`  ${label} :${port}${note}`);
}

console.log('\n📡 Dev ports:\n' + lines.join('\n') + '\n');

const proc = Bun.spawn(['node_modules/.bin/turbo', 'dev', '--concurrency', '15'], {
  env: { ...process.env, ...resolved },
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
});

process.on('SIGINT', () => proc.kill());
process.on('SIGTERM', () => proc.kill());

await proc.exited;
