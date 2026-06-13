import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto } from './collection.dto';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all collections' })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collection with its snippets' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a collection' })
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a collection' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Post(':collectionId/snippets/:snippetId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add snippet to collection' })
  addSnippet(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
  ) {
    return this.collectionsService.addSnippet(collectionId, snippetId);
  }

  @Delete(':collectionId/snippets/:snippetId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove snippet from collection' })
  removeSnippet(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Param('snippetId', ParseIntPipe) snippetId: number,
  ) {
    return this.collectionsService.removeSnippet(collectionId, snippetId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a collection' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.remove(id);
  }
}
