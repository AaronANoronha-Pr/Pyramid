import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TASK_PRIORITIES } from '../../tasks/dto/create-task.dto';
import type { TaskPriority } from '../../tasks/dto/create-task.dto';

export class CreateSubtaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  assigneeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dueDate?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
