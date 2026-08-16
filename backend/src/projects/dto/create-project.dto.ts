import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TASK_PRIORITIES,
  type TaskPriority,
} from '../../tasks/dto/create-task.dto';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

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
  leadName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dueDate?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
