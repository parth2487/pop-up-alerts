import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from './entity/contact-us.entity';
import { WorkspaceLeadModule } from 'src/workspace-lead/workspace-lead.module';

@Module({
   imports: [TypeOrmModule.forFeature([ContactUs]), WorkspaceLeadModule],
  controllers: [ContactUsController],
  providers: [ContactUsService]
})
export class ContactUsModule {}
