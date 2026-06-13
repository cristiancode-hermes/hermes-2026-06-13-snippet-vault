import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Snippet, Tag, Collection, AnalysisResult, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  readonly token = signal<string | null>(localStorage.getItem('token'));

  private headers(): HttpHeaders {
    const t = this.token();
    return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : new HttpHeaders();
  }

  setToken(token: string | null) {
    this.token.set(token);
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { username, password })
    );
    this.setToken(res.token);
    return res;
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { username, email, password })
    );
    this.setToken(res.token);
    return res;
  }

  // Snippets
  async getSnippets(params?: { language?: string; tag?: string; search?: string }): Promise<Snippet[]> {
    let httpParams = new HttpParams();
    if (params?.language) httpParams = httpParams.set('language', params.language);
    if (params?.tag) httpParams = httpParams.set('tag', params.tag);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return lastValueFrom(
      this.http.get<Snippet[]>(`${this.baseUrl}/snippets`, { params: httpParams })
    );
  }

  async getSnippet(id: number): Promise<Snippet> {
    return lastValueFrom(this.http.get<Snippet>(`${this.baseUrl}/snippets/${id}`));
  }

  async createSnippet(data: Partial<Snippet> & { tagIds?: number[] }): Promise<Snippet> {
    return lastValueFrom(
      this.http.post<Snippet>(`${this.baseUrl}/snippets`, data, { headers: this.headers() })
    );
  }

  async updateSnippet(id: number, data: Partial<Snippet> & { tagIds?: number[] }): Promise<Snippet> {
    return lastValueFrom(
      this.http.put<Snippet>(`${this.baseUrl}/snippets/${id}`, data, { headers: this.headers() })
    );
  }

  async deleteSnippet(id: number): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.baseUrl}/snippets/${id}`, { headers: this.headers() })
    );
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return lastValueFrom(this.http.get<Tag[]>(`${this.baseUrl}/tags`));
  }

  async createTag(name: string, color?: string): Promise<Tag> {
    return lastValueFrom(
      this.http.post<Tag>(`${this.baseUrl}/tags`, { name, color }, { headers: this.headers() })
    );
  }

  async deleteTag(id: number): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.baseUrl}/tags/${id}`, { headers: this.headers() })
    );
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    return lastValueFrom(this.http.get<Collection[]>(`${this.baseUrl}/collections`));
  }

  async getCollection(id: number): Promise<Collection> {
    return lastValueFrom(this.http.get<Collection>(`${this.baseUrl}/collections/${id}`));
  }

  async createCollection(data: { name: string; description?: string; color?: string }): Promise<Collection> {
    return lastValueFrom(
      this.http.post<Collection>(`${this.baseUrl}/collections`, data, { headers: this.headers() })
    );
  }

  async addSnippetToCollection(collectionId: number, snippetId: number): Promise<Collection> {
    return lastValueFrom(
      this.http.post<Collection>(
        `${this.baseUrl}/collections/${collectionId}/snippets/${snippetId}`,
        {},
        { headers: this.headers() }
      )
    );
  }

  async removeSnippetFromCollection(collectionId: number, snippetId: number): Promise<Collection> {
    return lastValueFrom(
      this.http.delete<Collection>(
        `${this.baseUrl}/collections/${collectionId}/snippets/${snippetId}`,
        { headers: this.headers() }
      )
    );
  }

  // AI
  async analyzeSnippet(snippetId: number): Promise<AnalysisResult> {
    return lastValueFrom(
      this.http.post<AnalysisResult>(`${this.baseUrl}/ai/analyze/${snippetId}`, {})
    );
  }

  // Search
  async search(query: string, language?: string, tag?: string): Promise<Snippet[]> {
    let params = new HttpParams().set('q', query);
    if (language) params = params.set('language', language);
    if (tag) params = params.set('tag', tag);
    return lastValueFrom(
      this.http.get<Snippet[]>(`${this.baseUrl}/search`, { params })
    );
  }
}
