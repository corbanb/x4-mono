---
name: no-console-log
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: console\.(log|warn|error|debug|info)\(
---

**Do NOT use `console.log` in production code.**

Use Pino structured loggers instead:

- `apiLogger` — API server logs
- `dbLogger` — Database operation logs
- `authLogger` — Authentication logs
- `aiLogger` — AI integration logs

Example:

```ts
import { apiLogger } from '@/lib/logger';
apiLogger.info({ userId }, 'User authenticated');
```

See CLAUDE.md "Logging" section for details.
