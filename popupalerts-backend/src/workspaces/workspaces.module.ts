import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { Widget } from 'src/widgets/entities/widget.entity';
import { Lead } from 'src/leads/entities/lead.entity';
import { Subscription } from 'src/users/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Widget, Lead,Subscription])],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
})
export class WorkspacesModule {}