import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Controller('tasks/:taskId/resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  private ownerId(req: Request) {
    return (req.user as { userId: string }).userId;
  }

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.resourcesService.findAllForTask(taskId);
  }

  @Post()
  create(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: CreateResourceDto,
  ) {
    return this.resourcesService.create(this.ownerId(req), taskId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(this.ownerId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.resourcesService.remove(this.ownerId(req), id);
  }
}
