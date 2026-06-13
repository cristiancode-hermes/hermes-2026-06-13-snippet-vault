import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-surface-900 text-white flex flex-col shrink-0">
        <div class="p-5 border-b border-surface-700">
          <h1 class="text-xl font-bold tracking-tight">
            <a routerLink="/" class="hover:text-primary-400 transition-colors">
              Snippet Vault
            </a>
          </h1>
          <p class="text-xs text-surface-400 mt-1">AI-Powered Code Manager</p>
        </div>

        <nav class="flex-1 p-3 space-y-1">
          @for (nav of navItems; track nav.path) {
            <a [routerLink]="nav.path"
               routerLinkActive="bg-primary-600 text-white"
               class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      text-surface-300 hover:bg-surface-700 hover:text-white transition-colors">
              <span class="text-lg">{{ nav.icon }}</span>
              <span>{{ nav.label }}</span>
            </a>
          }

          <div class="border-t border-surface-700 my-3 pt-3">
            @if (api.token()) {
              <button (click)="api.setToken(null)"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                             text-surface-400 hover:bg-surface-700 hover:text-white transition-colors">
                <span class="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            } @else {
              <a routerLink="/auth"
                 routerLinkActive="bg-primary-600 text-white"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        text-surface-300 hover:bg-surface-700 hover:text-white transition-colors">
                <span class="text-lg">🔑</span>
                <span>Login / Register</span>
              </a>
            }
          </div>
        </nav>

        <div class="p-3 border-t border-surface-700 text-xs text-surface-500">
          Hermes Daily Builder • {{ today }}
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 flex flex-col min-h-screen">
        <header class="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-surface-800">{{ currentTitle() }}</h2>
          <div class="flex items-center gap-3">
            @if (api.token()) {
              <a routerLink="/snippets/new"
                 class="btn-primary text-sm flex items-center gap-1">
                <span>+</span> New Snippet
              </a>
            }
          </div>
        </header>

        <div class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class App {
  readonly api = inject(ApiService);
  readonly today = new Date().toISOString().slice(0, 10);
  readonly currentTitle = signal('Snippets');

  readonly navItems = [
    { path: '/snippets', label: 'Snippets', icon: '📝' },
    { path: '/tags', label: 'Tags', icon: '🏷️' },
    { path: '/collections', label: 'Collections', icon: '📁' },
    { path: '/search', label: 'Search', icon: '🔍' },
  ];
}
