import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Snippet } from '../models/models';

@Component({
  selector: 'app-snippet-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="space-y-4">
      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-3 items-center">
          <input #searchInput
                 (input)="searchQuery.set(searchInput.value)"
                 placeholder="Search snippets..."
                 class="input max-w-sm" />
          <select #langSelect
                  (change)="languageFilter.set(langSelect.value)"
                  class="input max-w-[160px]">
            <option value="">All Languages</option>
            @for (lang of languages; track lang) {
              <option [value]="lang">{{ lang }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="card text-center py-12">
          <p class="text-surface-500 animate-pulse">Loading snippets...</p>
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="card text-center py-12 border-red-200 bg-red-50">
          <p class="text-red-600">{{ error() }}</p>
          <button (click)="loadSnippets()" class="btn-secondary mt-3">Retry</button>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && !error() && snippets().length === 0) {
        <div class="card text-center py-12">
          <p class="text-surface-500 text-lg">No snippets yet</p>
          @if (api.token()) {
            <a routerLink="/snippets/new" class="btn-primary inline-block mt-4">
              Create your first snippet
            </a>
          }
        </div>
      }

      <!-- Snippet list -->
      @if (!loading() && !error()) {
        <div class="grid gap-4">
          @for (snippet of snippets(); track snippet.id) {
            <a [routerLink]="['/snippets', snippet.id]"
               class="card block hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-surface-800 truncate">
                    {{ snippet.title }}
                  </h3>
                  @if (snippet.description) {
                    <p class="text-sm text-surface-500 mt-1 line-clamp-2">
                      {{ snippet.description }}
                    </p>
                  }
                  <div class="flex items-center gap-2 mt-3">
                    <span class="px-2 py-0.5 text-xs rounded bg-surface-100 text-surface-600 font-mono">
                      {{ snippet.language }}
                    </span>
                    @for (tag of snippet.tags; track tag.id) {
                      <span class="px-2 py-0.5 text-xs rounded-full"
                            [style.background]="tag.color + '20'"
                            [style.color]="tag.color">
                        {{ tag.name }}
                      </span>
                    }
                    @if (snippet.relevanceScore) {
                      <span class="text-xs text-primary-600 ml-auto">
                        Score: {{ snippet.relevanceScore }}
                      </span>
                    }
                  </div>
                </div>
                <div class="text-xs text-surface-400 text-right shrink-0">
                  <div>{{ snippet.updatedAt | slice:0:10 }}</div>
                  <div class="mt-1">{{ snippet.code.split('\n').length }} lines</div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class SnippetListComponent implements OnInit {
  readonly api = inject(ApiService);
  readonly snippets = signal<Snippet[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly languageFilter = signal('');

  readonly languages = [
    'typescript', 'javascript', 'python', 'css', 'html', 'sql', 'json', 'plaintext',
  ];

  ngOnInit() {
    this.loadSnippets();
  }

  async loadSnippets() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const params: any = {};
      const lang = this.languageFilter();
      if (lang) params.language = lang;

      const q = this.searchQuery();
      if (q) {
        // Use search endpoint for full-text search
        const results = await this.api.search(q, lang || undefined);
        this.snippets.set(results);
      } else {
        const snippets = await this.api.getSnippets(params);
        this.snippets.set(snippets);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load snippets');
    } finally {
      this.loading.set(false);
    }
  }
}
