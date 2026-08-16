import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  findAllForTask(taskId: string) {
    return this.prisma.resource.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  private async assertExists(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async create(ownerId: string, taskId: string, dto: CreateResourceDto) {
    await this.tasksService.findOne(taskId);

    const maxOrder = await this.prisma.resource.aggregate({
      where: { taskId },
      _max: { order: true },
    });

    const resource = await this.prisma.resource.create({
      data: {
        label: dto.label,
        url: dto.url,
        order: (maxOrder._max.order ?? -1) + 1,
        taskId,
        ownerId,
      },
    });

    await this.activityService.record(
      ownerId,
      taskId,
      ownerId,
      'resource',
      `added a resource: "${dto.label}"`,
    );

    this.realtimeGateway.emitTaskChanged(taskId);
    return resource;
  }

  async update(ownerId: string, id: string, dto: UpdateResourceDto) {
    const resource = await this.assertExists(id);
    const updated = await this.prisma.resource.update({ where: { id }, data: dto });
    this.realtimeGateway.emitTaskChanged(resource.taskId);
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const resource = await this.assertExists(id);
    await this.prisma.resource.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(resource.taskId);
    return { success: true };
  }
}
