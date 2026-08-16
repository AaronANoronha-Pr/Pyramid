import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const TASK_COLUMNS = ['todo', 'doing', 'completed', 'onhold'] as const;
export type TaskColumn = (typeof TASK_COLUMNS)[number];

export const TASK_PRIORITIES = [
  'none',
  'urgent',
  'high',
  'medium',
  'low',
] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// Detail-panel "Status" field — independent of the board column above.
export const TASK_STATUSES = [
  'todo',
  'inprogress',
  'backlog',
  'onhold',
  'qatesting',
  'uattesting',
  'done',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsIn(TASK_COLUMNS)
  column: TaskColumn;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  assigneeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  tags?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  teams?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reporter?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectId?: string;
}
