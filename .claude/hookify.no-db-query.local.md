---
name: no-db-query
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.ts$
  - field: new_text
    operator: regex_match
    pattern: db\.query
---

**Use `db.select().from()` SQL-like API, not `db.query` relational API.**

Drizzle's `db.query` relational API has known issues in this project. Use the SQL-like API instead:

```ts
// Correct
const users = await db.select().from(usersTable).where(eq(usersTable.id, id));

// Avoid
const users = await db.query.users.findMany({ where: ... });
```
