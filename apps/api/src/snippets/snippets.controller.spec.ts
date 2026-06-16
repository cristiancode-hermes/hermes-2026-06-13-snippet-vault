import { Test, TestingModule } from '@nestjs/testing';
import { SnippetsController } from './snippets.controller';
import { SnippetsService } from './snippets.service';

describe('SnippetsController', () => {
  let controller: SnippetsController;
  let service: SnippetsService;

  const mockSnippet = {
    id: 1,
    title: 'Test',
    description: 'Desc',
    code: 'console.log("hi")',
    language: 'typescript',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockSnippet]),
    findOne: jest.fn().mockResolvedValue(mockSnippet),
    create: jest.fn().mockResolvedValue(mockSnippet),
    update: jest.fn().mockResolvedValue(mockSnippet),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnippetsController],
      providers: [{ provide: SnippetsService, useValue: mockService }],
    }).compile();

    controller = module.get<SnippetsController>(SnippetsController);
    service = module.get<SnippetsService>(SnippetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all snippets', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockSnippet]);
      expect(mockService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it('should pass query params to service', async () => {
      await controller.findAll('typescript', 'backend', 'test');
      expect(mockService.findAll).toHaveBeenCalledWith('typescript', 'backend', 'test');
    });
  });

  describe('findOne', () => {
    it('should return a snippet by id', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockSnippet);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a snippet', async () => {
      const dto = { title: 'Test', code: 'console.log("hi")', tagIds: [1] };
      const result = await controller.create(dto);
      expect(result).toEqual(mockSnippet);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a snippet', async () => {
      const dto = { title: 'Updated' };
      const result = await controller.update(1, dto);
      expect(result).toEqual(mockSnippet);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a snippet', async () => {
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
