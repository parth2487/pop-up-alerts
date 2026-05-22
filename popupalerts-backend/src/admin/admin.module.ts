import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Subscription } from 'src/users/entities/subscription.entity';
import { Widget } from 'src/widgets/entities/widget.entity';
import { Lead } from 'src/leads/entities/lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subscription, Widget, Lead])],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}