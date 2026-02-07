# Contributing to x4-mono

## Prerequisites

- [Bun](https://bun.sh) >= 1.1
- [Node.js](https://nodejs.org) >= 20 (for Expo/Electron compatibility)
- Git

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd x4-mono

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Start development
bun turbo dev
```

## Conventions

### File Naming

- **Files**: kebab-case (`user-profile.ts`, `create-project.tsx`)
- **Components**: PascalCase (`UserProfile`, `CreateProjectForm`)
- **Functions/variables**: camelCase (`getUserById`, `isAuthenticated`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Database tables**: snake_case (`user_profiles`, `ai_usage_logs`)
- **tRPC routers**: camelCase namespace (`projects.create`, `users.me`)

### Types

- Zod schemas are the source of truth for all types
- Define schemas in `packages/shared/` and infer types with `z.infer<typeof Schema>`
- Never duplicate types manually

### Imports

- `@packages/*` for cross-package imports
- `@/*` for intra-workspace imports
- Always use path aliases, never relative paths across package boundaries

### Logging

- Use Pino structured loggers (`apiLogger`, `dbLogger`, `authLogger`, `aiLogger`)
- Never use `console.log` in production code

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the conventions above
3. Ensure all checks pass: `bun turbo type-check && bun turbo lint && bun turbo test`
4. Submit a PR with a clear description of changes
