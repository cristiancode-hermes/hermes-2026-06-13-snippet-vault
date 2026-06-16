import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  let service: CollectionsService;

  const mockCollection = {
    id: 1,
    name: 'My Collection',
    description: 'A test',
    color: '#8B5CF6',
    snippets: [],
    createdAt: new Date(),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockCollection]),
    findOne: jest.fn().mockResolvedValue(mockCollection),
    create: jest.fn().mockResolvedValue(mockCollection),
    update: jest.fn().mockResolvedValue(mockCollection),
    addSnippet: jest.fn().mockResolvedValue(mockCollection),
    removeSnippet: jest.fn().mockResolvedValue(mockCollection),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [{ provide: CollectionsService, useValue: mockService }],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
    service = module.get<CollectionsService>(CollectionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all collections', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockCollection]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a collection by id', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockCollection);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a collection', async () => {
      const dto = { name: 'My Collection', description: 'A test' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockCollection);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const dto = { name: 'Updated' };
      const result = await controller.update(1, dto);
      expect(result).toEqual(mockCollection);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('addSnippet', () => {
    it('should add snippet to collection', async () => {
      const result = await controller.addSnippet(1, 2);
      expect(result).toEqual(mockCollection);
      expect(mockService.addSnippet).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('removeSnippet', () => {
    it('should remove snippet from collection', async () => {
      const result = await controller.removeSnippet(1, 2);
      expect(result).toEqual(mockCollection);
      expect(mockService.removeSnippet).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('remove', () => {
    it('should delete a collection', async () => {
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
