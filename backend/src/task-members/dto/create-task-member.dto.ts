import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskMemberDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  memberName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4)
  memberInits: string;
}
