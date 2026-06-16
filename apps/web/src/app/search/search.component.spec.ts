import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SearchComponent } from './search.component';
import { ApiService } from '../services/api.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let apiService: any;

  const mockResults = [
    {
      id: 1,
      title: 'Hello World',
      description: 'A hello world snippet',
      code: 'console.log("hello")',
      language: 'typescript',
      tags: [],
      analyses: [],
      relevanceScore: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    apiService = {
      search: vi.fn().mockResolvedValue(mockResults),
    };

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideHttpClient(),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search when query is provided', async () => {
    component.queryText = 'hello';
    await component.doSearch();
    expect(apiService.search).toHaveBeenCalledWith('hello');
    expect(component.results().length).toBe(1);
    expect(component.searched()).toBe(true);
    expect(component.searching()).toBe(false);
  });

  it('should not search with empty query', async () => {
    component.queryText = '';
    await component.doSearch();
    expect(apiService.search).not.toHaveBeenCalled();
  });

  it('should handle search errors gracefully', async () => {
    apiService.search.mockRejectedValue(new Error('Search error'));
    component.queryText = 'test';
    await component.doSearch();
    expect(component.results()).toEqual([]);
    expect(component.searching()).toBe(false);
  });
});
