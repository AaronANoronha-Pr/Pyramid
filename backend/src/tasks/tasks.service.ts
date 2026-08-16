import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const FIELD_LABELS: Record<string, string> = {
  title: 'title',
  description: 'description',
  priority: 'priority',
  column: 'column',
  status: 'status',
  assigneeName: 'assignee',
  dueDate: 'due date',
  startDate: 'start date',
  reporter: 'reporter',
  tags: 'labels',
  teams: 'teams',
};

// Fields where the raw before/after value isn't worth showing in the activity log (too long/noisy) — just note that it changed.
const SUMMARY_ONLY_FIELDS = new Set(['description']);

const PRIORITY_LABELS: Record<string, string> = {
  none: 'No Priority',
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const COLUMN_LABELS: Record<string, string> = {
  todo: 'To Do',
  doing: 'Doing',
  completed: 'Completed',
  onhold: 'On Hold',
};

// Detail-panel "Status" field — independent of the board column above.
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  backlog: 'Backlog',
  onhold: 'On Hold',
  qatesting: 'QA Testing',
  uattesting: 'UAT Testing',
  done: 'Done',
};

function formatFieldValue(
  field: string,
  value: string | null | undefined,
): string {
  if (value === undefined || value === null || value === '') return 'None';
  if (field === 'priority') return PRIORITY_LABELS[value] ?? value;
  if (field === 'column') return COLUMN_LABELS[value] ?? value;
  if (field === 'status') return STATUS_LABELS[value] ?? value;
  return value;
}

const SEED_TASKS: Omit<CreateTaskDto, 'order'>[] = [
  {
    title: 'Write API Documentation',
    column: 'todo',
    assigneeName: 'Admin',
    dueDate: '29 Jul',
    tags: 'Deployment,Deployment',
    priority: 'high',
    reporter: 'Dexter',
  },
  {
    title: 'Implement Search Function',
    column: 'todo',
    assigneeName: 'Admin',
    dueDate: '29 Jul',
    tags: 'Deployment,Deployment',
    priority: 'medium',
    reporter: 'Dexter',
  },
  {
    title: 'Deploy to Production',
    column: 'todo',
    assigneeName: '',
    dueDate: '29 Jul',
    tags: 'Deployment,Deployment',
    priority: 'low',
    reporter: 'Priya Shah',
  },
  {
    title: 'Code Review Completed',
    column: 'doing',
    assigneeName: 'Admin',
    dueDate: '29 Jul',
    tags: 'Deployment,Deployment',
    priority: 'high',
    reporter: 'Dexter',
  },
  {
    title: 'Design Mockups Finalized',
    column: 'doing',
    assigneeName: 'Admin',
    dueDate: '29 Jul',
    tags: 'Deployment,Deployment',
    priority: 'medium',
    reporter: 'Priya Shah',
  },
  {
    title: 'Feature Testing Passed',
    column: 'completed',
    assigneeName: 'QA Team',
    dueDate: '30 Jul',
    tags: 'Testing,Passed',
    priority: 'high',
    reporter: 'Dexter',
  },
  {
    title: 'UI Design Updated',
    column: 'completed',
    assigneeName: 'Designer',
    dueDate: '31 Jul',
    tags: 'Design,Updated',
    priority: 'medium',
    reporter: 'Priya Shah',
  },
  {
    title: 'Security Audit Scheduled',
    column: 'completed',
    assigneeName: 'Security',
    dueDate: '01 Aug',
    tags: 'Audit,Scheduled',
    priority: 'low',
    reporter: 'Dexter',
  },
  {
    title: 'UI Review',
    column: 'onhold',
    assigneeName: 'Designer',
    dueDate: '02 Aug',
    tags: 'Design,Review',
    priority: 'medium',
    reporter: 'Priya Shah',
  },
  {
    title: 'Backend Integration',
    column: 'onhold',
    assigneeName: 'Dev Team',
    dueDate: '03 Aug',
    tags: 'Development',
    priority: 'high',
    reporter: 'Dexter',
  },
];

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async seedIfEmpty(ownerId: string) {
    const count = await this.prisma.task.count();
    if (count > 0) return;

    await this.prisma.task.createMany({
      data: SEED_TASKS.map((task, index) => ({
        ...task,
        description: task.description ?? '',
        assigneeName: task.assigneeName ?? '',
        dueDate: task.dueDate ?? '',
        tags: task.tags ?? '',
        priority: task.priority ?? 'medium',
        reporter: task.reporter ?? '',
        order: index,
        ownerId,
      })),
    });
  }

  findAll() {
    return this.prisma.task.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        members: true,
        resources: true,
        subtasks: { orderBy: { order: 'asc' } },
        customFields: { orderBy: { order: 'asc' } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(ownerId: string, dto: CreateTaskDto) {
    const maxOrder = await this.prisma.task.aggregate({
      where: { column: dto.column },
      _max: { order: true },
    });

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        column: dto.column,
        status: dto.status ?? 'todo',
        description: dto.description ?? '',
        assigneeName: dto.assigneeName ?? '',
        dueDate: dto.dueDate ?? '',
        startDate: dto.startDate ?? '',
        tags: dto.tags ?? '',
        teams: dto.teams ?? '',
        priority: dto.priority ?? 'medium',
        reporter: dto.reporter ?? '',
        order: (maxOrder._max.order ?? -1) + 1,
        ownerId,
        projectId: dto.projectId || undefined,
      },
    });

    if (task.projectId) {
      await this.activityService.recordTaskEvent(
        ownerId,
        task.id,
        ownerId,
        task.title,
        task.projectId,
        'created this task',
      );
    }

    return task;
  }

  private async assertExists(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    const before = await this.assertExists(id);
    const data = {
      ...dto,
      projectId: dto.projectId === '' ? null : dto.projectId,
    };
    const updated = await this.prisma.task.update({ where: { id }, data });

    for (const field of Object.keys(FIELD_LABELS)) {
      const key = field as keyof UpdateTaskDto;
      if (!(key in dto)) continue;
      const oldValue = (before as unknown as Record<string, string>)[field];
      const newValue = dto[key] as string | undefined;
      if (oldValue === newValue) continue;

      const label = FIELD_LABELS[field];
      const message = SUMMARY_ONLY_FIELDS.has(field)
        ? `updated the ${label}`
        : `changed ${label} from ${formatFieldValue(field, oldValue)} to ${formatFieldValue(field, newValue)}`;
      await this.activityService.record(ownerId, id, ownerId, field, message);
    }

    if (typeof dto.locked === 'boolean' && dto.locked !== before.locked) {
      await this.activityService.record(
        ownerId,
        id,
        ownerId,
        'locked',
        dto.locked ? 'locked this task' : 'unlocked this task',
      );
    }

    this.realtimeGateway.emitTaskChanged(id);
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const task = await this.assertExists(id);
    if (task.projectId) {
      await this.activityService.recordTaskEvent(
        ownerId,
        task.id,
        ownerId,
        task.title,
        task.projectId,
        `deleted task "${task.title}"`,
      );
    }
    await this.prisma.task.delete({ where: { id } });
    this.realtimeGateway.emitTaskChanged(id);
    return { success: true };
  }
}
