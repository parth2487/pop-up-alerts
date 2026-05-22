import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceLeadService } from './workspace-lead.service';

describe('WorkspaceLeadService', () => {
  let service: WorkspaceLeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceLeadService],
    }).compile();

    service = module.get<WorkspaceLeadService>(WorkspaceLeadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
