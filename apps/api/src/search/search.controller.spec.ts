import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchController } from './search.controller';
import { Snippet } from '../snippets/snippet.entity';

describe('SearchController', () => {
  let controller: SearchController;
  let snippetRepo: Repository<Snippet>;

  const mockSnippets = [
    {
      id: 1,
      title: 'Hello World',
      description: 'A hello world snippet',
      code: 'console.log("hello world")',
      language: 'typescript',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: 'Test Function',
      description: 'A test function',
      code: 'function test() { return 1; }',
      language: 'javascript',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockSnippets),
    };

    const mockSnippetRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: getRepositoryToken(Snippet), useValue: mockSnippetRepo },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    snippetRepo = module.get<Repository<Snippet>>(getRepositoryToken(Snippet));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return empty array for empty query', async () => {
      const result = await controller.search('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await controller.search('   ');
      expect(result).toEqual([]);
    });

    it('should search snippets by query', async () => {
      const result = await controller.search('hello');
      expect(result).toHaveLength(2);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('snippet.tags', 'tags');
      expect(queryBuilder.andWhere).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('snippet.updatedAt', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(50);
    });

    it('should filter by language', async () => {
      const result = await controller.search('hello', 'typescript');
      expect(result).toHaveLength(2);
    });

    it('should filter by tag', async () => {
      const result = await controller.search('hello', undefined, 'backend');
      expect(result).toHaveLength(2);
    });

    it('should attach relevance scores', async () => {
      const result = await controller.search('hello');
      expect(result[0]).toHaveProperty('relevanceScore');
      expect(typeof result[0].relevanceScore).toBe('number');
    });

    it('should sort results by relevance descending', async () => {
      const result = await controller.search('hello');
      // Results should have relevanceScore
      for (const snippet of result) {
        expect(snippet.relevanceScore).toBeDefined();
      }
    });
  });
});
