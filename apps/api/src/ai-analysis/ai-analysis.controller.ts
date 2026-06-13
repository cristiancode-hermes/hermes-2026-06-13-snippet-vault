import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiAnalysisService } from './ai-analysis.service';

@ApiTags('AI Analysis')
@Controller('ai')
export class AiAnalysisController {
  constructor(private readonly aiService: AiAnalysisService) {}

  @Post('analyze/:snippetId')
  @ApiOperation({ summary: 'Analyze a code snippet (heuristic AI)' })
  analyze(@Param('snippetId', ParseIntPipe) snippetId: number) {
    return this.aiService.analyze(snippetId);
  }

  @Get('analyses/:snippetId')
  @ApiOperation({ summary: 'Get all analyses for a snippet' })
  getAnalyses(@Param('snippetId', ParseIntPipe) snippetId: number) {
    return this.aiService.getAnalyses(snippetId);
  }
}
