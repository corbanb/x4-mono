---
name: no-apps-in-packages
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: packages/
  - field: new_text
    operator: regex_match
    pattern: from\s+['"].*apps/
---

**BLOCKED: Never import from `apps/*` in `packages/*`.**

This is the most critical dependency boundary rule in x4-mono.

**Dependency flow is one-way:**

```
packages/shared/types    → imports NOTHING (leaf node)
packages/shared/utils    → can import: shared/types
packages/database        → can import: shared/types
packages/auth            → can import: database, shared/types
packages/ai-integrations → can import: shared/types
apps/*                   → can import: any package
```

Apps depend on packages, never the reverse. Move shared code to `packages/shared/` instead.
