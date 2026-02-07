Scaffold a new Hono middleware with test file.

Input format: `middleware-name` (e.g., `rate-limiter`, `request-logger`, `cors`)

## Steps

1. **Parse the input** — extract the middleware name from: $ARGUMENTS
2. **Read existing patterns** — read `apps/api/src/middleware/` directory and any existing middleware files to understand the patterns in use
3. **Determine chain position** — based on the middleware type, identify where it fits in the chain:
   ```
   requestLogger → CORS → rate limiting → auth → route-specific
   ```
4. **Create the middleware file** — write `apps/api/src/middleware/{name}.ts` with:
   - Import `MiddlewareHandler` from `hono`
   - Import Pino child logger from the logging module
   - Create and export the middleware function
   - Include proper error handling using `AppError`
   - Add `requestId` to context if applicable
   - Use structured logging (never `console.log`)
5. **Register in middleware chain** — show where to add the middleware in the Hono app setup (typically `apps/api/src/index.ts` or `apps/api/src/app.ts`)
6. **Create test file** — write `apps/api/src/middleware/{name}.test.ts` with:
   - Import from `bun:test`
   - Create a test Hono app with the middleware applied
   - Test happy path (middleware passes through)
   - Test rejection cases (middleware blocks request)
   - Test error handling
7. **Verify** — run `bun turbo type-check` to ensure types are correct

## Rules

- Use `MiddlewareHandler` type from Hono for type safety
- Use Pino child loggers — never `console.log`
- Handle errors with `AppError` constructors, not raw throws
- Follow the middleware chain order (requestLogger → CORS → rate limiting → auth → route-specific)
- Middleware should be composable — avoid side effects outside the request context
- Always include a test file
