import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Collection } from '../models/models';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      @if (collection(); as col) {
        <div class="card mb-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="w-5 h-5 rounded" [style.background]="col.color"></span>
            <h1 class="text-2xl font-bold text-surface-800">{{ col.name }}</h1>
          </div>
          @if (col.description) {
            <p class="text-surface-500 mb-2">{{ col.description }}</p>
          }
          <p class="text-xs text-surface-400">Created {{ col.createdAt | date:'mediumDate' }}</p>
        </div>

        <div class="grid gap-4">
          @for (snippet of col.snippets; track snippet.id) {
            <a [routerLink]="['/snippets', snippet.id]"
               class="card block hover:shadow-md transition-shadow cursor-pointer">
              <h3 class="font-semibold text-surface-800">{{ snippet.title }}</h3>
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
            </a>
          } @empty {
            <div class="card text-center py-8">
              <p class="text-surface-400">No snippets in this collection</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CollectionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly api = inject(ApiService);
  readonly collection = signal<Collection | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCollection(id);
  }

  async loadCollection(id: number) {
    try {
      this.collection.set(await this.api.getCollection(id));
    } catch {}
  }
}
