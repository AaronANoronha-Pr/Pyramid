import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('tasks/:taskId/activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private ownerId(req: Request) {
    return (req.user as { userId: string }).userId;
  }

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.activityService.findAllForTask(taskId);
  }

  @Post()
  create(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activityService.postUpdate(this.ownerId(req), taskId, dto);
  }
}
