import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceLead } from './entity/lead.entity';
import { WorkspaceLeadService } from './workspace-lead.service';
import { WorkspaceLeadController } from './workspace-lead.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceLead])],  // ✅ REQUIRED
  controllers: [WorkspaceLeadController],
  providers: [WorkspaceLeadService],
  exports: [WorkspaceLeadService], // ✅ Export TypeOrmModule if used outside
})
export class WorkspaceLeadModule {}
