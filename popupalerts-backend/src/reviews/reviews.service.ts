import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Widget } from 'src/widgets/entities/widget.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
  ) {}

  // Metode yang dilindungi untuk membuat ulasan baru
  async create(createReviewDto: CreateReviewDto, widgetId: string, userId: string): Promise<Review> {
    const widget = await this.widgetRepository.findOne({ 
      where: { id: widgetId }, 
      relations: ['workspace', 'workspace.user'] 
    });

    if (!widget || !widget.workspace || !widget.workspace.user || widget.workspace.user.id !== userId) {
      throw new UnauthorizedException('You do not own this widget to add reviews.');
    }

    const newReview = this.reviewRepository.create({ ...createReviewDto, widget: { id: widgetId } });
    return this.reviewRepository.save(newReview);
  }

  // Metode publik untuk mengambil semua ulasan dari sebuah widget
  async findAllForWidget(widgetId: string): Promise<Review[]> {
    return this.reviewRepository.find({ 
      where: { widget: { id: widgetId } }, 
      order: { created_at: 'DESC' } 
    });
  }
}

