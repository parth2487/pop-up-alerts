import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entity/contact-us.entity';
import { ContactUsDto } from './dto/ContactUsDto';
import { WorkspaceLeadService } from 'src/workspace-lead/workspace-lead.service';
import { CreateLeadDto } from 'src/workspace-lead/dto/create-lead.dto';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private contactUsRepository: Repository<ContactUs>,

    private readonly leadsService: WorkspaceLeadService, // Inject LeadsService

  ) {}

  async create(contactUsDto: ContactUsDto): Promise<ContactUs> {
    const contact = this.contactUsRepository.create(contactUsDto);

  const savedContact = await this.contactUsRepository.save(contact);

    // 2️⃣ Create a lead from the contact (optional: pick domain/email)
    const leadDto: CreateLeadDto = {
      domain: contactUsDto.requirementType, // or any field you want to use as domain
    };

    await this.leadsService.create(leadDto);

    return savedContact;
  }

  async findAll(): Promise<ContactUs[]> {
    return this.contactUsRepository.find({ order: { createdAt: 'DESC' } });
  }
}