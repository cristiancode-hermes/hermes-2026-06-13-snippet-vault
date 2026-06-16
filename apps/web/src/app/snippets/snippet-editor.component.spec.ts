import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SnippetEditorComponent } from './snippet-editor.component';
import { ApiService } from '../services/api.service';

describe('SnippetEditorComponent', () => {
  let component: SnippetEditorComponent;
  let fixture: ComponentFixture<SnippetEditorComponent>;
  let apiService: any;

  const mockTags = [
    { id: 1, name: 'typescript', color: '#3178C6', snippets: [] },
    { id: 2, name: 'react', color: '#61DAFB', snippets: [] },
  ];

  const mockSnippet = {
    id: 1,
    title: 'Test',
    description: 'Desc',
    code: 'console.log("hi")',
    language: 'typescript',
    tags: [mockTags[0]],
    analyses: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  async function createComponent(isEdit: boolean) {
    apiService = {
      getTags: vi.fn().mockResolvedValue(mockTags),
      getSnippet: vi.fn().mockResolvedValue(mockSnippet),
      createSnippet: vi.fn().mockResolvedValue(mockSnippet),
      updateSnippet: vi.fn().mockResolvedValue(mockSnippet),
    };

    await TestBed.configureTestingModule({
      imports: [SnippetEditorComponent],
      providers: [
        provideRouter([
          { path: 'snippets', component: {} as any },
          { path: 'snippets/new', component: {} as any },
        ]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => (isEdit ? '1' : null) } } },
        },
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create in new mode', async () => {
    await createComponent(false);
    expect(component).toBeTruthy();
    expect(component.isNew()).toBe(true);
  });

  it('should load tags on init', async () => {
    await createComponent(false);
    expect(apiService.getTags).toHaveBeenCalled();
    expect(component.availableTags().length).toBe(2);
  });

  it('should load snippet for editing when id is present', async () => {
    await createComponent(true);
    expect(component.isNew()).toBe(false);
    expect(component.title).toBe('Test');
    expect(component.code).toBe('console.log("hi")');
  });

  it('should toggle tag selection', async () => {
    await createComponent(false);
    component.toggleTag(mockTags[0]);
    expect(component.selectedTagIds().has(1)).toBe(true);
    component.toggleTag(mockTags[0]);
    expect(component.selectedTagIds().has(1)).toBe(false);
  });

  it('should save new snippet', async () => {
    await createComponent(false);
    component.title = 'New Snippet';
    component.code = 'console.log("new")';
    component.language = 'javascript';

    await component.save();
    expect(apiService.createSnippet).toHaveBeenCalled();
    expect(component.saving()).toBe(false);
  });

  it('should handle save errors', async () => {
    await createComponent(false);
    apiService.createSnippet.mockRejectedValue(new Error('Validation failed'));
    component.title = 'Test';
    component.code = 'test';

    await component.save();
    expect(component.error()).toBe('Validation failed');
  });

  it('should not save with empty title or code', async () => {
    await createComponent(false);
    component.title = '';
    component.code = '';
    await component.save();
    expect(apiService.createSnippet).not.toHaveBeenCalled();
  });
});
