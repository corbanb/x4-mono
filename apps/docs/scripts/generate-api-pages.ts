import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const server = createOpenAPI({
  input: ['../../apps/api/openapi.json'],
});

void generateFiles({
  input: server,
  output: './content/docs/api-reference',
  includeDescription: true,
  groupBy: 'tag',
});
