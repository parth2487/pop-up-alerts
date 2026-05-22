import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
  Get,
  NotFoundException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { User } from 'src/users/entities/user.entity';
import type { Request } from 'express';
import { GetUser } from 'src/auth/get-user.decorator';
import { PlanType, Subscription } from 'src/users/entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @InjectRepository(Subscription)
  private subscriptionRepository: Repository<Subscription>;
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'))
  createCheckoutSession(
    @GetUser() user: User,
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(
      createCheckoutDto.priceId,
      user.id,
    );
  }

  @Post('create-portal-session')
  @UseGuards(AuthGuard('jwt'))
  async createPortalSession(@GetUser() user: User) {
    console.log('use is the :: ', user);
    // return this.billingService.createPortalSession(user.id);

    try {
      const result = await this.billingService.createPortalSession(user.id);
      return result;
    } catch (error) {
      console.error('Error in createPortalSession:', error);
      throw error;
    }
  }

  @Post('create-paypal-order')
  @UseGuards(AuthGuard('jwt'))
  createPaypalOrder(@Body() body: { planType: PlanType }) {
    return this.billingService.createPaypalOrder(body.planType);
  }

  @Post('capture-paypal-order')
  @UseGuards(AuthGuard('jwt'))
  capturePaypalOrder(
    @GetUser() user: User,
    @Body() body: { orderID: string; planType: PlanType },
  ) {
    return this.billingService.capturePaypalOrder(
      body.orderID,
      user.id,
      body.planType,
    );
  }

  @Post('paypal/webhook')
  async handlePaypalWebhook(@Req() req: Request) {
    const headers = {
      'paypal-transmission-id': req.headers['paypal-transmission-id'],
      'paypal-transmission-time': req.headers['paypal-transmission-time'],
      'paypal-cert-url': req.headers['paypal-cert-url'],
      'paypal-auth-algo': req.headers['paypal-auth-algo'],
      'paypal-transmission-sig': req.headers['paypal-transmission-sig'],
    };
    console.log('header are the ::  ', headers);
    const body = req.body;
    console.log('body is the :: ', body);

    // You can add signature verification here if needed
    return this.billingService.handlePaypalWebhook(body);
  }

  @Post('paypal-subscription/activate')
  @UseGuards(AuthGuard('jwt'))
  async activatePaypalSubscription(
    @GetUser() user: User,
    @Body() body: { subscriptionID: string; planType: PlanType },
  ) {
    return this.billingService.activatePaypalSubscription(
      body.subscriptionID,
      user.id,
      body.planType,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log('🔔 WEBHOOK ENDPOINT HIT!');
    console.log('Signature received:', signature ? 'YES ' : 'NO ');
    console.log('Raw body received:', req.rawBody ? 'YES ' : 'NO ');
    console.log(' req.rawBody :: ', req.rawBody);
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Request body is missing rawBody');
    }
    return this.billingService.handleStripeWebhook(signature, req.rawBody);
  }

  @Get('subscription')
  @UseGuards(AuthGuard('jwt'))
  async getSubscription(@GetUser() user: User) {
    return this.billingService.getSubscription(user.id);
  }

  @Post('paypal/details')
  @UseGuards(AuthGuard('jwt'))
  async getPayPalDetails(@Req() req) {
    const userId = req.user.id;

    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });
    console.log('SUbscription is the :: ', subscription);
    if (!subscription?.paypal_subscription_id) {
      throw new NotFoundException('No PayPal subscription found');
    }

    return await this.billingService.getPayPalSubscriptionDetails(
      subscription.paypal_subscription_id,
    );
  }

  @Post('paypal/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancelPaypalSubscription(
    @GetUser() user: User,
    @Body() body: { subscriptionID: string },
  ) {
    console.log('subscriptionID :: ', body.subscriptionID);

    // Validate user subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!subscription?.paypal_subscription_id) {
      throw new NotFoundException(
        'No PayPal subscription found for this user.',
      );
    }

    try {
      return await this.billingService.cancelPaypalSubscription(
        body.subscriptionID || subscription.paypal_subscription_id,
        Number(user.id),
      );
    } catch (error) {
      console.error('Error cancelling PayPal subscription:', error);
      throw new BadRequestException('Failed to cancel PayPal subscription.');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-subscription')
  async getMySubscription(@Req() req) {
    console.log('req in the getMySubscription ::  ', req);
    const userId = req.user.id; // depends on your auth system
    return this.billingService.getActiveOrRecentSubscription(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-cancel-subscription')
  async getMyCancelSubscription(@Req() req) {
    console.log('req in the getMySubscription ::  ', req);
    const userId = req.user.id; // depends on your auth system
    return this.billingService.getCancelSubscription(userId);
  }
}
