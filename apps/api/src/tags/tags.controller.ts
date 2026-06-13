import {
  Controller, Get, Post, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';
import { CreateTagDto } from './tag.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') q: string) {
    return this.tagsService.search(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
