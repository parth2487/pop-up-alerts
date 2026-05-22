import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
// Controller tidak dibutuhkan di sini
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Widget } from 'src/widgets/entities/widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Widget])],
  providers: [LeadsService],
  // --- PERBAIKAN UTAMA DI SINI ---
  // Ekspor LeadsService agar modul lain yang mengimpor LeadsModule bisa menggunakannya.
  exports: [LeadsService],
  // -------------------------------
})
export class LeadsModule {}

