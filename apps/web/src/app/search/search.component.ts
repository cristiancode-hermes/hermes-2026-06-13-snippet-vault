import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Snippet } from '../models/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-4">
      <div class="card">
        <h1 class="text-2xl font-bold text-surface-800 mb-4">Search Snippets</h1>
        <div class="flex gap-2">
          <input [(ngModel)]="queryText" name="queryText"
                 placeholder="Search title, description, or code..."
                 class="input flex-1"
                 (keyup.enter)="doSearch()" />
          <button (click)="doSearch()" class="btn-primary" [disabled]="!queryText.trim()">
            Search
          </button>
        </div>
      </div>

      @if (searching()) {
        <div class="card text-center py-8">
          <p class="text-surface-500 animate-pulse">Searching...</p>
        </div>
      }

      @if (!searching() && results().length > 0) {
        <div class="text-sm text-surface-500 mb-2">
          Found {{ results().length }} result(s)
        </div>
      }

      @for (snippet of results(); track snippet.id) {
        <a [routerLink]="['/snippets', snippet.id]"
           class="card block hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-surface-800">{{ snippet.title }}</h3>
              @if (snippet.description) {
                <p class="text-sm text-surface-500 mt-1">{{ snippet.description }}</p>
              }
              <div class="flex items-center gap-2 mt-2">
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
              </div>
            </div>
            @if (snippet.relevanceScore) {
              <div class="text-xs text-primary-600 shrink-0 ml-4">
                Score: {{ snippet.relevanceScore }}
              </div>
            }
          </div>
        </a>
      } @empty {
        @if (!searching() && searched()) {
          <div class="card text-center py-8">
            <p class="text-surface-400">No results found for "{{ queryText }}"</p>
          </div>
        }
      }
    </div>
  `,
})
export class SearchComponent {
  readonly api = inject(ApiService);
  readonly results = signal<Snippet[]>([]);
  readonly searching = signal(false);
  readonly searched = signal(false);

  queryText = '';

  async doSearch() {
    const q = this.queryText.trim();
    if (!q) return;
    this.searching.set(true);
    this.searched.set(true);
    try {
      const results = await this.api.search(q);
      this.results.set(results);
    } catch {
      this.results.set([]);
    } finally {
      this.searching.set(false);
    }
  }
}
