import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from 'src/widgets/entities/widget.entity';
import { HttpModule } from '@nestjs/axios'; // <-- 1. Impor HttpModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Widget]),
    HttpModule // <-- 2. Daftarkan HttpModule di sini
  ],
  providers: [NotificationsService],
})
export class NotificationsModule {}
