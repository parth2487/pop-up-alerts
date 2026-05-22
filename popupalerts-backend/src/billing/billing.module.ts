import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/users/entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { PaypalModule } from 'src/paypal/paypal.module'; // <-- PERBAIKAN 1: Gunakan 'PaypalModule'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Subscription, User]),
    // --- PERBAIKAN UTAMA DI SINI ---
    PaypalModule, // <-- PERBAIKAN 2: Gunakan 'PaypalModule'
    // ----------------------------
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}

