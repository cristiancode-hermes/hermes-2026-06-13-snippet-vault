import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { Snippet } from '../snippets/snippet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet])],
  controllers: [SearchController],
})
export class SearchModule {}
