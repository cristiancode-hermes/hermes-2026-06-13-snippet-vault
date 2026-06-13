import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Snippet } from '../snippets/snippet.entity';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Semantic-like full-text search across snippets' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'tag', required: false })
  async search(
    @Query('q') q: string,
    @Query('language') language?: string,
    @Query('tag') tag?: string,
  ) {
    if (!q || q.trim().length === 0) {
      return [];
    }

    const queryBuilder = this.snippetRepo
      .createQueryBuilder('snippet')
      .leftJoinAndSelect('snippet.tags', 'tags');

    // Full-text-like search using LIKE on title, description, and code
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where('snippet.title LIKE :q', { q: `%${q}%` })
          .orWhere('snippet.description LIKE :q', { q: `%${q}%` })
          .orWhere('snippet.code LIKE :q', { q: `%${q}%` });
      }),
    );

    if (language) {
      queryBuilder.andWhere('snippet.language = :language', { language });
    }
    if (tag) {
      queryBuilder.andWhere('tags.name = :tag', { tag });
    }

    // Score results: title matches > description > code, exact > partial
    const snippets = await queryBuilder
      .orderBy('snippet.updatedAt', 'DESC')
      .take(50)
      .getMany();

    // Attach relevance score
    const scored = snippets.map((s) => {
      let score = 0;
      const lowerQ = q.toLowerCase();
      const lowerTitle = s.title.toLowerCase();
      const lowerDesc = (s.description || '').toLowerCase();
      const lowerCode = s.code.toLowerCase();

      if (lowerTitle === lowerQ) score += 100;
      else if (lowerTitle.includes(lowerQ)) score += 50;

      if (lowerDesc.includes(lowerQ)) score += 30;
      if (lowerCode.includes(lowerQ)) score += 20;

      return { ...s, relevanceScore: score };
    });

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored;
  }
}
