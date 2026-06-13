import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-md mx-auto mt-8">
      <div class="card">
        <h1 class="text-2xl font-bold text-surface-800 mb-6">
          {{ isLogin() ? 'Login' : 'Register' }}
        </h1>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Username</label>
            <input [(ngModel)]="username" name="username" required
                   placeholder="Your username" class="input" />
          </div>

          @if (!isLogin()) {
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Email</label>
              <input [(ngModel)]="email" name="email" type="email" required
                     placeholder="your@email.com" class="input" />
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required
                   placeholder="Min 6 characters" class="input" />
          </div>

          @if (error()) {
            <div class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary w-full" [disabled]="submitting()">
            {{ submitting() ? 'Please wait...' : (isLogin() ? 'Login' : 'Register') }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          <button (click)="toggleMode()" class="text-primary-600 hover:text-primary-700">
            {{ isLogin() ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private readonly router = inject(Router);
  readonly api = inject(ApiService);

  readonly isLogin = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  username = '';
  email = '';
  password = '';

  toggleMode() {
    this.isLogin.update((v) => !v);
    this.error.set(null);
  }

  async submit() {
    if (!this.username || !this.password) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      if (this.isLogin()) {
        await this.api.login(this.username, this.password);
      } else {
        await this.api.register(this.username, this.email, this.password);
      }
      this.router.navigate(['/snippets']);
    } catch (err: any) {
      this.error.set(err.error?.message || err.message || 'Authentication failed');
    } finally {
      this.submitting.set(false);
    }
  }
}
