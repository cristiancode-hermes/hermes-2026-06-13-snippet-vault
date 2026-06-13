export interface Snippet {
  id: number;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: Tag[];
  analyses: AiAnalysis[];
  createdAt: string;
  updatedAt: string;
  relevanceScore?: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  snippets?: Snippet[];
}

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  color: string;
  snippets?: Snippet[];
  createdAt: string;
}

export interface AiAnalysis {
  id: number;
  snippetId: number;
  analysisType: string;
  content: string;
  score: number | null;
  createdAt: string;
}

export interface AnalysisResult {
  language: string;
  complexity: 'low' | 'medium' | 'high';
  lines: number;
  suggestions: string[];
  score: number;
}

export interface AuthResponse {
  token: string;
}
