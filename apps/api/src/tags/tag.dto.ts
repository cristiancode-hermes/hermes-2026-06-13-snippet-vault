import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;
}
