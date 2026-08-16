import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const SEED_PROJECTS: Omit<CreateProjectDto, 'order'>[] = [
  {
    name: 'Axiom',
    description: 'Core platform infrastructure and shared services.',
    priority: 'high',
    leadName: 'Admin',
    dueDate: '30 Sep',
  },
  {
    name: 'Paradox',
    description: 'Experimental features and design explorations.',
    priority: 'medium',
    leadName: 'Designer',
    dueDate: '15 Oct',
  },
  {
    name: 'Orion',
    description: 'Customer-facing launch initiatives.',
    priority: 'urgent',
    leadName: 'Dev Team',
    dueDate: '01 Sep',
  },
];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedIfEmpty(ownerId: string) {
    const count = await this.prisma.project.count();
    if (count > 0) return;

    await this.prisma.project.createMany({
      data: SEED_PROJECTS.map((project, index) => ({
        ...project,
        order: index,
        ownerId,
      })),
    });
  }

  findAll() {
    return this.prisma.project.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private assertExists(id: string) {
    return this.findOne(id);
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    const maxOrder = await this.prisma.project.aggregate({
      _max: { order: true },
    });

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        priority: dto.priority ?? 'medium',
        leadName: dto.leadName ?? '',
        dueDate: dto.dueDate ?? '',
        order: (maxOrder._max.order ?? -1) + 1,
        ownerId,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.assertExists(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }
}
