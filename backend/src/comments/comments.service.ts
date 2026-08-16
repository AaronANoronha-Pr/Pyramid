import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const AUTHOR_SELECT = { id: true, name: true, avatarUrl: true } as const;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  findAllForTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId, parentId: null },
      include: {
        author: { select: AUTHOR_SELECT },
        attachments: true,
        replies: {
          include: { author: { select: AUTHOR_SELECT }, attachments: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async assertExists(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(ownerId: string, taskId: string, dto: CreateCommentDto) {
    await this.tasksService.findOne(taskId);

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body,
        taskId,
        authorId: ownerId,
        ownerId,
        parentId: dto.parentId,
      },
      include: { author: { select: AUTHOR_SELECT }, attachments: true },
    });

    if (dto.attachmentIds?.length) {
      await this.prisma.commentAttachment.updateMany({
        where: { id: { in: dto.attachmentIds }, commentId: null },
        data: { commentId: comment.id },
      });
      comment.attachments = await this.prisma.commentAttachment.findMany({
        where: { commentId: comment.id },
      });
    }

    await this.activityService.record(
      ownerId,
      taskId,
      ownerId,
      'comment',
      dto.parentId ? 'replied to a comment' : 'added a comment',
    );

    this.realtimeGateway.emitTaskChanged(taskId);
    return comment;
  }

  async update(ownerId: string, id: string, dto: UpdateCommentDto) {
    const comment = await this.assertExists(id);
    if (comment.authorId !== ownerId) throw new ForbiddenException();
    const updated = await this.prisma.comment.update({
      where: { id },
      data: { body: dto.body },
      include: { author: { select: AUTHOR_SELECT } },
    });
    this.realtimeGateway.emitTaskChanged(comment.taskId);
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const comment = await this.assertExists(id);
    if (comment.authorId !== ownerId) throw new ForbiddenException();
    await this.prisma.comment.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(comment.taskId);
    return { success: true };
  }
}
