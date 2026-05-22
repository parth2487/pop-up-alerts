import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Widget } from 'src/widgets/entities/widget.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
    private eventEmitter: EventEmitter2,
  ) {}

  findAll(): Promise<Lead[]> {
    return this.leadRepository.find();
  }

  async create(createLeadDto: CreateLeadDto, widgetId: string): Promise<Lead> {
    const widget = await this.widgetRepository.findOneBy({ id: widgetId });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    
    const newLead = this.leadRepository.create({
      ...createLeadDto,
      widget: { id: widgetId },
    });

    const savedLead = await this.leadRepository.save(newLead);
    this.eventEmitter.emit('lead.created', savedLead);
    
    return savedLead;
  }
}
