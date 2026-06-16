import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CollectionBrowserComponent } from './collection-browser.component';
import { ApiService } from '../services/api.service';

describe('CollectionBrowserComponent', () => {
  let component: CollectionBrowserComponent;
  let fixture: ComponentFixture<CollectionBrowserComponent>;
  let apiService: any;

  const mockCollections = [
    {
      id: 1,
      name: 'My Collection',
      description: 'A test',
      color: '#8B5CF6',
      snippets: [{ id: 1, title: 'Snippet' }],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    apiService = {
      getCollections: vi.fn().mockResolvedValue(mockCollections),
      createCollection: vi.fn().mockResolvedValue({
        id: 2, name: 'New', description: null, color: '#8B5CF6', snippets: [], createdAt: '2024-01-01T00:00:00Z',
      }),
      token: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [CollectionBrowserComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collections on init', async () => {
    await fixture.whenStable();
    expect(apiService.getCollections).toHaveBeenCalled();
    expect(component.collections().length).toBe(1);
  });

  it('should create a collection', async () => {
    await component.createCollection('New Collection');
    expect(apiService.createCollection).toHaveBeenCalledWith({ name: 'New Collection' });
  });

  it('should not create empty name collection', async () => {
    await component.createCollection('');
    expect(apiService.createCollection).not.toHaveBeenCalled();
  });
});
