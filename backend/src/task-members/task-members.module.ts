import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { ActivityModule } from '../activity/activity.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { TaskMembersController } from './task-members.controller';
import { TaskMembersService } from './task-members.service';

@Module({
  imports: [TasksModule, ActivityModule, RealtimeModule],
  controllers: [TaskMembersController],
  providers: [TaskMembersService],
  exports: [TaskMembersService],
})
export class TaskMembersModule {}
