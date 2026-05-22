import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private newsletterRepo: Repository<Newsletter>,
  ) {}

  async subscribe(data: CreateNewsletterDto) {
    const existing = await this.newsletterRepo.findOne({ where: { email: data.email } });

    if (existing) {
      throw new BadRequestException('Email is already subscribed.');
    }

    const subscriber = this.newsletterRepo.create(data);
    return this.newsletterRepo.save(subscriber);
  }

  async getAllSubscribers() {
    return this.newsletterRepo.find({
      order: { createdAt: 'DESC' }
    });
  }
}
