import { Module } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { WidgetsController, WorkspaceWidgetsController } from './widgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Lead } from 'src/leads/entities/lead.entity';
import { FeedbackModule } from 'src/feedback/feedback.module'; // <-- Impor yang sudah ada
import { LeadsModule } from 'src/leads/leads.module';         // <-- Impor yang baru
import { Subscription } from 'src/users/entities/subscription.entity';

@Module({
  // --- PERBAIKAN UTAMA DI SINI ---
  // Pastikan KEDUA modul yang dibutuhkan diimpor
  imports: [
    TypeOrmModule.forFeature([Widget, Workspace, Lead,Subscription]), 
    FeedbackModule, 
    LeadsModule
  ],
  // -------------------------------
  controllers: [WidgetsController, WorkspaceWidgetsController],
  providers: [WidgetsService],
})
export class WidgetsModule {}
