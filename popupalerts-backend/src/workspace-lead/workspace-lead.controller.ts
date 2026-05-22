import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { WorkspaceLeadService } from './workspace-lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('workspace-lead')
export class WorkspaceLeadController {
  constructor(private readonly service: WorkspaceLeadService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('count/:domain')
  countByDomain(@Param('domain') domain: string) {
    return this.service.countByDomain(domain);
  }
}
