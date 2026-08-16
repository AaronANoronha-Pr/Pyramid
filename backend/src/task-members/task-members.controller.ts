import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskMembersService } from './task-members.service';
import { CreateTaskMemberDto } from './dto/create-task-member.dto';

@Controller('tasks/:taskId/members')
@UseGuards(JwtAuthGuard)
export class TaskMembersController {
  constructor(private readonly taskMembersService: TaskMembersService) {}

  private ownerId(req: Request) {
    return (req.user as { userId: string }).userId;
  }

  @Post()
  create(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskMemberDto,
  ) {
    return this.taskMembersService.create(this.ownerId(req), taskId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskMembersService.remove(id);
  }
}
