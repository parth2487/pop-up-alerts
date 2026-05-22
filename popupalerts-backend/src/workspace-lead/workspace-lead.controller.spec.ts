import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceLeadController } from './workspace-lead.controller';

describe('WorkspaceLeadController', () => {
  let controller: WorkspaceLeadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceLeadController],
    }).compile();

    controller = module.get<WorkspaceLeadController>(WorkspaceLeadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
