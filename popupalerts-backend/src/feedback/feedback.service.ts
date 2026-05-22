import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Widget } from 'src/widgets/entities/widget.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
  ) {}

  // Metode publik untuk membuat feedback baru
  async create(createFeedbackDto: CreateFeedbackDto, widgetId: string): Promise<Feedback> {
    const widget = await this.widgetRepository.findOneBy({ id: widgetId });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    const newFeedback = this.feedbackRepository.create({ ...createFeedbackDto, widget: { id: widgetId } });
    return this.feedbackRepository.save(newFeedback);
  }
}