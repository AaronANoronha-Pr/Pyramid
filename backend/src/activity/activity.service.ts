import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateActivityDto } from './dto/create-activity.dto';

const AUTHOR_SELECT = { id: true, name: true, avatarUrl: true } as const;

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private async assertTaskExists(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findAllForTask(taskId: string) {
    await this.assertTaskExists(taskId);
    return this.prisma.activityLog.findMany({
      where: { taskId },
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForProject(projectId: string) {
    return this.prisma.activityLog.findMany({
      where: { projectId },
      include: {
        author: { select: AUTHOR_SELECT },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async postUpdate(ownerId: string, taskId: string, dto: CreateActivityDto) {
    const task = await this.assertTaskExists(taskId);
    const entry = await this.prisma.activityLog.create({
      data: {
        taskId,
        projectId: task.projectId,
        taskTitle: task.title,
        ownerId,
        authorId: ownerId,
        kind: 'update',
        message: dto.message,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
    this.realtimeGateway.emitTaskChanged(taskId);
    return entry;
  }

  // Called by TasksService, which has already validated ownership — skips the re-check here to avoid a TasksModule/ActivityModule circular import.
  async record(
    ownerId: string,
    taskId: string,
    authorId: string,
    field: string,
    message: string,
  ) {
    const task = await this.assertTaskExists(taskId);
    return this.prisma.activityLog.create({
      data: {
        taskId,
        projectId: task.projectId,
        taskTitle: task.title,
        ownerId,
        authorId,
        kind: 'change',
        field,
        message,
      },
    });
  }

  // Task-level lifecycle events (created/deleted) for the project activity feed.
  // Called by TasksService with the task's known title/projectId — for deletion this
  // must be recorded BEFORE the task row is removed, since taskId is captured at
  // creation time but the FK is ON DELETE SET NULL, so the entry itself survives.
  recordTaskEvent(
    ownerId: string,
    taskId: string,
    authorId: string,
    taskTitle: string,
    projectId: string | null,
    message: string,
  ) {
    if (!projectId) return null;
    return this.prisma.activityLog.create({
      data: {
        taskId,
        projectId,
        taskTitle,
        ownerId,
        authorId,
        kind: 'task',
        message,
      },
    });
  }
}
