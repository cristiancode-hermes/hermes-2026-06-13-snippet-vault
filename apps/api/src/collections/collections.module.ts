import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection } from './collection.entity';
import { Snippet } from '../snippets/snippet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Snippet])],
  providers: [CollectionsService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
