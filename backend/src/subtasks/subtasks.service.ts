import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  findAllForTask(taskId: string) {
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  private async assertExists(id: string) {
    const subtask = await this.prisma.subtask.findUnique({ where: { id } });
    if (!subtask) throw new NotFoundException('Subtask not found');
    return subtask;
  }

  async create(ownerId: string, taskId: string, dto: CreateSubtaskDto) {
    await this.tasksService.findOne(taskId);

    const maxOrder = await this.prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    });

    const subtask = await this.prisma.subtask.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        priority: dto.priority ?? 'medium',
        assigneeName: dto.assigneeName ?? '',
        dueDate: dto.dueDate ?? '',
        order: (maxOrder._max.order ?? -1) + 1,
        taskId,
        ownerId,
      },
    });

    await this.activityService.record(
      ownerId,
      taskId,
      ownerId,
      'subtask',
      `added a subtask: "${dto.title}"`,
    );

    this.realtimeGateway.emitTaskChanged(taskId);
    return subtask;
  }

  async update(ownerId: string, id: string, dto: UpdateSubtaskDto) {
    const subtask = await this.assertExists(id);
    const updated = await this.prisma.subtask.update({ where: { id }, data: dto });
    this.realtimeGateway.emitTaskChanged(subtask.taskId);
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const subtask = await this.assertExists(id);
    await this.prisma.subtask.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(subtask.taskId);
    return { success: true };
  }
}
