import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
  ) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async upsertGoogleUser(profile: GoogleProfile) {
    const existing = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      });
    }

    const created = await this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        provider: 'google',
      },
    });
    await this.tasksService.seedIfEmpty(created.id);
    await this.projectsService.seedIfEmpty(created.id);
    return created;
  }

  async createGuestUser() {
    const suffix = Math.random().toString(36).slice(2, 8);
    const created = await this.prisma.user.create({
      data: {
        name: `Guest-${suffix}`,
        provider: 'guest',
      },
    });
    await this.tasksService.seedIfEmpty(created.id);
    await this.projectsService.seedIfEmpty(created.id);
    return created;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('That username or email is already taken');
      }
      throw error;
    }
  }

  updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({ where: { id }, data: { avatarUrl } });
  }
}
