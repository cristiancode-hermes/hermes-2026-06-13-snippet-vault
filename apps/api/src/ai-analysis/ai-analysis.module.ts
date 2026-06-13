import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysis } from './ai-analysis.entity';
import { Snippet } from '../snippets/snippet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysis, Snippet])],
  providers: [AiAnalysisService],
  controllers: [AiAnalysisController],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
