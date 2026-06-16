import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { CollectionDetailComponent } from './collection-detail.component';
import { ApiService } from '../services/api.service';

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let apiService: any;

  const mockCollection = {
    id: 1,
    name: 'My Collection',
    description: 'A test',
    color: '#8B5CF6',
    snippets: [
      { id: 1, title: 'Snippet 1', language: 'typescript', tags: [], code: 'test', analyses: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    apiService = {
      getCollection: vi.fn().mockResolvedValue(mockCollection),
    };

    await TestBed.configureTestingModule({
      imports: [CollectionDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collection on init', async () => {
    await fixture.whenStable();
    expect(apiService.getCollection).toHaveBeenCalledWith(1);
    expect(component.collection()?.id).toBe(1);
    expect(component.collection()?.snippets?.length).toBe(1);
  });

  it('should handle load errors gracefully', async () => {
    component.collection.set(null); // Reset from previous test
    apiService.getCollection.mockRejectedValue(new Error('Not found'));
    await component.loadCollection(999);
    expect(component.collection()).toBeNull();
  });
});
