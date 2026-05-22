import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Widget } from 'src/widgets/entities/widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Widget])],
  providers: [FeedbackService],
  exports: [FeedbackService], // Ekspor service agar bisa dipakai di modul lain
})
export class FeedbackModule {}