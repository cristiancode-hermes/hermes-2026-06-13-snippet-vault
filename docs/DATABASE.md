# Database Schema

## Entity-Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │       │   Snippet    │◀──────│AiAnalysis│
│──────────│       │──────────────│ 1:N   │──────────│
│id        │       │id            │       │id        │
│username  │       │title         │       │snippetId │
│email     │       │description   │       │type      │
│password  │       │code          │       │content   │
│createdAt │       │language      │       │score     │
└──────────┘       │createdAt     │       │createdAt │
                   │updatedAt     │       └──────────┘
                   └──────┬───────┘
                          │
                   M:N    │    M:N
             ┌────────────┼────────────┐
             │            │            │
      ┌──────▼───┐  ┌────▼────┐       │
      │   Tag    │  │Collection│       │
      │──────────│  │─────────│       │
      │id        │  │id       │       │
      │name      │  │name     │       │
      │color     │  │desc     │       │
      └──────────┘  │color    │       │
                    │createdAt│       │
                    └─────────┘       │
```

## Tables

### User
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| username | VARCHAR(255) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| passwordHash | VARCHAR(255) | NOT NULL |
| createdAt | DATETIME | DEFAULT NOW() |

### Snippet
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| code | TEXT | NOT NULL |
| language | VARCHAR(50) | DEFAULT 'plaintext' |
| createdAt | DATETIME | DEFAULT NOW() |
| updatedAt | DATETIME | DEFAULT NOW(), ON UPDATE |

### Tag
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| color | VARCHAR(7) | DEFAULT '#3B82F6' |

### Snippet-Tag Junction (implicit via TypeORM @JoinTable)
| Column | Type |
|--------|------|
| snippetId | INTEGER | FK → Snippet.id |
| tagId | INTEGER | FK → Tag.id |

### Collection
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| color | VARCHAR(7) | DEFAULT '#8B5CF6' |
| createdAt | DATETIME | DEFAULT NOW() |

### Collection-Snippet Junction (implicit via TypeORM @JoinTable)
| Column | Type |
|--------|------|
| collectionId | INTEGER | FK → Collection.id |
| snippetId | INTEGER | FK → Snippet.id |

### AiAnalysis
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| snippetId | INTEGER | FK → Snippet.id, ON DELETE CASCADE |
| analysisType | VARCHAR(50) | NOT NULL |
| content | TEXT | NOT NULL |
| score | FLOAT | NULLABLE |
| createdAt | DATETIME | DEFAULT NOW() |

## Migration Strategy

Currently using TypeORM `synchronize: true` for development. In production:

1. Generate migration: `npx typeorm migration:create src/migrations/MigrationName`
2. Run migrations: `npx typeorm migration:run`
3. Disable `synchronize` in production config

## Neon PostgreSQL Migration

To switch from SQLite to Neon PostgreSQL:

1. Create a Neon project and get the connection string
2. Set `DATABASE_TYPE=postgres` and `DATABASE_URL=<neon-connection-string>` in `.env`
3. Install `pg` driver: `npm install pg`
4. Enable `pgvector` extension for semantic search: `CREATE EXTENSION vector;`
5. Run initial schema sync or migrations
