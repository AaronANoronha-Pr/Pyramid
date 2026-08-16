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
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Controller('tasks/:taskId/custom-fields')
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  private ownerId(req: Request) {
    return (req.user as { userId: string }).userId;
  }

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.customFieldsService.findAllForTask(taskId);
  }

  @Post()
  create(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCustomFieldDto,
  ) {
    return this.customFieldsService.create(this.ownerId(req), taskId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.customFieldsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customFieldsService.remove(id);
  }
}
