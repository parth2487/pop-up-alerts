import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto } from './dto/ContactUsDto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async create(@Body() contactUsDto: ContactUsDto) {
    const result = await this.contactUsService.create(contactUsDto);
    return {
      message: 'Your message has been submitted successfully!',
      data: result,
    };
  }

  @Get()
  async getAll() {
    return this.contactUsService.findAll();
  }
}
