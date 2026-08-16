import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  url: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
