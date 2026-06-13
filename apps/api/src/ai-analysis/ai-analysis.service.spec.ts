import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysis } from './ai-analysis.entity';
import { Snippet } from '../snippets/snippet.entity';

describe('AiAnalysisService', () => {
  let service: AiAnalysisService;

  const mockSnippet = {
    id: 1,
    title: 'Test Snippet',
    description: 'A test',
    code: 'function hello() { return "world"; }',
    language: 'typescript',
  };

  const mockAiAnalysisRepo = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockSnippetRepo = {
    findOneBy: jest.fn().mockResolvedValue(mockSnippet),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        { provide: getRepositoryToken(AiAnalysis), useValue: mockAiAnalysisRepo },
        { provide: getRepositoryToken(Snippet), useValue: mockSnippetRepo },
      ],
    }).compile();

    service = module.get<AiAnalysisService>(AiAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze a snippet and return results', async () => {
      const result = await service.analyze(1);

      expect(result).toBeDefined();
      expect(result.language).toBe('typescript');
      expect(result.lines).toBe(1);
      expect(result.suggestions).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.complexity).toMatch(/low|medium|high/);
    });

    it('should detect missing description penalty', async () => {
      const snippetWithoutDesc = {
        ...mockSnippet,
        description: null,
      };
      mockSnippetRepo.findOneBy.mockResolvedValueOnce(snippetWithoutDesc);

      const result = await service.analyze(1);
      expect(result.score).toBeLessThan(100);
    });
  });
});
