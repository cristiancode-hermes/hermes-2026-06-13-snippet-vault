import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Snippet } from './snippet.entity';
import { Tag } from '../tags/tag.entity';
import { CreateSnippetDto, UpdateSnippetDto } from './snippet.dto';

@Injectable()
export class SnippetsService {
  private readonly logger = new Logger(SnippetsService.name);

  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(language?: string, tag?: string, search?: string): Promise<Snippet[]> {
    const qb = this.snippetRepo.createQueryBuilder('snippet');
    qb.leftJoinAndSelect('snippet.tags', 'tags');

    if (language) {
      qb.andWhere('snippet.language = :language', { language });
    }
    if (tag) {
      qb.andWhere('tags.name = :tag', { tag });
    }
    if (search) {
      qb.andWhere(
        '(snippet.title LIKE :search OR snippet.description LIKE :search OR snippet.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('snippet.updatedAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<Snippet> {
    const snippet = await this.snippetRepo.findOne({
      where: { id },
      relations: { tags: true, analyses: true },
    });
    if (!snippet) {
      throw new NotFoundException(`Snippet #${id} not found`);
    }
    return snippet;
  }

  async create(dto: CreateSnippetDto): Promise<Snippet> {
    const tags = dto.tagIds?.length
      ? await this.tagRepo.findBy({ id: In(dto.tagIds) })
      : [];
    const snippet = this.snippetRepo.create({
      title: dto.title,
      description: dto.description || null,
      code: dto.code,
      language: dto.language || 'plaintext',
      tags,
    });
    return this.snippetRepo.save(snippet);
  }

  async update(id: number, dto: UpdateSnippetDto): Promise<Snippet> {
    const snippet = await this.snippetRepo.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!snippet) {
      throw new NotFoundException(`Snippet #${id} not found`);
    }
    if (dto.title !== undefined) snippet.title = dto.title;
    if (dto.description !== undefined) snippet.description = dto.description;
    if (dto.code !== undefined) snippet.code = dto.code;
    if (dto.language !== undefined) snippet.language = dto.language;
    if (dto.tagIds !== undefined) {
      snippet.tags = dto.tagIds.length
        ? await this.tagRepo.findBy({ id: In(dto.tagIds) })
        : [];
    }
    return this.snippetRepo.save(snippet);
  }

  async remove(id: number): Promise<void> {
    const result = await this.snippetRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Snippet #${id} not found`);
    }
  }
}
