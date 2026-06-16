import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let tagRepo: Repository<Tag>;

  const mockTag = { id: 1, name: 'typescript', color: '#3178C6', snippets: [] };

  const mockTagRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: mockTagRepo },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    tagRepo = module.get<Repository<Tag>>(getRepositoryToken(Tag));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tags ordered by name', async () => {
      mockTagRepo.find.mockResolvedValue([mockTag]);
      const result = await service.findAll();
      expect(result).toEqual([mockTag]);
      expect(mockTagRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      mockTagRepo.findOne.mockResolvedValue(mockTag);
      const result = await service.findOne(1);
      expect(result).toEqual(mockTag);
      expect(mockTagRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { snippets: true },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search tags by name', async () => {
      mockTagRepo.find.mockResolvedValue([mockTag]);
      const result = await service.search('typescript');
      expect(result).toEqual([mockTag]);
      expect(mockTagRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      mockTagRepo.findOneBy.mockResolvedValue(null);
      mockTagRepo.create.mockReturnValue(mockTag);
      mockTagRepo.save.mockResolvedValue(mockTag);

      const result = await service.create({ name: 'typescript' });
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException if tag already exists', async () => {
      mockTagRepo.findOneBy.mockResolvedValue(mockTag);
      await expect(service.create({ name: 'typescript' })).rejects.toThrow(ConflictException);
    });

    it('should use default color when not provided', async () => {
      mockTagRepo.findOneBy.mockResolvedValue(null);
      mockTagRepo.create.mockReturnValue(mockTag);
      mockTagRepo.save.mockResolvedValue(mockTag);

      await service.create({ name: 'newtag' });
      expect(mockTagRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#3B82F6' }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a tag', async () => {
      mockTagRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockTagRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
