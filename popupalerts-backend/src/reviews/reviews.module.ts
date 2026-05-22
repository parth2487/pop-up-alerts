import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Widget } from 'src/widgets/entities/widget.entity'; // <-- 1. Impor Widget

@Module({
  // --- PERBAIKAN UTAMA DI SINI ---
  // Daftarkan KEDUA entity yang dibutuhkan oleh ReviewsService (Review dan Widget).
  imports: [TypeOrmModule.forFeature([Review, Widget])],
  // Kita tidak lagi memerlukan WidgetsModule di sini, membuatnya lebih bersih.
  // -------------------------------
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}

