import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Snippet, AnalysisResult } from '../models/models';

@Component({
  selector: 'app-snippet-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Loading -->
      @if (loading()) {
        <div class="card text-center py-12">
          <p class="text-surface-500 animate-pulse">Loading snippet...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="card text-center py-12 border-red-200 bg-red-50">
          <p class="text-red-600">{{ error() }}</p>
          <a routerLink="/snippets" class="btn-secondary mt-3">Back to snippets</a>
        </div>
      }

      @if (snippet(); as s) {
        <!-- Header -->
        <div class="card">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold text-surface-800">{{ s.title }}</h1>
              @if (s.description) {
                <p class="text-surface-500 mt-1">{{ s.description }}</p>
              }
              <div class="flex items-center gap-2 mt-3">
                <span class="px-2 py-0.5 text-xs rounded bg-surface-100 text-surface-600 font-mono">
                  {{ s.language }}
                </span>
                @for (tag of s.tags; track tag.id) {
                  <span class="px-2 py-0.5 text-xs rounded-full"
                        [style.background]="tag.color + '20'"
                        [style.color]="tag.color">
                    {{ tag.name }}
                  </span>
                }
              </div>
              <div class="text-xs text-surface-400 mt-2">
                Updated {{ s.updatedAt | date:'medium' }} •
                {{ s.code.split('\n').length }} lines
              </div>
            </div>
            @if (api.token()) {
              <div class="flex gap-2 shrink-0">
                <a [routerLink]="['/snippets', s.id, 'edit']" class="btn-secondary text-sm">Edit</a>
                <button (click)="deleteSnippet(s.id)" class="btn bg-red-50 text-red-600 hover:bg-red-100 text-sm">
                  Delete
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Code -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-surface-700">Code</h2>
            <button (click)="copyCode()" class="text-xs text-primary-600 hover:text-primary-700">
              {{ copied() ? 'Copied!' : 'Copy code' }}
            </button>
          </div>
          <pre class="bg-surface-900 text-surface-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed"><code>{{ s.code }}</code></pre>
        </div>

        <!-- AI Analysis -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-surface-700">AI Analysis</h2>
            <button (click)="analyzeSnippet(s.id)"
                    class="btn-primary text-sm"
                    [disabled]="analyzing()">
              {{ analyzing() ? 'Analyzing...' : 'Run Analysis' }}
            </button>
          </div>

          @if (analysisResult(); as result) {
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="p-3 rounded-lg bg-surface-50">
                <div class="text-xs text-surface-500">Complexity</div>
                <div class="font-semibold"
                     [class.text-green-600]="result.complexity === 'low'"
                     [class.text-yellow-600]="result.complexity === 'medium'"
                     [class.text-red-600]="result.complexity === 'high'">
                  {{ result.complexity | titlecase }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-surface-50">
                <div class="text-xs text-surface-500">Lines</div>
                <div class="font-semibold">{{ result.lines }}</div>
              </div>
              <div class="p-3 rounded-lg bg-surface-50">
                <div class="text-xs text-surface-500">Quality Score</div>
                <div class="font-semibold"
                     [class.text-green-600]="result.score >= 80"
                     [class.text-yellow-600]="result.score >= 50 && result.score < 80"
                     [class.text-red-600]="result.score < 50">
                  {{ result.score }}/100
                </div>
              </div>
            </div>

            @if (result.suggestions.length > 0) {
              <div class="border-t pt-4">
                <h3 class="text-sm font-medium text-surface-700 mb-2">Suggestions</h3>
                <ul class="space-y-1">
                  @for (suggestion of result.suggestions; track suggestion) {
                    <li class="text-sm text-surface-600 flex items-start gap-2">
                      <span class="text-yellow-500 mt-0.5">⚠️</span>
                      {{ suggestion }}
                    </li>
                  }
                </ul>
              </div>
            }

            @if (result.suggestions.length === 0) {
              <p class="text-sm text-surface-400 italic">No suggestions — code looks clean!</p>
            }
          } @else {
            <p class="text-sm text-surface-400 italic">
              Click "Run Analysis" to get AI-powered code quality insights.
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class SnippetDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly api = inject(ApiService);

  readonly snippet = signal<Snippet | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly analysisResult = signal<AnalysisResult | null>(null);
  readonly analyzing = signal(false);
  readonly copied = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSnippet(id);
  }

  async loadSnippet(id: number) {
    try {
      const s = await this.api.getSnippet(id);
      this.snippet.set(s);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load snippet');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteSnippet(id: number) {
    if (!confirm('Delete this snippet?')) return;
    try {
      await this.api.deleteSnippet(id);
      this.router.navigate(['/snippets']);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to delete snippet');
    }
  }

  async analyzeSnippet(id: number) {
    this.analyzing.set(true);
    try {
      const result = await this.api.analyzeSnippet(id);
      this.analysisResult.set(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
    } finally {
      this.analyzing.set(false);
    }
  }

  copyCode() {
    const code = this.snippet()?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
