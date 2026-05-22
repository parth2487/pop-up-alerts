import { Controller, Post, Body, Get } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() body: CreateNewsletterDto) {
    const result = await this.newsletterService.subscribe(body);
    return {
      message: 'Successfully subscribed!',
      subscriber: result,
    };
  }

  @Get('subscribers')
  async getSubscribers() {
    return this.newsletterService.getAllSubscribers();
  }
}
