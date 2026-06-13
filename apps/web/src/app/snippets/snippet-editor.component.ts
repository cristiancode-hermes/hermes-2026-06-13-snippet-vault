import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Snippet, Tag } from '../models/models';

@Component({
  selector: 'app-snippet-editor',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="card">
        <h1 class="text-2xl font-bold text-surface-800 mb-6">
          {{ isNew() ? 'Create Snippet' : 'Edit Snippet' }}
        </h1>

        <form (ngSubmit)="save()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Title</label>
            <input [(ngModel)]="title" name="title" required
                   placeholder="Snippet title" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea [(ngModel)]="description" name="description" rows="2"
                      placeholder="Optional description" class="input"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Language</label>
              <select [(ngModel)]="language" name="language" class="input">
                @for (lang of languages; track lang) {
                  <option [value]="lang">{{ lang }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1 p-2 border border-surface-200 rounded-lg min-h-[42px]">
                @for (tag of availableTags(); track tag.id) {
                  <button type="button"
                          (click)="toggleTag(tag)"
                          class="px-2 py-0.5 text-xs rounded-full transition-colors"
                          [style.background]="(selectedTagIds().has(tag.id) ? tag.color : tag.color + '20')"
                          [style.color]="selectedTagIds().has(tag.id) ? '#fff' : tag.color">
                    {{ tag.name }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Code</label>
            <textarea [(ngModel)]="code" name="code" rows="16" required
                      placeholder="Paste your code here..."
                      class="input font-mono text-sm"></textarea>
          </div>

          @if (error()) {
            <div class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{{ error() }}</div>
          }

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="btn-primary" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (isNew() ? 'Create' : 'Update') }}
            </button>
            <a routerLink="/snippets" class="btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SnippetEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly api = inject(ApiService);

  readonly isNew = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly availableTags = signal<Tag[]>([]);
  readonly selectedTagIds = signal<Set<number>>(new Set());

  title = '';
  description = '';
  code = '';
  language = 'typescript';

  readonly languages = [
    'typescript', 'javascript', 'python', 'css', 'html', 'sql', 'json', 'markdown', 'plaintext',
  ];

  ngOnInit() {
    this.loadTags();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew.set(false);
      this.loadSnippet(Number(id));
    }
  }

  async loadTags() {
    try {
      const tags = await this.api.getTags();
      this.availableTags.set(tags);
    } catch {}
  }

  async loadSnippet(id: number) {
    try {
      const s = await this.api.getSnippet(id);
      this.title = s.title;
      this.description = s.description || '';
      this.code = s.code;
      this.language = s.language;
      this.selectedTagIds.set(new Set(s.tags.map((t) => t.id)));
    } catch (err: any) {
      this.error.set('Failed to load snippet');
    }
  }

  toggleTag(tag: Tag) {
    const ids = new Set(this.selectedTagIds());
    if (ids.has(tag.id)) ids.delete(tag.id);
    else ids.add(tag.id);
    this.selectedTagIds.set(ids);
  }

  async save() {
    if (!this.title || !this.code) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const data = {
        title: this.title,
        description: this.description || undefined,
        code: this.code,
        language: this.language,
        tagIds: [...this.selectedTagIds()],
      };

      if (this.isNew()) {
        await this.api.createSnippet(data);
      } else {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        await this.api.updateSnippet(id, data);
      }
      this.router.navigate(['/snippets']);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save snippet');
    } finally {
      this.saving.set(false);
    }
  }
}
