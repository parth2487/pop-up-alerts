import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayPalProvider } from './paypal.provider';

@Module({
  imports: [ConfigModule], // Needed because PayPalProvider uses ConfigService
  providers: [PayPalProvider],
  exports: [PayPalProvider], // CRUCIAL: Makes PayPalProvider available to other modules
})
export class PaypalModule {}
