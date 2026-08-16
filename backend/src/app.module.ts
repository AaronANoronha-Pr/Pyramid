import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { CommentsModule } from './comments/comments.module';
import { TaskMembersModule } from './task-members/task-members.module';
import { ResourcesModule } from './resources/resources.module';
import { ActivityModule } from './activity/activity.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ProjectsModule } from './projects/projects.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TasksModule,
    SubtasksModule,
    CommentsModule,
    TaskMembersModule,
    ResourcesModule,
    ActivityModule,
    CustomFieldsModule,
    AttachmentsModule,
    ProjectsModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
