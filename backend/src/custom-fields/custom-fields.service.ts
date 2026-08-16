import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  findAllForTask(taskId: string) {
    return this.prisma.customField.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  private async assertExists(id: string) {
    const field = await this.prisma.customField.findUnique({ where: { id } });
    if (!field) throw new NotFoundException('Custom field not found');
    return field;
  }

  async create(ownerId: string, taskId: string, dto: CreateCustomFieldDto) {
    await this.tasksService.findOne(taskId);

    const maxOrder = await this.prisma.customField.aggregate({
      where: { taskId },
      _max: { order: true },
    });

    const field = await this.prisma.customField.create({
      data: {
        name: dto.name,
        value: dto.value,
        order: (maxOrder._max.order ?? -1) + 1,
        taskId,
        ownerId,
      },
    });

    await this.activityService.record(
      ownerId,
      taskId,
      ownerId,
      'customField',
      `added a custom field: "${dto.name}"`,
    );

    this.realtimeGateway.emitTaskChanged(taskId);
    return field;
  }

  async update(id: string, dto: UpdateCustomFieldDto) {
    const field = await this.assertExists(id);
    const updated = await this.prisma.customField.update({ where: { id }, data: dto });
    this.realtimeGateway.emitTaskChanged(field.taskId);
    return updated;
  }

  async remove(id: string) {
    const field = await this.assertExists(id);
    await this.prisma.customField.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(field.taskId);
    return { success: true };
  }
}
