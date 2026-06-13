import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  code!: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @IsOptional()
  collectionId?: number;
}

export class UpdateSnippetDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsOptional()
  tagIds?: number[];
}
