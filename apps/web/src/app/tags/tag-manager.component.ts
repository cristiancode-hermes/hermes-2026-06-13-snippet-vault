import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Tag } from '../models/models';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="card mb-6">
        <h1 class="text-2xl font-bold text-surface-800 mb-4">Tag Manager</h1>

        @if (api.token()) {
          <form (ngSubmit)="createTag()" class="flex gap-2">
            <input [(ngModel)]="newTagNameInput" name="name" required
                   placeholder="New tag name..." class="input flex-1" />
            <input [(ngModel)]="newTagColor" name="color"
                   type="color" class="w-10 h-10 rounded cursor-pointer border border-surface-200" />
            <button type="submit" class="btn-primary" [disabled]="!newTagNameInput.trim()">Add</button>
          </form>
        }
      </div>

      @if (error()) {
        <div class="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4">{{ error() }}</div>
      }

      <div class="grid gap-3">
        @for (tag of tags(); track tag.id) {
          <div class="card flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full" [style.background]="tag.color"></span>
              <span class="font-medium">{{ tag.name }}</span>
              <span class="text-xs text-surface-400">({{ tag.snippets?.length || 0 }} snippets)</span>
            </div>
            @if (api.token()) {
              <button (click)="deleteTag(tag.id)"
                      class="text-xs text-red-500 hover:text-red-700">
                Delete
              </button>
            }
          </div>
        } @empty {
          <div class="card text-center py-8">
            <p class="text-surface-400">No tags yet. Create one above!</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class TagManagerComponent implements OnInit {
  readonly api = inject(ApiService);
  readonly tags = signal<Tag[]>([]);
  readonly error = signal<string | null>(null);
  readonly newTagName = '';
  readonly newTagColor = signal('#3B82F6');

  newTagNameInput = '';

  ngOnInit() {
    this.loadTags();
  }

  async loadTags() {
    try {
      this.tags.set(await this.api.getTags());
    } catch {}
  }

  async createTag() {
    const name = this.newTagNameInput.trim();
    if (!name) return;
    try {
      await this.api.createTag(name, this.newTagColor());
      this.newTagNameInput = '';
      this.error.set(null);
      await this.loadTags();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to create tag');
    }
  }

  async deleteTag(id: number) {
    if (!confirm('Delete this tag?')) return;
    try {
      await this.api.deleteTag(id);
      await this.loadTags();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to delete tag');
    }
  }
}
