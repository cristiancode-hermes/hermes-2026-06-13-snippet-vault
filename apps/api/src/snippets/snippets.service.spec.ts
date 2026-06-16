import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnippetsService } from './snippets.service';
import { Snippet } from './snippet.entity';
import { Tag } from '../tags/tag.entity';
import { NotFoundException } from '@nestjs/common';

describe('SnippetsService', () => {
  let service: SnippetsService;
  let snippetRepo: Repository<Snippet>;
  let tagRepo: Repository<Tag>;

  const mockTag = { id: 1, name: 'typescript', color: '#3178C6', snippets: [] };
  const mockSnippet = {
    id: 1,
    title: 'Test Snippet',
    description: 'A test snippet',
    code: 'console.log("hello")',
    language: 'typescript',
    tags: [mockTag],
    analyses: [],
    collections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockSnippet]),
  };

  const mockSnippetRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockTagRepo = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnippetsService,
        { provide: getRepositoryToken(Snippet), useValue: mockSnippetRepo },
        { provide: getRepositoryToken(Tag), useValue: mockTagRepo },
      ],
    }).compile();

    service = module.get<SnippetsService>(SnippetsService);
    snippetRepo = module.get<Repository<Snippet>>(getRepositoryToken(Snippet));
    tagRepo = module.get<Repository<Tag>>(getRepositoryToken(Tag));

    // Reset all mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all snippets without filters', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockSnippet]);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('snippet.tags', 'tags');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('snippet.updatedAt', 'DESC');
    });

    it('should filter by language', async () => {
      await service.findAll('typescript');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'snippet.language = :language',
        { language: 'typescript' },
      );
    });

    it('should filter by tag', async () => {
      await service.findAll(undefined, 'typescript');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'tags.name = :tag',
        { tag: 'typescript' },
      );
    });

    it('should search by query', async () => {
      await service.findAll(undefined, undefined, 'hello');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(snippet.title LIKE :search OR snippet.description LIKE :search OR snippet.code LIKE :search)',
        { search: '%hello%' },
      );
    });

    it('should combine all filters', async () => {
      await service.findAll('python', 'backend', 'test');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a snippet by id', async () => {
      mockSnippetRepo.findOne.mockResolvedValue(mockSnippet);
      const result = await service.findOne(1);
      expect(result).toEqual(mockSnippet);
      expect(mockSnippetRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { tags: true, analyses: true },
      });
    });

    it('should throw NotFoundException if snippet not found', async () => {
      mockSnippetRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a snippet with tags', async () => {
      mockTagRepo.findBy.mockResolvedValue([mockTag]);
      mockSnippetRepo.create.mockReturnValue(mockSnippet);
      mockSnippetRepo.save.mockResolvedValue(mockSnippet);

      const result = await service.create({
        title: 'Test Snippet',
        code: 'console.log("hello")',
        language: 'typescript',
        tagIds: [1],
      });

      expect(result).toEqual(mockSnippet);
      expect(mockTagRepo.findBy).toHaveBeenCalled();
      expect(mockSnippetRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Snippet', tags: [mockTag] }),
      );
    });

    it('should create a snippet without tags', async () => {
      mockSnippetRepo.create.mockReturnValue({ ...mockSnippet, tags: [] });
      mockSnippetRepo.save.mockResolvedValue({ ...mockSnippet, tags: [] });

      const result = await service.create({
        title: 'Test Snippet',
        code: 'console.log("hello")',
      });

      expect(result).toBeDefined();
      expect(mockTagRepo.findBy).not.toHaveBeenCalled();
    });

    it('should default language to plaintext', async () => {
      mockSnippetRepo.create.mockReturnValue(mockSnippet);
      mockSnippetRepo.save.mockResolvedValue(mockSnippet);

      await service.create({
        title: 'Test',
        code: 'plain text',
      });

      expect(mockSnippetRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'plaintext' }),
      );
    });
  });

  describe('update', () => {
    it('should update a snippet', async () => {
      const existing = { ...mockSnippet };
      mockSnippetRepo.findOne.mockResolvedValue(existing);
      mockSnippetRepo.save.mockResolvedValue({ ...existing, title: 'Updated' });

      const result = await service.update(1, { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if snippet not found', async () => {
      mockSnippetRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should update tags when tagIds provided', async () => {
      const existing = { ...mockSnippet, tags: [] };
      mockSnippetRepo.findOne.mockResolvedValue(existing);
      mockTagRepo.findBy.mockResolvedValue([mockTag]);
      mockSnippetRepo.save.mockResolvedValue({ ...existing, tags: [mockTag] });

      const result = await service.update(1, { tagIds: [1] });
      expect(result).toBeDefined();
      expect(mockTagRepo.findBy).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a snippet', async () => {
      mockSnippetRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockSnippetRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if snippet not found', async () => {
      mockSnippetRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
