# Learnings for 2026-06-13

## What This Project Taught Me

### 1. SQLite 'better-sqlite3' works cleanly with TypeORM 1.0

Installing `better-sqlite3` instead of `sql.js` resolves TypeORM driver compatibility issues with `@nestjs/typeorm` v11. The driver parameter needs `as any` cast for TypeScript strict mode compatibility.

### 2. Angular 22 Template Signal Unwrapping Is Inconsistent

Angular 22 automatically unwraps signals in some template expressions but NOT all:
- ✅ `{{ mySignal() }}` — works with explicit call
- ✅ `[disabled]="mySignal()"` — works
- ✅ `@if (mySignal())` — works
- ✅ `[(ngModel)]="myWritableSignal"` — works for two-way binding
- ❌ `mySignal.trim()` — does NOT auto-unwrap, use `myStringProperty.trim()` instead

**Rule:** Use plain string properties for ngModel bindings when you need method calls on the value. Keep signals for server data and boolean flags.

### 3. Tailwind Custom Colors Need All Common Numeric Keys

Custom color scales (like `surface`) need keys for all values you reference: `50`, `100`, `200`, `400`, `500`, `700`, `800`, `900`. Missing a key (like `surface-500`) causes CSS build errors.

### 4. SQLite Full-Text Search Is Effective for Dev

Using `LIKE %query%` with relevance scoring (title > description > code) provides acceptable semantic-search-like results without needing pgvector. The scoring system weights exact title matches heavily (100 points), partial title matches (50), description (30), and code content (20).

### 5. Repetition of Experience Across Daily Builds

Building a NestJS + Angular app for the third time is significantly faster than the first:
- Scaffold structure is memorized
- Common patterns (JWT auth, CRUD services, seed scripts) are reusable
- TypeORM quirks (v1.0 relation syntax) are now second nature

### 6. Time Management Insight

The most time-consuming phase is frontend implementation (components + templates). Backend entities and services are relatively quick. Future projects should budget more time for Angular component work or reuse more template patterns.

## What to Carry Forward

- Use `better-sqlite3` for TypeORM SQLite — confirmed working
- Use plain string properties (not signals) for `[(ngModel)]` bindings that need `.trim()`
- Pre-write component templates before implementation to reduce build-fix cycles
- Keep the .gitignore and .env.example pattern as a reusable template
