import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { SnippetDetailComponent } from './snippet-detail.component';
import { ApiService } from '../services/api.service';

describe('SnippetDetailComponent', () => {
  let component: SnippetDetailComponent;
  let fixture: ComponentFixture<SnippetDetailComponent>;
  let apiService: any;

  const mockSnippet = {
    id: 1,
    title: 'Test Snippet',
    description: 'A test',
    code: 'console.log("hello")',
    language: 'typescript',
    tags: [],
    analyses: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  beforeEach(async () => {
    apiService = {
      getSnippet: vi.fn().mockResolvedValue(mockSnippet),
      deleteSnippet: vi.fn().mockResolvedValue(undefined),
      analyzeSnippet: vi.fn().mockResolvedValue({
        complexity: 'low', lines: 5, score: 90, suggestions: [], language: 'typescript',
      }),
      token: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [SnippetDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load snippet on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(apiService.getSnippet).toHaveBeenCalledWith(1);
    expect(component.snippet()?.id).toBe(1);
  });

  it('should handle load errors', async () => {
    apiService.getSnippet.mockRejectedValue(new Error('Not found'));
    await component.loadSnippet(999);
    expect(component.error()).toBe('Not found');
    expect(component.loading()).toBe(false);
  });

  it('should set loading to true initially', () => {
    expect(component.loading()).toBe(true);
  });

  it('should analyze snippet', async () => {
    await component.analyzeSnippet(1);
    expect(apiService.analyzeSnippet).toHaveBeenCalledWith(1);
    expect(component.analysisResult()).toBeDefined();
    expect(component.analyzing()).toBe(false);
  });

  it('should copy code to clipboard', () => {
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    component.snippet.set(mockSnippet);
    component.copyCode();
    expect(writeText).toHaveBeenCalledWith('console.log("hello")');
    expect(component.copied()).toBe(true);
  });
});
