# Hermes Snippet Vault

**AI-powered code snippet manager with semantic search.**

A full-stack application for storing, organizing, searching, and analyzing code snippets. Built with Angular 22 (signals, zoneless), NestJS, TypeORM, and SQLite (Neon-ready for PostgreSQL).

---

## Features

- **📝 Snippet Management** — Create, edit, delete, and browse code snippets with syntax highlighting
- **🏷️ Tag System** — Organize snippets with color-coded tags
- **📁 Collections** — Group snippets into curated collections
- **🔍 Full-Text Search** — Search across title, description, and code with relevance scoring
- **🤖 AI Analysis** — Automatic code analysis: language detection, complexity assessment, quality scoring, and suggestions
- **🔐 JWT Authentication** — Secure user registration and login
- **🎨 Modern UI** — Signal-based reactive Angular with Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (standalone, signals, zoneless, Tailwind CSS) |
| Backend | NestJS (TypeORM, Swagger, JWT auth) |
| Database | SQLite (dev) / Neon PostgreSQL (production-ready) |
| AI | Heuristic code analysis engine (LLM-ready strategy pattern) |
| Auth | JWT with bcryptjs password hashing |

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Angular 22  │────▶│  NestJS API  │────▶│   SQLite DB  │
│  (Signals)   │◀────│  (REST)      │◀────│  (TypeORM)   │
└─────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────▼──────┐
                     │  AI Analysis │
                     │  Engine     │
                     └─────────────┘
```

## Prerequisites

- Node.js 22+
- npm 10+
- (Optional) Neon PostgreSQL account for production

## Local Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd hermes-snippet-vault

# 2. Install backend dependencies
cd apps/api
cp ../../.env.example .env
npm install
npm run seed       # Seeds database with sample data
npm run start:dev  # Start API on http://localhost:3000

# 3. Install frontend dependencies
cd ../web
npm install
npm run build      # Build for production
# Or for development:
npx ng serve       # Start on http://localhost:4200
```

### Environment Variables

Copy `.env.example` to `apps/api/.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `DATABASE_TYPE` | Database driver | `better-sqlite3` |
| `DATABASE_URL` | Database path/URL | `data/snippets.db` |
| `JWT_SECRET` | JWT signing secret | `dev-secret-change-in-prod` |
| `NEON_API_KEY` | Neon API key (optional) | — |
| `NEON_PROJECT_ID` | Neon project ID (optional) | — |

## AI Capability

This project implements **AI Ladder Rung 3** (semantic search + structured analysis):

- **Code Analysis:** Heuristic engine detects language, assesses complexity, calculates quality score, and provides actionable suggestions
- **Semantic Search:** Full-text search with relevance scoring across title, description, and code content
- **LLM-Ready Architecture:** Strategy pattern allows swapping the heuristic engine for OpenAI/Anthropic at Rung 4+

## Roadmap

- [ ] **Neon PostgreSQL deployment** — Switch from SQLite to managed PostgreSQL
- [ ] **pgvector semantic search** — Replace LIKE search with embedding-based similarity search
- [ ] **LLM-powered analysis** — Integrate OpenAI/Anthropic for deep code reasoning
- [ ] **GitHub integration** — Import snippets from gists and repos
- [ ] **Syntax highlighting** — Better code display with Prism.js or Shiki
- [ ] **Collaborative collections** — Share collections with team members
