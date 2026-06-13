import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './collection.entity';
import { Snippet } from '../snippets/snippet.entity';
import { CreateCollectionDto, UpdateCollectionDto } from './collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
  ) {}

  async findAll(): Promise<Collection[]> {
    return this.collectionRepo.find({
      order: { name: 'ASC' },
      relations: { snippets: true },
    });
  }

  async findOne(id: number): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id },
      relations: { snippets: { tags: true } },
    });
    if (!collection) throw new NotFoundException(`Collection #${id} not found`);
    return collection;
  }

  async create(dto: CreateCollectionDto): Promise<Collection> {
    const collection = this.collectionRepo.create({
      name: dto.name,
      description: dto.description || null,
      color: dto.color || '#8B5CF6',
    });
    return this.collectionRepo.save(collection);
  }

  async update(id: number, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.collectionRepo.findOneBy({ id });
    if (!collection) throw new NotFoundException(`Collection #${id} not found`);
    if (dto.name !== undefined) collection.name = dto.name;
    if (dto.description !== undefined) collection.description = dto.description;
    if (dto.color !== undefined) collection.color = dto.color;
    return this.collectionRepo.save(collection);
  }

  async addSnippet(collectionId: number, snippetId: number): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId },
      relations: { snippets: true },
    });
    if (!collection) throw new NotFoundException(`Collection #${collectionId} not found`);
    const snippet = await this.snippetRepo.findOneBy({ id: snippetId });
    if (!snippet) throw new NotFoundException(`Snippet #${snippetId} not found`);
    if (!collection.snippets.find((s) => s.id === snippetId)) {
      collection.snippets.push(snippet);
      await this.collectionRepo.save(collection);
    }
    return this.findOne(collectionId);
  }

  async removeSnippet(collectionId: number, snippetId: number): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId },
      relations: { snippets: true },
    });
    if (!collection) throw new NotFoundException(`Collection #${collectionId} not found`);
    collection.snippets = collection.snippets.filter((s) => s.id !== snippetId);
    await this.collectionRepo.save(collection);
    return this.findOne(collectionId);
  }

  async remove(id: number): Promise<void> {
    const result = await this.collectionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Collection #${id} not found`);
    }
  }
}
