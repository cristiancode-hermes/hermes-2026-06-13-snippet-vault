# API Reference

Base URL: `http://localhost:3000/api`
Swagger UI: `http://localhost:3000/api/docs`

---

## Authentication

### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "example",
  "email": "user@example.com",
  "password": "securepass123"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "example",
  "password": "securepass123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Snippets

### List Snippets
```
GET /snippets
Query: ?language=typescript&tag=angular&search=binary

Response 200:
[
  {
    "id": 1,
    "title": "Binary Search",
    "description": "...",
    "code": "function binarySearch...",
    "language": "typescript",
    "tags": [...],
    "analyses": [...],
    "createdAt": "2026-06-13T01:00:00Z",
    "updatedAt": "2026-06-13T01:00:00Z"
  }
]
```

### Get Snippet
```
GET /snippets/:id

Response 200:
{
  "id": 1,
  "title": "Binary Search",
  "code": "function binarySearch...",
  "tags": [{"id": 1, "name": "algorithm", "color": "#EF4444"}],
  "analyses": [...]
}

Response 404:
{ "message": "Snippet #1 not found", "error": "Not Found" }
```

### Create Snippet
```
POST /snippets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Snippet",
  "description": "Description",
  "code": "console.log('hello');",
  "language": "javascript",
  "tagIds": [1, 2]
}

Response 201:
{ "id": 9, "title": "New Snippet", ... }
```

### Update Snippet
```
PUT /snippets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "code": "console.log('updated');"
}

Response 200:
{ "id": 9, "title": "Updated Title", ... }
```

### Delete Snippet
```
DELETE /snippets/:id
Authorization: Bearer <token>

Response 200 (no content)
```

---

## Tags

### List All Tags
```
GET /tags
Response 200:
[
  {"id": 1, "name": "typescript", "color": "#3178C6"},
  {"id": 2, "name": "angular", "color": "#DD0031"}
]
```

### Search Tags
```
GET /tags/search?q=type
Response 200:
[
  {"id": 1, "name": "typescript", "color": "#3178C6"}
]
```

### Create Tag
```
POST /tags
Authorization: Bearer <token>
{
  "name": "react",
  "color": "#61DAFB"
}
```

### Delete Tag
```
DELETE /tags/:id
Authorization: Bearer <token>
```

---

## Collections

### List Collections
```
GET /collections
Response 200:
[
  {
    "id": 1,
    "name": "Algorithms",
    "description": "Algorithm implementations",
    "color": "#EF4444",
    "snippets": [...],
    "createdAt": "..."
  }
]
```

### Get Collection
```
GET /collections/:id
```

### Create Collection
```
POST /collections
Authorization: Bearer <token>
{
  "name": "My Collection",
  "description": "Description",
  "color": "#8B5CF6"
}
```

### Add Snippet to Collection
```
POST /collections/:collectionId/snippets/:snippetId
Authorization: Bearer <token>
```

### Remove Snippet from Collection
```
DELETE /collections/:collectionId/snippets/:snippetId
Authorization: Bearer <token>
```

---

## AI Analysis

### Analyze Snippet
```
POST /ai/analyze/:snippetId

Response 200:
{
  "language": "typescript",
  "complexity": "low",
  "lines": 12,
  "suggestions": [
    "Found 1 \"console.log\" marker(s) in code"
  ],
  "score": 85
}
```

### Get Analyses
```
GET /ai/analyses/:snippetId
```

---

## Search

### Full-Text Search
```
GET /search?q=binary+search&language=typescript

Response 200:
[
  {
    "id": 1,
    "title": "Binary Search Implementation",
    "relevanceScore": 100,
    ...
  },
  ...
]
```
