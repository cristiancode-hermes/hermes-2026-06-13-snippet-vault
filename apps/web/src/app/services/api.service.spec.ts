import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token management', () => {
    it('should have initial token from localStorage', () => {
      expect(service.token()).toBeNull();
    });

    it('should set token in signal and localStorage', () => {
      service.setToken('test-token');
      expect(service.token()).toBe('test-token');
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should clear token from signal and localStorage', () => {
      service.setToken('test-token');
      service.setToken(null);
      expect(service.token()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('auth APIs', () => {
    it('should login and store token', async () => {
      const promise = service.login('testuser', 'password123');

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
      req.flush({ token: 'login-token' });

      const result = await promise;
      expect(result.token).toBe('login-token');
      expect(service.token()).toBe('login-token');
    });

    it('should register and store token', async () => {
      const promise = service.register('newuser', 'new@test.com', 'password123');

      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      });
      req.flush({ token: 'register-token' });

      const result = await promise;
      expect(result.token).toBe('register-token');
      expect(service.token()).toBe('register-token');
    });
  });

  describe('snippet APIs', () => {
    it('should get snippets with params', async () => {
      const promise = service.getSnippets({ language: 'typescript', search: 'test' });

      const req = httpMock.expectOne(
        (r: any) => r.url === 'http://localhost:3000/api/snippets' && r.method === 'GET',
      );
      expect(req.request.params.get('language')).toBe('typescript');
      expect(req.request.params.get('search')).toBe('test');
      req.flush([{ id: 1, title: 'Test' }]);

      const result = await promise;
      expect(result).toHaveLength(1);
    });

    it('should get snippets without params', async () => {
      const promise = service.getSnippets();

      const req = httpMock.expectOne('http://localhost:3000/api/snippets');
      expect(req.request.method).toBe('GET');
      req.flush([]);

      const result = await promise;
      expect(result).toEqual([]);
    });

    it('should get a single snippet', async () => {
      const promise = service.getSnippet(1);

      const req = httpMock.expectOne('http://localhost:3000/api/snippets/1');
      expect(req.request.method).toBe('GET');
      req.flush({ id: 1, title: 'Test' });

      const result = await promise;
      expect(result.id).toBe(1);
    });

    it('should create a snippet with auth header', async () => {
      service.setToken('my-token');
      const promise = service.createSnippet({ title: 'New', code: 'test', tagIds: [1] });

      const req = httpMock.expectOne('http://localhost:3000/api/snippets');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
      req.flush({ id: 1, title: 'New' });

      const result = await promise;
      expect(result.id).toBe(1);
    });

    it('should update a snippet', async () => {
      service.setToken('my-token');
      const promise = service.updateSnippet(1, { title: 'Updated' });

      const req = httpMock.expectOne('http://localhost:3000/api/snippets/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 1, title: 'Updated' });

      const result = await promise;
      expect(result.title).toBe('Updated');
    });

    it('should delete a snippet', async () => {
      service.setToken('my-token');
      const promise = service.deleteSnippet(1);

      const req = httpMock.expectOne('http://localhost:3000/api/snippets/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await promise;
    });
  });

  describe('tag APIs', () => {
    it('should get tags', async () => {
      const promise = service.getTags();

      const req = httpMock.expectOne('http://localhost:3000/api/tags');
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, name: 'typescript' }]);

      const result = await promise;
      expect(result).toHaveLength(1);
    });

    it('should create a tag with auth', async () => {
      service.setToken('my-token');
      const promise = service.createTag('new-tag', '#FF0000');

      const req = httpMock.expectOne('http://localhost:3000/api/tags');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'new-tag', color: '#FF0000' });
      req.flush({ id: 1, name: 'new-tag' });

      const result = await promise;
      expect(result.name).toBe('new-tag');
    });
  });

  describe('collection APIs', () => {
    it('should get collections', async () => {
      const promise = service.getCollections();

      const req = httpMock.expectOne('http://localhost:3000/api/collections');
      req.flush([{ id: 1, name: 'My Collection' }]);

      const result = await promise;
      expect(result).toHaveLength(1);
    });

    it('should add snippet to collection', async () => {
      service.setToken('my-token');
      const promise = service.addSnippetToCollection(1, 2);

      const req = httpMock.expectOne('http://localhost:3000/api/collections/1/snippets/2');
      expect(req.request.method).toBe('POST');
      req.flush({ id: 1, snippets: [{ id: 2 }] });

      const result = await promise;
      expect(result.id).toBe(1);
    });

    it('should remove snippet from collection', async () => {
      service.setToken('my-token');
      const promise = service.removeSnippetFromCollection(1, 2);

      const req = httpMock.expectOne('http://localhost:3000/api/collections/1/snippets/2');
      expect(req.request.method).toBe('DELETE');
      req.flush({ id: 1, snippets: [] });

      const result = await promise;
      expect(result.id).toBe(1);
    });
  });

  describe('AI and search APIs', () => {
    it('should analyze a snippet', async () => {
      const promise = service.analyzeSnippet(1);

      const req = httpMock.expectOne('http://localhost:3000/api/ai/analyze/1');
      expect(req.request.method).toBe('POST');
      req.flush({ complexity: 'low', lines: 5, score: 90, suggestions: [], language: 'typescript' });

      const result = await promise;
      expect(result.complexity).toBe('low');
    });

    it('should search snippets', async () => {
      const promise = service.search('hello', 'typescript', 'backend');

      const req = httpMock.expectOne(
        (r: any) => r.url === 'http://localhost:3000/api/search' && r.method === 'GET',
      );
      expect(req.request.params.get('q')).toBe('hello');
      expect(req.request.params.get('language')).toBe('typescript');
      expect(req.request.params.get('tag')).toBe('backend');
      req.flush([{ id: 1, title: 'Hello', relevanceScore: 100 }]);

      const result = await promise;
      expect(result).toHaveLength(1);
    });
  });
});
