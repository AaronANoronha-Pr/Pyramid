import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateTaskMemberDto } from './dto/create-task-member.dto';

@Injectable()
export class TaskMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(ownerId: string, taskId: string, dto: CreateTaskMemberDto) {
    await this.tasksService.findOne(taskId);

    const existing = await this.prisma.taskMember.findUnique({
      where: { taskId_memberName: { taskId, memberName: dto.memberName } },
    });
    if (existing) return existing;

    const member = await this.prisma.taskMember.create({
      data: {
        taskId,
        memberName: dto.memberName,
        memberInits: dto.memberInits,
        ownerId,
      },
    });

    await this.activityService.record(
      ownerId,
      taskId,
      ownerId,
      'member',
      `added ${dto.memberName} as a member`,
    );

    this.realtimeGateway.emitTaskChanged(taskId);
    return member;
  }

  async remove(id: string) {
    const member = await this.prisma.taskMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.taskMember.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(member.taskId);
    return { success: true };
  }
}
