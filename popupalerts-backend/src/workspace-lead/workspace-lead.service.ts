import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceLead } from './entity/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class WorkspaceLeadService {
  constructor(
    @InjectRepository(WorkspaceLead)
    private readonly repo: Repository<WorkspaceLead>,
  ) {}

  async create(dto: CreateLeadDto): Promise<WorkspaceLead> {
    const lead = this.repo.create(dto);
    return this.repo.save(lead);
  }

  async findAll(): Promise<WorkspaceLead[]> {
    return this.repo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<WorkspaceLead> {
    const lead = await this.repo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async countByDomain(domain: string): Promise<{ domain: string; count: number }> {
    const count = await this.repo.count({ where: { domain } });
    return { domain, count };
  }
}