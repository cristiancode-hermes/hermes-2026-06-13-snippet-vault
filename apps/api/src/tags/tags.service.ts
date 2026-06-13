import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepo.findOne({
      where: { id },
      relations: { snippets: true },
    });
    if (!tag) throw new NotFoundException(`Tag #${id} not found`);
    return tag;
  }

  async search(query: string): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { name: Like(`%${query}%`) },
      take: 10,
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const existing = await this.tagRepo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(`Tag "${dto.name}" already exists`);
    }
    const tag = this.tagRepo.create({
      name: dto.name,
      color: dto.color || '#3B82F6',
    });
    return this.tagRepo.save(tag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tagRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
  }
}
