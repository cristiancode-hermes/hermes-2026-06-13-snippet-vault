# Architecture

## System Design

The Snippet Vault follows a standard three-tier architecture with a clear separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│                   Client (Angular 22)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Snippet  │ │ Tags &   │ │Collection│ │ Search  │ │
│  │ Views    │ │ Manager  │ │ Browser  │ │ Page    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       └────────────┴───────────┴─────────────┘      │
│                        │ HTTP (JSON)                 │
└────────────────────────┼─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│                 API Gateway (NestJS)                  │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Snippets│ │ Tags   │ │Collection│ │   AI      │  │
│  │ Module  │ │ Module │ │ Module   │ │ Analysis  │  │
│  └────┬────┘ └───┬────┘ └────┬─────┘ └─────┬─────┘  │
│       └──────────┴──────────┴──────────────┘         │
│                        │ TypeORM                      │
└────────────────────────┼─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│                   Database (SQLite)                   │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Snippets│ │ Tags   │ │Collection│ │AiAnalysis │  │
│  │         │ │        │ │          │ │           │  │
│  └─────────┘ └────────┘ └──────────┘ └───────────┘  │
└──────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

### Monorepo Structure
```
/apps/web      — Angular 22 standalone SPA
/apps/api      — NestJS REST API
/docs          — All documentation
```

Reason: Simple monorepo without Nx/Turborepo overhead. Each app has its own `package.json` and can be developed independently.

### Signals Over RxJS
All component-local and application state uses Angular signals (`signal()`, `computed()`) instead of RxJS BehaviorSubjects. RxJS is only used at HTTP boundaries, bridged via `lastValueFrom()`.

Reason: Signals provide simpler state management with automatic change detection in a zoneless architecture.

### Heuristic AI (Strategy Pattern)
The AI analysis engine uses a heuristic strategy that can be swapped for an LLM-based implementation. The `AnalysisResult` interface defines the contract, and `AiAnalysisService` delegates to the strategy.

## Data Flow

1. **Read path:** Angular component → `ApiService` (HTTP) → NestJS controller → service → TypeORM → SQLite
2. **Write path:** Angular form → `ApiService` (HTTP with JWT) → NestJS guard → controller → service → TypeORM → SQLite  
3. **AI analysis:** Angular button click → `ApiService` → NestJS controller → `AiAnalysisService` → heuristic engine → persisted to `AiAnalysis` table
4. **Search:** Search input → `ApiService` → NestJS `SearchController` → TypeORM query with LIKE + relevance scoring → ranked results
