import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;
}

export class UpdateCollectionDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;
}
