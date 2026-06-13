import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysis } from './ai-analysis.entity';
import { Snippet } from '../snippets/snippet.entity';

export interface AnalysisResult {
  language: string;
  complexity: 'low' | 'medium' | 'high';
  lines: number;
  suggestions: string[];
  score: number;
}

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    @InjectRepository(AiAnalysis)
    private readonly analysisRepo: Repository<AiAnalysis>,
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
  ) {}

  /**
   * Analyzes a code snippet. Uses built-in heuristics (no external API needed).
   * Designed with a Strategy pattern so a real LLM can be swapped in at Rung 4+.
   */
  async analyze(snippetId: number): Promise<AnalysisResult> {
    const snippet = await this.snippetRepo.findOneBy({ id: snippetId });
    if (!snippet) {
      throw new Error(`Snippet #${snippetId} not found`);
    }

    const result = this.runHeuristicAnalysis(snippet);

    // Persist analysis
    const analysis = this.analysisRepo.create({
      snippetId: snippet.id,
      analysisType: 'code_analysis',
      content: JSON.stringify(result),
      score: result.score,
      snippet: { id: snippet.id } as Snippet,
    });
    await this.analysisRepo.save(analysis);

    return result;
  }

  async getAnalyses(snippetId: number): Promise<AiAnalysis[]> {
    return this.analysisRepo.find({
      where: { snippetId },
      order: { createdAt: 'DESC' },
    });
  }

  private runHeuristicAnalysis(snippet: Snippet): AnalysisResult {
    const lines = snippet.code.split('\n').length;
    const charCount = snippet.code.length;
    const suggestionKeywords = [
      'TODO', 'FIXME', 'HACK', 'XXX',
      'console.log', 'debugger',
    ];

    const suggestions: string[] = [];
    for (const keyword of suggestionKeywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = snippet.code.match(regex);
      if (matches) {
        suggestions.push(`Found ${matches.length} "${keyword}" marker(s) in code`);
      }
    }

    // Language detection
    let detectedLanguage = snippet.language;
    if (detectedLanguage === 'plaintext' || !detectedLanguage) {
      detectedLanguage = this.detectLanguage(snippet.code);
    }

    // Complexity assessment
    const conditionals = (snippet.code.match(/if|else|switch|case|for|while|do/g) || []).length;
    const functions = (snippet.code.match(/function|=>|def |fn /g) || []).length;
    const nesting = Math.max(
      ...(snippet.code.match(/[{[()]}/g) || []).map((c) => {
        let depth = 0;
        let maxDepth = 0;
        for (const ch of snippet.code) {
          if ('{('.includes(ch)) depth++;
          if ('})'.includes(ch)) depth--;
          maxDepth = Math.max(maxDepth, depth);
        }
        return maxDepth;
      }),
    );

    let complexity: 'low' | 'medium' | 'high';
    let score = 100;

    if (conditionals > 15 || functions > 10 || nesting > 5 || lines > 200) {
      complexity = 'high';
      score -= 25;
    } else if (conditionals > 5 || functions > 4 || nesting > 2 || lines > 50) {
      complexity = 'medium';
      score -= 10;
    } else {
      complexity = 'low';
    }

    // Deduct for issues
    if (suggestions.length > 0) score -= suggestions.length * 5;
    if (!snippet.description) score -= 5;

    if (lines === 0) {
      suggestions.push('Snippet is empty or contains only whitespace');
      score = 0;
    }

    return {
      language: detectedLanguage,
      complexity,
      lines,
      suggestions,
      score: Math.max(0, score),
    };
  }

  private detectLanguage(code: string): string {
    // Simple heuristic language detection
    if (/^(import |export |from |interface |type |enum |const |let |function|class )/m.test(code)) {
      if (code.includes('@Component') || code.includes(': string') || code.includes(': number')) {
        return 'typescript';
      }
      if (code.includes('require(') || code.includes('module.exports')) {
        return 'javascript';
      }
      return 'javascript';
    }
    if (/^#include|int main|std::/.test(code)) return 'cpp';
    if (/^def |import |from |class .*:$/.test(code)) return 'python';
    if (/^package |import |public class|System\.out/.test(code)) return 'java';
    if (/^<!DOCTYPE|<html|<div/.test(code)) return 'html';
    if (/^{[^}]+:[^}]+}$/.test(code.trim())) return 'json';
    if (code.startsWith('{') && code.includes('"')) return 'json';
    return 'plaintext';
  }
}
