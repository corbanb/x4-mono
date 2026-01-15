# 00-CHECKLIST.md
## Master Build Orchestration for AI-Driven Monorepo Construction

**Version**: 1.0  
**Last Updated**: January 2026  
**Purpose**: Single source of truth for building Corban's production-ready monorepo from scratch

---

## Overview

This checklist orchestrates the complete construction of a TypeScript monorepo with web, mobile, and desktop applications, shared packages, authentication, database, AI integration, and full CI/CD.

**Total Estimated Time**: 16-24 hours (AI-assisted)  
**Phases**: 7 major phases, 17 documentation references  
**Target**: Production-ready monorepo template

---

## How to Use This Checklist

### For AI Agents (Claude Code, Cursor):
1. Read this entire checklist first
2. Execute phases sequentially (unless marked parallel)
3. Verify acceptance criteria before moving to next phase
4. Reference detailed docs for implementation specifics
5. Report completion status and any blockers

### For Human Developers:
1. Use this as progress tracker
2. Delegate phases to AI agents
3. Review and approve critical decisions (marked with ⚠️)
4. Verify acceptance criteria manually if needed

---

## Prerequisites

Before starting, ensure:
- [ ] Git installed and configured
- [ ] GitHub account with repo creation access
- [ ] Node.js 20+ installed
- [ ] pnpm installed globally
- [ ] Text editor/IDE configured (VSCode recommended)
- [ ] Terminal access
- [ ] Environment variables strategy defined (.env files)

---

## Phase 0: Planning & Discovery
**Estimated Time**: 1-2 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

### Tasks

- [ ] **0.1** Read complete project requirements
  - Reference: Project brief, user stories, technical requirements
  - Output: Understanding of what we're building

- [ ] **0.2** Review all documentation structure
  - Reference: `monorepo-docs-plan.md`
  - Output: Mental model of the build process

- [ ] **0.3** Identify required workspaces
  - Web app: ✅ Always included
  - Mobile app: ⬜ Yes / ⬜ No / ⬜ Later
  - Desktop app: ⬜ Yes / ⬜ No / ⬜ Later
  - Separate API: ⬜ Yes / ⬜ No (use Next.js API routes)
  - Marketing site: ⬜ Yes / ⬜ No / ⬜ Later
  - Output: Clear list of workspaces to build

- [ ] **0.4** Define data model (high-level)
  - Core entities (User, Project, etc.)
  - Relationships
  - Output: Entity relationship diagram or list

- [ ] **0.5** Identify AI integration points
  - Where does AI add value?
  - Which features need AI?
  - Output: List of AI use cases

### ⚠️ Critical Decisions (Human Approval Required)
- [ ] Project name: `corban-[project-name]`
- [ ] Primary platforms: Web / Mobile / Desktop / All
- [ ] Database choice: Supabase / AWS RDS / Self-hosted
- [ ] Auth provider: NextAuth / Clerk / Custom
- [ ] AI integration: Yes / No / Later

### Acceptance Criteria
- ✓ All workspaces identified
- ✓ Data model sketched
- ✓ Critical decisions documented
- ✓ Ready to start setup phase

---

## Phase 1: Repository Setup & Foundation
**Estimated Time**: 2-3 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**Reference**: `01-SETUP.md`

### Tasks

#### 1.1 Repository Initialization
- [ ] **1.1.1** Create GitHub repository
  - Name: `corban-[project-name]`
  - Visibility: Private (initially)
  - Initialize with README: No (we'll create custom)
  - Output: Repository URL

- [ ] **1.1.2** Clone repository locally
  ```bash
  git clone https://github.com/corban/corban-[project-name]
  cd corban-[project-name]
  ```

- [ ] **1.1.3** Create initial commit structure
  ```bash
  # Will be populated in subsequent steps
  git commit --allow-empty -m "Initial commit"
  ```

#### 1.2 Root Configuration
- [ ] **1.2.1** Create `.nvmrc`
  ```
  20
  ```

- [ ] **1.2.2** Create root `package.json`
  - Reference: `01-SETUP.md` section "Root package.json"
  - Includes: workspace config, scripts, devDependencies
  - Output: `package.json` with correct workspace paths

- [ ] **1.2.3** Create `pnpm-workspace.yaml`
  ```yaml
  packages:
    - 'packages/*'
    - 'apps/*'
  ```

- [ ] **1.2.4** Install pnpm (if not installed)
  ```bash
  npm install -g pnpm@9
  ```

- [ ] **1.2.5** Initialize pnpm
  ```bash
  pnpm install
  ```

#### 1.3 Turborepo Setup
- [ ] **1.3.1** Install Turborepo
  ```bash
  pnpm add -D turbo
  ```

- [ ] **1.3.2** Create `turbo.json`
  - Reference: `01-SETUP.md` section "Turborepo Configuration"
  - Includes: pipeline definitions, cache config
  - Output: `turbo.json` with build/test/lint pipelines

#### 1.4 TypeScript Foundation
- [ ] **1.4.1** Create `tsconfig.base.json`
  - Reference: `01-SETUP.md` section "TypeScript Base Config"
  - Strict mode enabled
  - Path aliases configured
  - Output: Base TypeScript configuration

#### 1.5 Git Configuration
- [ ] **1.5.1** Create `.gitignore`
  - Reference: `01-SETUP.md` section "Git Ignore Patterns"
  - Includes: node_modules, .env, build artifacts, OS files
  - Output: Comprehensive `.gitignore`

- [ ] **1.5.2** Create `.gitattributes`
  ```
  * text=auto
  *.js text eol=lf
  *.ts text eol=lf
  *.tsx text eol=lf
  *.json text eol=lf
  ```

#### 1.6 Environment Configuration
- [ ] **1.6.1** Create root `.env.example`
  - Reference: `01-SETUP.md` section "Environment Variables"
  - Includes: Common secrets, API keys (placeholder)
  - Output: `.env.example` with all required vars

- [ ] **1.6.2** Create `.env` (local, gitignored)
  - Copy from `.env.example`
  - Add real values
  - Output: Local environment configuration

#### 1.7 Directory Structure
- [ ] **1.7.1** Create base directories
  ```bash
  mkdir -p packages apps .github/workflows docs
  ```

- [ ] **1.7.2** Create README.md
  - Reference: `01-SETUP.md` section "README Template"
  - Includes: Project overview, getting started, architecture
  - Output: Comprehensive README

- [ ] **1.7.3** Create CONTRIBUTING.md
  - Reference: `01-SETUP.md` section "Contributing Guidelines"
  - Includes: Development workflow, patterns, PR process
  - Output: Contribution guide

### Acceptance Criteria
- ✓ `pnpm install` runs successfully
- ✓ `pnpm turbo run build` runs (even if nothing to build yet)
- ✓ Repository structure is clean and organized
- ✓ Environment variables are templated
- ✓ TypeScript base config is valid
- ✓ Git is configured correctly

### Verification Commands
```bash
pnpm --version  # Should be 9.x
turbo --version # Should be latest
node --version  # Should be 20.x
git status      # Should be clean
```

---

## Phase 2: Architecture & Shared Infrastructure
**Estimated Time**: 3-4 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**References**: `02-ARCHITECTURE.md`, `16-MONOREPO-PATTERNS.md`, `03-SHARED-PACKAGES.md`

### Tasks

#### 2.1 Architecture Documentation
- [ ] **2.1.1** Document architectural decisions
  - Reference: `02-ARCHITECTURE.md`
  - Create: `docs/architecture/ADR-001-monorepo-structure.md`
  - Output: Architectural Decision Record

- [ ] **2.1.2** Define workspace boundaries
  - Reference: `16-MONOREPO-PATTERNS.md`
  - Document what goes where (apps vs packages)
  - Output: Clear workspace ownership matrix

#### 2.2 Shared Packages - Types
- [ ] **2.2.1** Create `packages/shared` structure
  ```bash
  mkdir -p packages/shared/types
  mkdir -p packages/shared/utils
  mkdir -p packages/shared/api-client
  mkdir -p packages/shared/hooks
  mkdir -p packages/shared/ai
  ```

- [ ] **2.2.2** Setup `packages/shared/types`
  - Reference: `03-SHARED-PACKAGES.md` section "Types Package"
  - Create: `packages/shared/types/package.json`
  - Create: `packages/shared/types/tsconfig.json`
  - Create: `packages/shared/types/index.ts`
  - Create: `packages/shared/types/domain.ts` (core types)
  - Create: `packages/shared/types/api.ts` (API types)
  - Create: `packages/shared/types/errors.ts` (error types)
  - Output: Shared type definitions

- [ ] **2.2.3** Define core domain types
  - Reference: `05-DATA-MODELING.md` for schema
  - Types: User, Project, Session, etc.
  - Output: Type definitions matching data model

#### 2.3 Shared Packages - Utils
- [ ] **2.3.1** Setup `packages/shared/utils`
  - Reference: `03-SHARED-PACKAGES.md` section "Utils Package"
  - Create: `packages/shared/utils/package.json`
  - Create: `packages/shared/utils/tsconfig.json`
  - Install: `zod` for validation
  - Output: Utils package structure

- [ ] **2.3.2** Create Zod validation schemas
  - Reference: `05-DATA-MODELING.md` section "Validation"
  - Create: `packages/shared/utils/validators.ts`
  - Schemas: UserSchema, ProjectSchema, etc.
  - Output: Runtime validation schemas

- [ ] **2.3.3** Create utility functions
  - Create: `packages/shared/utils/formatting.ts` (dates, currency)
  - Create: `packages/shared/utils/helpers.ts` (common utils)
  - Create: `packages/shared/utils/constants.ts` (shared constants)
  - Output: Shared utility functions

#### 2.4 Shared Packages - AI
- [ ] **2.4.1** Setup `packages/shared/ai`
  - Reference: `10-AI-INTEGRATION.md` section "Shared AI Package"
  - Create: `packages/shared/ai/package.json`
  - Create: `packages/shared/ai/tsconfig.json`
  - Install: `ai` (Vercel AI SDK), `@ai-sdk/anthropic`, `@ai-sdk/openai`
  - Output: AI integration package

- [ ] **2.4.2** Create AI abstraction layer
  - Create: `packages/shared/ai/index.ts` (provider factory)
  - Create: `packages/shared/ai/types.ts` (AI types)
  - Create: `packages/shared/ai/providers/claude.ts`
  - Create: `packages/shared/ai/providers/openai.ts`
  - Output: Provider-agnostic AI interface

- [ ] **2.4.3** Create prompt management
  - Create: `packages/shared/ai/prompts/system.ts`
  - Create: `packages/shared/ai/prompts/index.ts`
  - Output: Centralized prompt templates

- [ ] **2.4.4** Create cost tracking utilities
  - Create: `packages/shared/ai/utils.ts` (token counting, cost estimation)
  - Output: AI cost monitoring

#### 2.5 Database Package
- [ ] **2.5.1** Setup `packages/database`
  - Reference: `05-DATA-MODELING.md` section "Database Package"
  - Create: `packages/database/package.json`
  - Create: `packages/database/tsconfig.json`
  - Install: `drizzle-orm`, `postgres` or `@neondatabase/serverless`
  - Output: Database package structure

- [ ] **2.5.2** Define database schema
  - Reference: `05-DATA-MODELING.md` section "Schema Design"
  - Create: `packages/database/schema.ts`
  - Tables: users, projects, etc.
  - Output: Drizzle schema definitions

- [ ] **2.5.3** Create initial migration
  - Create: `packages/database/migrations/001_init.sql`
  - Reference: Schema definitions
  - Output: Initial database migration

- [ ] **2.5.4** Create seed script
  - Create: `packages/database/seed.ts`
  - Output: Development data seeding

- [ ] **2.5.5** Setup database client
  - Create: `packages/database/index.ts`
  - Export: `db` client
  - Output: Database connection singleton

#### 2.6 Authentication Package
- [ ] **2.6.1** Setup `packages/auth`
  - Reference: `04-AUTHENTICATION.md` section "Auth Package"
  - Create: `packages/auth/package.json`
  - Create: `packages/auth/tsconfig.json`
  - Install: `next-auth@beta`, `@auth/drizzle-adapter`, `jsonwebtoken`
  - Output: Auth package structure

- [ ] **2.6.2** Configure NextAuth
  - Reference: `04-AUTHENTICATION.md` section "NextAuth Setup"
  - Create: `packages/auth/nextauth.ts`
  - Providers: GitHub, Credentials
  - Output: NextAuth configuration

- [ ] **2.6.3** Create JWT utilities
  - Create: `packages/auth/jwt.ts`
  - Functions: createToken, verifyToken
  - Output: JWT helpers for mobile

### ⚠️ Critical Decisions (Human Approval Required)
- [ ] Database provider: Supabase / Neon / AWS RDS / Self-hosted
- [ ] Auth providers: GitHub / Google / Email / All of above
- [ ] AI providers: Claude / OpenAI / Both / None (initially)

### Acceptance Criteria
- ✓ All shared packages install successfully
- ✓ Types compile without errors
- ✓ Validation schemas work correctly
- ✓ Database schema is valid
- ✓ Auth configuration compiles
- ✓ No circular dependencies between packages

### Verification Commands
```bash
pnpm -r run build          # Build all packages
pnpm -r run type-check     # Type check all packages
turbo run build --dry-run  # Check dependency graph
```

---

## Phase 3: API Layer
**Estimated Time**: 2-3 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**References**: `06-API-DESIGN.md`, `03-SHARED-PACKAGES.md`

### Tasks

#### 3.1 API Client Package
- [ ] **3.1.1** Setup `packages/shared/api-client`
  - Reference: `03-SHARED-PACKAGES.md` section "API Client"
  - Create: `packages/shared/api-client/package.json`
  - Create: `packages/shared/api-client/tsconfig.json`
  - Install: `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`
  - Output: tRPC client package

- [ ] **3.1.2** Create tRPC client setup
  - Reference: `06-API-DESIGN.md` section "Client Setup"
  - Create: `packages/shared/api-client/client.ts`
  - Create: `packages/shared/api-client/hooks.ts`
  - Output: Type-safe API client

#### 3.2 API Service (Optional - if separate from Next.js)
- [ ] **3.2.1** Decide: Separate API or Next.js API routes?
  - Separate API: ✅ Create `apps/api`
  - Next.js routes: ⬜ Skip this section, use Next.js
  - Decision: [To be filled]

- [ ] **3.2.2** If separate API: Setup `apps/api`
  - Reference: `06-API-DESIGN.md` section "Standalone API"
  - Create: `apps/api/package.json`
  - Create: `apps/api/tsconfig.json`
  - Install: `@trpc/server`, `express` or `hono`
  - Output: API service structure

- [ ] **3.2.3** Create tRPC context
  - Reference: `06-API-DESIGN.md` section "Context Setup"
  - Create: `apps/api/src/context.ts`
  - Includes: auth, database, session
  - Output: Request context setup

- [ ] **3.2.4** Create base tRPC router
  - Create: `apps/api/src/trpc.ts`
  - Define: router, publicProcedure, protectedProcedure
  - Output: tRPC foundation

#### 3.3 API Routers
- [ ] **3.3.1** Create users router
  - Reference: `06-API-DESIGN.md` section "Router Patterns"
  - Create: `apps/api/src/routers/users.ts`
  - Endpoints: get, list, update
  - Output: User management API

- [ ] **3.3.2** Create projects router
  - Create: `apps/api/src/routers/projects.ts`
  - Endpoints: create, get, list, update, delete
  - Output: Project management API

- [ ] **3.3.3** Create AI router (if AI integration)
  - Reference: `10-AI-INTEGRATION.md` section "API Routes"
  - Create: `apps/api/src/routers/ai.ts`
  - Endpoints: generate, stream
  - Output: AI feature API

- [ ] **3.3.4** Combine routers
  - Create: `apps/api/src/routers/index.ts`
  - Export: `AppRouter` type
  - Output: Main router export

#### 3.4 API Server Entry
- [ ] **3.4.1** Create server entry point
  - Create: `apps/api/src/index.ts`
  - Setup: HTTP server, CORS, error handling
  - Output: Runnable API server

### Acceptance Criteria
- ✓ tRPC client compiles
- ✓ API server starts without errors
- ✓ Type inference works (client knows server types)
- ✓ Protected procedures require auth
- ✓ Validation works on inputs

### Verification Commands
```bash
pnpm --filter api dev          # Start API server (if separate)
pnpm --filter api-client build # Build client package
```

---

## Phase 4: Platform Applications
**Estimated Time**: 6-8 hours (varies by number of platforms)  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**References**: `07-WEB-APP.md`, `08-MOBILE-APP.md`, `09-DESKTOP-APP.md`

### 4A: Web Application (Always Required)

#### 4A.1 Next.js Setup
- [ ] **4A.1.1** Create `apps/web`
  - Reference: `07-WEB-APP.md` section "Initial Setup"
  - Command: `pnpm create next-app@latest apps/web --typescript --tailwind --app --use-pnpm`
  - Configure: No src directory (we'll use src/app)
  - Output: Next.js application

- [ ] **4A.1.2** Configure workspace
  - Update: `apps/web/package.json` (add workspace dependencies)
  - Update: `apps/web/tsconfig.json` (extend base, add paths)
  - Create: `apps/web/.env.example`
  - Output: Properly configured Next.js app

#### 4A.2 Directory Structure
- [ ] **4A.2.1** Organize file structure
  - Reference: `07-WEB-APP.md` section "File Organization"
  - Create: `apps/web/src/app/` (Next.js App Router)
  - Create: `apps/web/src/components/`
  - Create: `apps/web/src/lib/`
  - Create: `apps/web/src/hooks/`
  - Output: Clean directory structure

#### 4A.3 tRPC Integration
- [ ] **4A.3.1** Setup tRPC provider
  - Reference: `07-WEB-APP.md` section "tRPC Setup"
  - Create: `apps/web/src/lib/trpc.ts`
  - Create: `apps/web/src/app/providers.tsx`
  - Output: tRPC integrated with React Query

- [ ] **4A.3.2** Configure API endpoint
  - If separate API: Point to API URL
  - If Next.js API routes: Create `apps/web/src/app/api/trpc/[trpc]/route.ts`
  - Output: tRPC endpoint working

#### 4A.4 Authentication Integration
- [ ] **4A.4.1** Setup NextAuth
  - Reference: `04-AUTHENTICATION.md` section "Next.js Integration"
  - Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
  - Import: NextAuth config from `@packages/auth`
  - Output: Auth routes working

- [ ] **4A.4.2** Create middleware
  - Create: `apps/web/src/middleware.ts`
  - Protect: Dashboard routes
  - Output: Protected routes

- [ ] **4A.4.3** Create auth components
  - Create: `apps/web/src/components/LoginForm.tsx`
  - Create: `apps/web/src/components/SignupForm.tsx`
  - Output: Authentication UI

#### 4A.5 Core Pages
- [ ] **4A.5.1** Create landing page
  - Create: `apps/web/src/app/page.tsx`
  - Output: Public homepage

- [ ] **4A.5.2** Create auth pages
  - Create: `apps/web/src/app/login/page.tsx`
  - Create: `apps/web/src/app/signup/page.tsx`
  - Output: Auth pages

- [ ] **4A.5.3** Create dashboard layout
  - Create: `apps/web/src/app/dashboard/layout.tsx`
  - Protected: Requires auth
  - Output: Dashboard shell

- [ ] **4A.5.4** Create dashboard pages
  - Create: `apps/web/src/app/dashboard/page.tsx`
  - Create: `apps/web/src/app/dashboard/projects/page.tsx`
  - Output: Main dashboard views

#### 4A.6 UI Components
- [ ] **4A.6.1** Setup component library
  - Reference: `14-UI-DESIGN-SYSTEM.md`
  - Install: `shadcn/ui` components
  - Output: Base UI components

- [ ] **4A.6.2** Create common components
  - Navigation, Footer, Cards, Forms
  - Output: Reusable components

### Acceptance Criteria (Web)
- ✓ `pnpm --filter web dev` starts successfully
- ✓ Can access homepage
- ✓ Can login/signup
- ✓ Dashboard requires authentication
- ✓ tRPC queries work
- ✓ Types are shared from packages

---

### 4B: Mobile Application (Optional)

#### 4B.1 Expo Setup
- [ ] **4B.1.1** Create `apps/mobile`
  - Reference: `08-MOBILE-APP.md` section "Initial Setup"
  - Command: `pnpm create expo-app@latest apps/mobile --template`
  - Template: Blank (TypeScript)
  - Output: Expo application

- [ ] **4B.1.2** Install Expo Router
  - Install: `expo-router`, `expo-linking`, `expo-constants`
  - Configure: `apps/mobile/app.json`
  - Output: File-based routing

#### 4B.2 tRPC Integration
- [ ] **4B.2.1** Setup tRPC client
  - Reference: `08-MOBILE-APP.md` section "API Integration"
  - Use: `@packages/shared/api-client`
  - Create: `apps/mobile/src/lib/trpc.ts`
  - Output: tRPC working on mobile

#### 4B.3 Authentication
- [ ] **4B.3.1** Setup secure storage
  - Install: `expo-secure-store`
  - Create: `apps/mobile/src/lib/auth.ts`
  - Output: Secure token storage

- [ ] **4B.3.2** Create auth provider
  - Create: `apps/mobile/src/providers/AuthProvider.tsx`
  - Output: Auth context for mobile

- [ ] **4B.3.3** Create auth screens
  - Create: `apps/mobile/app/(auth)/login.tsx`
  - Create: `apps/mobile/app/(auth)/signup.tsx`
  - Output: Mobile auth UI

#### 4B.4 Core Screens
- [ ] **4B.4.1** Create app layout
  - Create: `apps/mobile/app/_layout.tsx`
  - Output: Root layout with providers

- [ ] **4B.4.2** Create dashboard screens
  - Create: `apps/mobile/app/(dashboard)/index.tsx`
  - Create: `apps/mobile/app/(dashboard)/projects.tsx`
  - Output: Main screens

#### 4B.5 EAS Configuration
- [ ] **4B.5.1** Setup EAS
  - Reference: `08-MOBILE-APP.md` section "EAS Setup"
  - Create: `apps/mobile/eas.json`
  - Output: Build configuration

### Acceptance Criteria (Mobile)
- ✓ `pnpm --filter mobile start` runs
- ✓ Can run on simulator/emulator
- ✓ Auth flow works
- ✓ tRPC queries work
- ✓ Shares types with web app

---

### 4C: Desktop Application (Optional)

#### 4C.1 Electron Setup
- [ ] **4C.1.1** Create `apps/desktop`
  - Reference: `09-DESKTOP-APP.md` section "Initial Setup"
  - Manual setup with Electron + React
  - Output: Electron application

- [ ] **4C.1.2** Configure Electron
  - Create: `apps/desktop/src/main/main.ts`
  - Create: `apps/desktop/src/preload/preload.ts`
  - Output: Electron entry points

#### 4C.2 Renderer Process
- [ ] **4C.2.1** Setup React renderer
  - Create: `apps/desktop/src/renderer/App.tsx`
  - Share components with web where possible
  - Output: Desktop UI

#### 4C.3 tRPC Integration
- [ ] **4C.3.1** Connect to API
  - Use: `@packages/shared/api-client`
  - Handle: IPC for secure requests
  - Output: API integration

#### 4C.4 Build Configuration
- [ ] **4C.4.1** Setup electron-builder
  - Create: `apps/desktop/electron-builder.yml`
  - Output: Build config

### Acceptance Criteria (Desktop)
- ✓ `pnpm --filter desktop dev` runs
- ✓ Desktop window opens
- ✓ Auth works
- ✓ Can make API calls

---

## Phase 5: AI Integration
**Estimated Time**: 2-3 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**Reference**: `10-AI-INTEGRATION.md`

### Tasks

#### 5.1 AI API Routes
- [ ] **5.1.1** Create AI generation endpoint
  - Reference: `10-AI-INTEGRATION.md` section "API Routes"
  - Create: `apps/api/src/routers/ai.ts` (or Next.js route)
  - Use: `@packages/shared/ai`
  - Output: AI generation endpoint

- [ ] **5.1.2** Create streaming endpoint
  - Support: Streaming responses
  - Output: Streaming AI endpoint

#### 5.2 AI Features in Apps
- [ ] **5.2.1** Add AI to web app
  - Create: AI-powered feature component
  - Example: Content generator, chat interface
  - Output: Working AI feature in web

- [ ] **5.2.2** Add cost tracking
  - Track: Token usage per user
  - Display: Usage dashboard
  - Output: Cost monitoring

#### 5.3 Prompt Management
- [ ] **5.3.1** Create prompt library
  - Reference: `10-AI-INTEGRATION.md` section "Prompts"
  - Centralize: System prompts
  - Version: Prompt templates
  - Output: Managed prompts

### Acceptance Criteria
- ✓ Can generate AI responses
- ✓ Streaming works
- ✓ Cost tracking functional
- ✓ Prompts are centralized

---

## Phase 6: Testing, Tooling & Quality
**Estimated Time**: 3-4 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**References**: `11-TESTING.md`, `12-TOOLING.md`, `15-CODE-STANDARDS.md`

### 6.1 Testing Infrastructure

#### 6.1.1 Unit Testing Setup
- [ ] **6.1.1.1** Install Vitest
  - Reference: `11-TESTING.md` section "Vitest Setup"
  - Install: `vitest`, `@vitest/ui`
  - Create: `vitest.config.ts` (root and workspaces)
  - Output: Test runner configured

- [ ] **6.1.1.2** Write unit tests for packages
  - Test: `packages/shared/utils/validators.ts`
  - Test: `packages/shared/ai/utils.ts`
  - Output: Package tests

#### 6.1.2 Integration Testing
- [ ] **6.1.2.1** Setup API testing
  - Create: `apps/api/src/__tests__/integration/`
  - Test: API endpoints with real DB
  - Output: API integration tests

#### 6.1.3 Component Testing
- [ ] **6.1.3.1** Install React Testing Library
  - Install: `@testing-library/react`, `@testing-library/jest-dom`
  - Output: Component testing tools

- [ ] **6.1.3.2** Write component tests
  - Test: Key UI components
  - Output: Component tests

#### 6.1.4 E2E Testing
- [ ] **6.1.4.1** Setup Playwright
  - Reference: `11-TESTING.md` section "E2E Setup"
  - Install: `@playwright/test`
  - Create: `playwright.config.ts`
  - Output: E2E testing configured

- [ ] **6.1.4.2** Write critical path tests
  - Test: Signup → Login → Create project
  - Output: E2E test suite

### 6.2 Code Quality Tooling

#### 6.2.1 Linting
- [ ] **6.2.1.1** Setup ESLint
  - Reference: `12-TOOLING.md` section "ESLint"
  - Create: `.eslintrc.json`
  - Configure: TypeScript, React rules
  - Output: Linting configured

- [ ] **6.2.1.2** Setup Prettier
  - Create: `.prettierrc`
  - Create: `.prettierignore`
  - Output: Formatting configured

#### 6.2.2 Git Hooks
- [ ] **6.2.2.1** Setup Husky
  - Install: `husky`, `lint-staged`
  - Create: `.husky/pre-commit`
  - Output: Pre-commit hooks

- [ ] **6.2.2.2** Setup Commitlint
  - Install: `@commitlint/cli`, `@commitlint/config-conventional`
  - Create: `commitlint.config.js`
  - Output: Commit message linting

#### 6.2.3 Type Checking
- [ ] **6.2.3.1** Add type check script
  - Add to root `package.json`: `"type-check": "turbo run type-check"`
  - Add to each workspace: type-check script
  - Output: Type checking across monorepo

### 6.3 Code Standards
- [ ] **6.3.1** Document code patterns
  - Reference: `15-CODE-STANDARDS.md`
  - Create: `docs/code-standards.md`
  - Output: Pattern documentation

### Acceptance Criteria
- ✓ All tests pass
- ✓ Linting passes
- ✓ Type checking passes
- ✓ Pre-commit hooks work
- ✓ E2E critical paths pass

### Verification Commands
```bash
pnpm turbo run test
pnpm turbo run lint
pnpm turbo run type-check
pnpm test:e2e
```

---

## Phase 7: DevOps & Deployment
**Estimated Time**: 3-4 hours  
**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**Reference**: `13-DEVOPS.md`

### 7.1 GitHub Actions - CI

#### 7.1.1 Create CI Workflow
- [ ] **7.1.1.1** Create `.github/workflows/ci.yml`
  - Reference: `13-DEVOPS.md` section "CI Pipeline"
  - Jobs: lint, type-check, test, build
  - Caching: Turborepo cache
  - Output: CI workflow

- [ ] **7.1.1.2** Add selective testing
  - Only test: Changed workspaces
  - Use: `turbo run test --filter=[HEAD^]`
  - Output: Fast CI

#### 7.1.2 Add PR Checks
- [ ] **7.1.2.1** Require CI pass for PRs
  - GitHub settings: Require status checks
  - Output: PR protection rules

### 7.2 Deployment Workflows

#### 7.2.1 Web Deployment (Vercel)
- [ ] **7.2.1.1** Create `.github/workflows/deploy-web.yml`
  - Reference: `13-DEVOPS.md` section "Web Deployment"
  - Trigger: Push to main, changes in apps/web
  - Deploy: To Vercel
  - Output: Automated web deployment

- [ ] **7.2.1.2** Configure Vercel
  - Create: `vercel.json`
  - Setup: Vercel project
  - Add: Environment variables
  - Output: Vercel configured

#### 7.2.2 Mobile Deployment (EAS)
- [ ] **7.2.2.1** Create `.github/workflows/deploy-mobile.yml`
  - Reference: `13-DEVOPS.md` section "Mobile Deployment"
  - Trigger: Push to main, changes in apps/mobile
  - Build: Via EAS
  - Output: Automated mobile builds

- [ ] **7.2.2.2** Configure EAS secrets
  - Add: `EAS_TOKEN` to GitHub secrets
  - Output: EAS configured

#### 7.2.3 Desktop Deployment (GitHub Releases)
- [ ] **7.2.3.1** Create `.github/workflows/deploy-desktop.yml`
  - Reference: `13-DEVOPS.md` section "Desktop Deployment"
  - Trigger: Version tags
  - Build: For Windows, macOS, Linux
  - Upload: To GitHub Releases
  - Output: Desktop release workflow

### 7.3 Monitoring & Observability

#### 7.3.1 Error Tracking
- [ ] **7.3.1.1** Setup Sentry
  - Install: `@sentry/nextjs`, `@sentry/react-native`
  - Configure: `sentry.config.js`
  - Output: Error tracking

#### 7.3.2 Analytics
- [ ] **7.3.2.1** Setup analytics
  - Options: Vercel Analytics, PostHog, custom
  - Configure: In web and mobile apps
  - Output: Usage tracking

### Acceptance Criteria
- ✓ CI runs on every PR
- ✓ Web deploys automatically
- ✓ Mobile builds automatically
- ✓ Desktop releases on tags
- ✓ Error tracking works
- ✓ Analytics capturing data

### Verification Steps
1. Create PR → CI runs and passes
2. Merge to main → Web deploys
3. Tag release → Desktop builds
4. Trigger error → Appears in Sentry

---

## Final Verification Checklist

### Repository Health
- [ ] All packages build successfully
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Git history is clean
- [ ] Documentation is complete

### Functionality
- [ ] Can signup/login
- [ ] Can create projects
- [ ] API works correctly
- [ ] Auth protects routes
- [ ] AI features work (if included)
- [ ] Mobile app runs (if included)
- [ ] Desktop app runs (if included)

### DevOps
- [ ] CI runs on PRs
- [ ] Deployments are automated
- [ ] Monitoring is configured
- [ ] Environment variables documented
- [ ] Secrets are in secret management

### Documentation
- [ ] README is complete
- [ ] CONTRIBUTING is clear
- [ ] Architecture is documented
- [ ] API is documented
- [ ] Deployment process documented

---

## Post-Build Tasks

### 1. Repository Cleanup
- [ ] Remove boilerplate comments
- [ ] Verify all TODOs resolved
- [ ] Check for console.logs
- [ ] Verify no hardcoded secrets

### 2. Performance Baseline
- [ ] Run Lighthouse on web app
- [ ] Measure build times
- [ ] Document bundle sizes
- [ ] Set performance budgets

### 3. Security Audit
- [ ] Run `pnpm audit`
- [ ] Check for exposed secrets
- [ ] Verify HTTPS everywhere
- [ ] Review auth implementation

### 4. Documentation Polish
- [ ] Add usage examples
- [ ] Create troubleshooting guide
- [ ] Document common tasks
- [ ] Create video walkthrough (optional)

---

## Success Metrics

### Build Quality
- ✓ Zero TypeScript errors
- ✓ 80%+ test coverage on critical paths
- ✓ All CI checks passing
- ✓ Lighthouse score >90
- ✓ Bundle size <500kb (gzipped)

### Developer Experience
- ✓ `pnpm install` works first try
- ✓ `pnpm dev` starts all apps
- ✓ Hot reload works everywhere
- ✓ Type inference works
- ✓ Clear error messages

### Production Readiness
- ✓ Deployed and accessible
- ✓ Monitoring is active
- ✓ Backups configured
- ✓ SSL/TLS enabled
- ✓ Error tracking works

---

## Timeline Estimate

**Total Time**: 16-24 hours (AI-assisted)

| Phase | Estimated Time | Complexity |
|-------|----------------|------------|
| 0. Planning | 1-2 hours | Low |
| 1. Setup | 2-3 hours | Low |
| 2. Architecture | 3-4 hours | Medium |
| 3. API Layer | 2-3 hours | Medium |
| 4. Applications | 6-8 hours | High |
| 5. AI Integration | 2-3 hours | Medium |
| 6. Testing/Quality | 3-4 hours | Medium |
| 7. DevOps | 3-4 hours | Medium |

**Notes:**
- Times assume AI assistance (Claude Code, Cursor)
- Manual implementation would be 2-3x longer
- Parallel work can reduce total time
- First project is slowest, subsequent projects faster

---

## Common Issues & Solutions

### Issue: Circular dependencies
**Solution**: Review `16-MONOREPO-PATTERNS.md`, restructure imports

### Issue: Type errors across workspaces
**Solution**: Ensure all workspaces extend `tsconfig.base.json`

### Issue: CI is slow
**Solution**: Enable Turborepo remote caching, split jobs

### Issue: Environment variables not working
**Solution**: Check `.env.example` is copied to `.env`, verify var names

### Issue: Auth not working
**Solution**: Verify JWT_SECRET set, check NextAuth config

### Issue: Database migrations failing
**Solution**: Check DATABASE_URL, verify schema syntax

---

## Next Project Improvements

After completing first project, document:
- What took longer than expected?
- What could be automated better?
- Which docs need more detail?
- What patterns emerged?
- What would you change?

Update this checklist and documentation accordingly.

---

**Version History**
- v1.0 (January 2026): Initial comprehensive checklist

**Maintained by**: Corban + Technical Co-Founder Agent  
**Last Review**: January 2026
