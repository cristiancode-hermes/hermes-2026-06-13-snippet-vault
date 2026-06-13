import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Collection } from '../models/models';

@Component({
  selector: 'app-collection-browser',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="card mb-6">
        <h1 class="text-2xl font-bold text-surface-800 mb-4">Collections</h1>
        @if (api.token()) {
          <div class="flex gap-2">
            <input #nameInput placeholder="Collection name..." class="input flex-1"
                   (keyup.enter)="createCollection(nameInput.value); nameInput.value = ''" />
            <button (click)="createCollection(nameInput.value); nameInput.value = ''"
                    class="btn-primary">Create</button>
          </div>
        }
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        @for (col of collections(); track col.id) {
          <a [routerLink]="['/collections', col.id]"
             class="card block hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center gap-3 mb-2">
              <span class="w-4 h-4 rounded" [style.background]="col.color"></span>
              <h3 class="font-semibold text-surface-800">{{ col.name }}</h3>
            </div>
            @if (col.description) {
              <p class="text-sm text-surface-500 mb-2">{{ col.description }}</p>
            }
            <div class="text-xs text-surface-400">
              {{ col.snippets?.length || 0 }} snippets
            </div>
          </a>
        } @empty {
          <div class="card text-center py-8 col-span-full">
            <p class="text-surface-400">No collections yet</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class CollectionBrowserComponent implements OnInit {
  readonly api = inject(ApiService);
  readonly collections = signal<Collection[]>([]);

  ngOnInit() {
    this.loadCollections();
  }

  async loadCollections() {
    try {
      this.collections.set(await this.api.getCollections());
    } catch {}
  }

  async createCollection(name: string) {
    if (!name.trim()) return;
    try {
      await this.api.createCollection({ name: name.trim() });
      await this.loadCollections();
    } catch {}
  }
}
