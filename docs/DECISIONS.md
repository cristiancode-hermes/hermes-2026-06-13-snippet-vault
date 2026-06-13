# Architecture Decision Records

## ADR-1: Monorepo without Nx/Turborepo

**Status:** Accepted

**Context:** Need to co-locate Angular frontend and NestJS backend in a single repository for easy development and deployment.

**Decision:** Use a simple monorepo structure with independent `package.json` files under `/apps/web` and `/apps/api`. No Nx or Turborepo.

**Alternatives Considered:**
- **Nx monorepo:** Powerful but adds complexity and build overhead for a two-app project
- **Separate repos:** Harder to coordinate API contract changes
- **Turborepo:** Good caching but unnecessary for this scope

**Consequence:** Simple CI/CD setup. Some duplicated dependencies (TypeScript, ESLint config). Easy to split into separate repos later.

## ADR-2: SQLite for Development, Neon for Production

**Status:** Accepted

**Context:** Need a database that works locally without external services, but can scale to production.

**Decision:** Use SQLite (via `better-sqlite3` and TypeORM) for development. Architecture is Neon/PostgreSQL-ready with a single config toggle.

**Alternatives Considered:**
- **Neon from day one:** Requires API key and network access — not always available
- **SQLite only:** Limits production scalability
- **In-memory SQLite:** Cannot inspect data between runs

**Consequence:** Simple local dev setup. Need migration scripts for production PostgreSQL deployment.

## ADR-3: Signals over RxJS for State Management

**Status:** Accepted

**Context:** Angular 22's zoneless change detection requires signal-based state management for optimal performance.

**Decision:** Use `signal()`, `computed()`, and `effect()` for all component state. RxJS only at HTTP boundaries via `lastValueFrom()`.

**Alternatives Considered:**
- **RxJS BehaviorSubjects:** Works with Zone.js but not optimal with zoneless
- **NgRx/Component Store:** Heavy for this scope
- **Angular Signals:** Native, first-class support in Angular 22

**Consequence:** Cleaner component code, automatic change detection, no manual subscriptions. Learning curve for developers used to RxJS.

## ADR-4: Strategy Pattern for AI Integration

**Status:** Accepted

**Context:** Need AI capabilities now without external API keys, but want to upgrade to LLM-powered analysis later.

**Decision:** Implement a strategy pattern where `AiAnalysisService` delegates to a pluggable `AnalysisStrategy`. The default heuristic strategy can be swapped for an LLM-based one.

**Alternatives Considered:**
- **Direct LLM calls:** Impossible without API keys
- **Heuristic only:** Hard to upgrade later
- **No AI:** Misses the AI ladder requirement

**Consequence:** Clean separation of concerns. Easy to add LLM provider. The heuristic strategy provides immediate value.

## ADR-5: JWT Auth with bcryptjs

**Status:** Accepted

**Context:** Need authentication for create/update/delete operations while keeping read access public.

**Decision:** JWT-based authentication with bcryptjs password hashing. Public endpoints for GET operations, authenticated for POST/PUT/DELETE.

**Alternatives Considered:**
- **Session-based auth:** Requires server-side state
- **OAuth:** Overkill for a developer tool
- **API keys:** Less user-friendly for demo purposes

**Consequence:** Simple token-based auth. Token expires after 7 days. No refresh token mechanism (acceptable for dev tool).

## ADR-6: Composite Primary Key for Snippet-Tag

**Status:** Accepted

**Context:** Snippets and Tags have a many-to-many relationship managed by TypeORM.

**Decision:** Use TypeORM's `@JoinTable()` decorator to auto-manage the junction table with composite primary key (snippetId, tagId).

**Alternatives Considered:**
- **Manual junction table:** More control but more boilerplate
- **JSON array of tag IDs:** Violates normalization
- **Comma-separated tags:** Anti-pattern

**Consequence:** TypeORM handles junction table creation and management. Cascade operations work correctly.
