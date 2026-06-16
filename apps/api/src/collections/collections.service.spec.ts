import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionsService } from './collections.service';
import { Collection } from './collection.entity';
import { Snippet } from '../snippets/snippet.entity';
import { NotFoundException } from '@nestjs/common';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let collectionRepo: Repository<Collection>;
  let snippetRepo: Repository<Snippet>;

  const mockSnippet = {
    id: 1,
    title: 'Test',
    code: 'console.log("hi")',
    language: 'typescript',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCollection = {
    id: 1,
    name: 'My Collection',
    description: 'A test collection',
    color: '#8B5CF6',
    snippets: [mockSnippet],
    createdAt: new Date(),
  };

  const mockCollectionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSnippetRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: mockCollectionRepo },
        { provide: getRepositoryToken(Snippet), useValue: mockSnippetRepo },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
    collectionRepo = module.get<Repository<Collection>>(getRepositoryToken(Collection));
    snippetRepo = module.get<Repository<Snippet>>(getRepositoryToken(Snippet));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all collections with snippets', async () => {
      mockCollectionRepo.find.mockResolvedValue([mockCollection]);
      const result = await service.findAll();
      expect(result).toEqual([mockCollection]);
      expect(mockCollectionRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
        relations: { snippets: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a collection by id', async () => {
      mockCollectionRepo.findOne.mockResolvedValue(mockCollection);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCollection);
      expect(mockCollectionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { snippets: { tags: true } },
      });
    });

    it('should throw NotFoundException if collection not found', async () => {
      mockCollectionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a collection', async () => {
      mockCollectionRepo.create.mockReturnValue(mockCollection);
      mockCollectionRepo.save.mockResolvedValue(mockCollection);

      const result = await service.create({ name: 'My Collection' });
      expect(result).toEqual(mockCollection);
      expect(mockCollectionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Collection' }),
      );
    });

    it('should use default color when not provided', async () => {
      mockCollectionRepo.create.mockReturnValue(mockCollection);
      mockCollectionRepo.save.mockResolvedValue(mockCollection);

      await service.create({ name: 'Test' });
      expect(mockCollectionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#8B5CF6' }),
      );
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const existing = { ...mockCollection };
      mockCollectionRepo.findOneBy.mockResolvedValue(existing);
      mockCollectionRepo.save.mockResolvedValue({ ...existing, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if collection not found', async () => {
      mockCollectionRepo.findOneBy.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSnippet', () => {
    it('should add a snippet to a collection', async () => {
      const collection = { ...mockCollection, snippets: [] };
      mockCollectionRepo.findOne.mockResolvedValue(collection);
      mockSnippetRepo.findOneBy.mockResolvedValue(mockSnippet);
      mockCollectionRepo.save.mockResolvedValue({ ...collection, snippets: [mockSnippet] });
      mockCollectionRepo.findOne.mockResolvedValue({ ...collection, snippets: [mockSnippet] });

      // For the second findOne call (in addSnippet -> return this.findOne(collectionId))
      mockCollectionRepo.findOne.mockResolvedValueOnce(collection);
      mockCollectionRepo.findOne.mockResolvedValueOnce({ ...collection, snippets: [mockSnippet] });

      const result = await service.addSnippet(1, 1);
      expect(result).toBeDefined();
    });

    it('should not duplicate a snippet already in collection', async () => {
      const collection = { ...mockCollection, snippets: [mockSnippet] };
      mockCollectionRepo.findOne.mockResolvedValue(collection);
      mockCollectionRepo.findOne.mockResolvedValue(collection);

      const result = await service.addSnippet(1, 1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if collection not found', async () => {
      mockCollectionRepo.findOne.mockResolvedValue(null);
      await expect(service.addSnippet(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if snippet not found', async () => {
      mockCollectionRepo.findOne.mockResolvedValue({ ...mockCollection, snippets: [] });
      mockSnippetRepo.findOneBy.mockResolvedValue(null);
      await expect(service.addSnippet(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeSnippet', () => {
    it('should remove a snippet from a collection', async () => {
      const snippet2 = { ...mockSnippet, id: 2 };
      const collection = { ...mockCollection, snippets: [mockSnippet, snippet2] };
      mockCollectionRepo.findOne.mockResolvedValue(collection);
      mockCollectionRepo.save.mockResolvedValue({ ...collection, snippets: [snippet2] });
      mockCollectionRepo.findOne.mockResolvedValue({ ...collection, snippets: [snippet2] });

      const result = await service.removeSnippet(1, 1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if collection not found', async () => {
      mockCollectionRepo.findOne.mockResolvedValue(null);
      await expect(service.removeSnippet(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a collection', async () => {
      mockCollectionRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockCollectionRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if collection not found', async () => {
      mockCollectionRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
