import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { SnippetListComponent } from './snippet-list.component';
import { ApiService } from '../services/api.service';

describe('SnippetListComponent', () => {
  let component: SnippetListComponent;
  let fixture: ComponentFixture<SnippetListComponent>;
  let apiService: any;

  const mockSnippets = [
    {
      id: 1,
      title: 'Test Snippet',
      description: 'A test',
      code: 'console.log("hello")',
      language: 'typescript',
      tags: [{ id: 1, name: 'test', color: '#FF0000' }],
      analyses: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    apiService = {
      getSnippets: vi.fn().mockResolvedValue(mockSnippets),
      search: vi.fn().mockResolvedValue(mockSnippets),
      token: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [SnippetListComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load snippets on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(apiService.getSnippets).toHaveBeenCalled();
    expect(component.snippets().length).toBe(1);
  });

  it('should set loading to true before load', () => {
    // Don't call detectChanges yet - loading hasn't been triggered
    expect(component.loading()).toBe(true);
  });

  it('should clear loading after load', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.loading()).toBe(false);
  });

  it('should use search endpoint when search query is set', async () => {
    component.searchQuery.set('hello');
    await component.loadSnippets();
    expect(apiService.search).toHaveBeenCalledWith('hello', undefined);
  });

  it('should handle load errors', async () => {
    apiService.getSnippets.mockRejectedValue(new Error('Network error'));
    await component.loadSnippets();
    expect(component.error()).toBe('Network error');
    expect(component.loading()).toBe(false);
  });

  it('should show error state on failure', async () => {
    apiService.getSnippets.mockRejectedValue(new Error('Failed'));
    await component.loadSnippets();
    expect(component.error()).toBe('Failed');
  });
});
