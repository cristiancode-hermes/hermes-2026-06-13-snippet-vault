import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { Snippet } from './snippet.entity';
import { Tag } from '../tags/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet, Tag])],
  providers: [SnippetsService],
  controllers: [SnippetsController],
  exports: [SnippetsService],
})
export class SnippetsModule {}
