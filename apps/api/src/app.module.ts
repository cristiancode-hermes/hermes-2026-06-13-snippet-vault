import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SnippetsModule } from './snippets/snippets.module';
import { TagsModule } from './tags/tags.module';
import { CollectionsModule } from './collections/collections.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { SearchModule } from './search/search.module';
import { Snippet } from './snippets/snippet.entity';
import { Tag } from './tags/tag.entity';
import { Collection } from './collections/collection.entity';
import { AiAnalysis } from './ai-analysis/ai-analysis.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as any,
        database: config.get<string>('DATABASE_URL', 'data/snippets.db'),
        entities: [Snippet, Tag, Collection, AiAnalysis, User],
        synchronize: true,
      }),
    }),
    AuthModule,
    SnippetsModule,
    TagsModule,
    CollectionsModule,
    AiAnalysisModule,
    SearchModule,
  ],
})
export class AppModule {}
