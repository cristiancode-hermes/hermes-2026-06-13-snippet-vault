import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

describe('TagsController', () => {
  let controller: TagsController;
  let service: TagsService;

  const mockTag = { id: 1, name: 'typescript', color: '#3178C6', snippets: [] };

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockTag]),
    findOne: jest.fn().mockResolvedValue(mockTag),
    search: jest.fn().mockResolvedValue([mockTag]),
    create: jest.fn().mockResolvedValue(mockTag),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: mockService }],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockTag]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search tags by query', async () => {
      const result = await controller.search('type');
      expect(result).toEqual([mockTag]);
      expect(mockService.search).toHaveBeenCalledWith('type');
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockTag);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const dto = { name: 'typescript', color: '#3178C6' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockTag);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should delete a tag', async () => {
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
