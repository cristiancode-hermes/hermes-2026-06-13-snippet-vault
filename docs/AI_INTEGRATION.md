# AI Integration

## AI Ladder Rung: 3

This project implements **Rung 3** of the AI capability ladder:

1. ❌ ~~Single LLM call~~ → (Code Coach built strategy pattern)
2. ✅ Streaming + structured outputs → (Habit Tracker)
3. ✅ **Semantic search + structured analysis** ← Current
4. ❌ Full RAG pipeline
5. ❌ Tool-using agent
6. ❌ Multi-step agent workflows

## Architecture

The AI system has two independent components:

### 1. Code Analysis Engine

**Location:** `apps/api/src/ai-analysis/ai-analysis.service.ts`

Uses a **heuristic strategy pattern** to analyze code without external API calls:

```typescript
export interface AnalysisStrategy {
  analyze(code: string, language: string): AnalysisResult;
}
```

Current strategy (`runHeuristicAnalysis`) performs:

- **Language detection:** Regex-based detection for TypeScript, JavaScript, Python, C++, Java, HTML, JSON, CSS
- **Complexity assessment:** Counts conditionals, functions, nesting depth, and line count
- **Quality scoring:** Starts at 100 and deducts for issues (markers like TODO/FIXME, missing description, empty code)
- **Suggestions:** Identifies TODO/FIXME/HACK markers, console.log/debugger statements

**LLM Upgrade Path:**
The `analyze()` method in `AiAnalysisService` can be extended by injecting a new strategy that calls OpenAI/Anthropic:

```typescript
class LLMAnalysisStrategy implements AnalysisStrategy {
  async analyze(code: string, language: string): Promise<AnalysisResult> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Analyze this code...' },
        { role: 'user', content: code }
      ],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0].message.content);
  }
}
```

### 2. Semantic Search

**Location:** `apps/api/src/search/search.controller.ts`

Implements a multi-field full-text search with relevance ranking:

| Match Location | Weight |
|----------------|--------|
| Exact title match | 100 |
| Partial title match | 50 |
| Description match | 30 |
| Code content match | 20 |

Results are sorted by relevance score descending, limited to 50 results.

**pgvector Upgrade Path:**
1. Enable pgvector on Neon: `CREATE EXTENSION vector;`
2. Add embedding column to Snippet: `ALTER TABLE snippet ADD COLUMN embedding vector(1536);`
3. Generate embeddings via OpenAI API on snippet create/update
4. Replace LIKE search with: `SELECT * FROM snippet ORDER BY embedding <-> $query_embedding LIMIT 10;`

## Failure Modes Handled

- **Empty code:** Returns score 0 with "Snippet is empty" suggestion
- **Unknown language:** Falls back to 'plaintext'
- **Missing description:** Small score penalty (-5)
- **API failure:** The heuristic engine doesn't depend on external APIs, so it never fails
- **Malformed code:** All regex operations are safe — no exceptions thrown

## Model Choices

| Component | Model or Technique | Notes |
|-----------|-------------------|-------|
| Language detection | Regex-based heuristics | No model inference needed |
| Complexity analysis | Static code metrics | Line count, nesting, conditionals |
| Quality scoring | Rule-based (100 - deductions) | Transparent, deterministic |
| Search | SQL LIKE with relevance scoring | pgvector-ready for production |

## Cost / Latency

| Component | Time | Cost |
|-----------|------|------|
| Heuristic analysis | < 5ms | Free |
| Search query | < 10ms | Free |
| Total page load | < 100ms | Free |
