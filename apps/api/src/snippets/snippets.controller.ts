import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto, UpdateSnippetDto } from './snippet.dto';

@ApiTags('Snippets')
@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all snippets with optional filters' })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('language') language?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.snippetsService.findAll(language, tag, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a snippet by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.snippetsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new snippet' })
  create(@Body() dto: CreateSnippetDto) {
    return this.snippetsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a snippet' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSnippetDto) {
    return this.snippetsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a snippet' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.snippetsService.remove(id);
  }
}
