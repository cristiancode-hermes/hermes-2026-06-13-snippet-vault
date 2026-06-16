import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TagManagerComponent } from './tag-manager.component';
import { ApiService } from '../services/api.service';

describe('TagManagerComponent', () => {
  let component: TagManagerComponent;
  let fixture: ComponentFixture<TagManagerComponent>;
  let apiService: any;

  const mockTags = [
    { id: 1, name: 'typescript', color: '#3178C6', snippets: [] },
    { id: 2, name: 'react', color: '#61DAFB', snippets: [{ id: 1 }] },
  ];

  beforeEach(async () => {
    apiService = {
      getTags: vi.fn().mockResolvedValue(mockTags),
      createTag: vi.fn().mockResolvedValue({ id: 3, name: 'new', color: '#3B82F6', snippets: [] }),
      deleteTag: vi.fn().mockResolvedValue(undefined),
      token: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [TagManagerComponent],
      providers: [{ provide: ApiService, useValue: apiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TagManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tags on init', async () => {
    await fixture.whenStable();
    expect(apiService.getTags).toHaveBeenCalled();
    expect(component.tags().length).toBe(2);
  });

  it('should create a tag', async () => {
    component.newTagNameInput = 'new-tag';
    await component.createTag();
    expect(apiService.createTag).toHaveBeenCalledWith('new-tag', '#3B82F6');
  });

  it('should not create empty tag', async () => {
    component.newTagNameInput = '';
    await component.createTag();
    expect(apiService.createTag).not.toHaveBeenCalled();
  });

  it('should handle create errors', async () => {
    apiService.createTag.mockRejectedValue(new Error('Duplicate'));
    component.newTagNameInput = 'existing';
    await component.createTag();
    expect(component.error()).toBe('Duplicate');
  });

  it('should delete a tag', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await component.deleteTag(1);
    expect(apiService.deleteTag).toHaveBeenCalledWith(1);
  });

  it('should not delete if cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await component.deleteTag(1);
    expect(apiService.deleteTag).not.toHaveBeenCalled();
  });
});
