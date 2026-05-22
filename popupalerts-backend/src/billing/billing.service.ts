import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import {
  Subscription,
  SubscriptionStatus,
  PlanType,
} from 'src/users/entities/subscription.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PayPalProvider } from 'src/paypal/paypal.provider';
import * as paypal from '@paypal/checkout-server-sdk';
import * as PayPalSDK from '@paypal/paypal-server-sdk';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private paypalClient: paypal.core.PayPalHttpClient;
  
  // --- TAMBAHKAN INI ---
  private frontendUrl: string;
  // ---------------------

  constructor(
    private configService: ConfigService,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private payPalProvider: PayPalProvider,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not defined',
      );
    }
    
    // --- INI PERBAIKANNYA ---
    const url = this.configService.get<string>('FRONTEND_URL');

    // Cek variabel 'url', BUKAN 'this.frontendUrl'
    if (!url) {
      throw new InternalServerErrorException('FRONTEND_URL is not defined in .env');
    }
    
    // 'url' sekarang sudah pasti 'string', jadi aman untuk di-assign
    this.frontendUrl = url; 
    // -------------------------

    this.stripe = new Stripe(secretKey, { apiVersion: '2025-09-30.clover' });
    this.paypalClient = this.payPalProvider.getClient();
  }

  private paypalAccessToken: string | null = null;
  private paypalTokenExpiresAt: number | null = null;

  async getPayPalAccessToken(): Promise<string> {
    // Reuse existing token if still valid
    if (
      this.paypalAccessToken &&
      this.paypalTokenExpiresAt &&
      Date.now() < this.paypalTokenExpiresAt
    ) {
      return this.paypalAccessToken;
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      throw new Error('PayPal credentials missing in environment variables');
    }

    const authString = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`,
    ).toString('base64');
    const PAYPAL_BASE_URL = this.configService.get<string>('PAYPAL_BASE_URL');
    if (!PAYPAL_BASE_URL) {
      throw new Error('PAYPAL_BASE_URL is missing in environment variables');
    }
    try {
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authString}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('PayPal Auth Error:', err);
        throw new Error(
          `Failed to retrieve PayPal token: ${response.statusText}`,
        );
      }

      const json = await response.json();

      this.paypalAccessToken = json.access_token;
      this.paypalTokenExpiresAt = Date.now() + (json.expires_in - 60) * 1000; // subtract 1 min safety buffer

      return this.paypalAccessToken!;
    } catch (error) {
      console.error('PayPal Token Request Failed:', error);
      throw new Error('Could not retrieve PayPal access token');
    }
  }

  async cancelPaypalSubscription(subscriptionID: string, userId: number) {
    const PAYPAL_BASE_URL = this.configService.get<string>('PAYPAL_BASE_URL');
    if (!PAYPAL_BASE_URL) {
      throw new Error('PAYPAL_BASE_URL is missing in environment variables');
    }
    // PayPal sandbox URL
    const url = `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionID}/cancel`;

    // Your OAuth token retrieval logic here
    const accessToken = await this.getPayPalAccessToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'User requested cancellation' }),
      });

      if (!response.ok) {
        // Get error text if request failed
        const errorText = await response.text();
        console.error('PayPal cancel error:', errorText);
        throw new BadRequestException(
          `Failed to cancel PayPal subscription. Status: ${response.status}, Message: ${errorText}`,
        );
      }

      console.log('PayPal subscription cancelled successfully');
      return { message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error(
        'PayPal cancel error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to cancel PayPal subscription.');
    }
  }

  async getPayPalSubscriptionDetails(subscriptionId: string) {
    const accessToken = await this.getPayPalAccessToken();
    console.log('accesstocken are the :: ', accessToken);
    const PAYPAL_BASE_URL = this.configService.get<string>('PAYPAL_BASE_URL');
    if (!PAYPAL_BASE_URL) {
      throw new Error('PAYPAL_BASE_URL is missing in environment variables');
    }
    const response = await fetch(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!response.ok) {
      const err = await response.json();
      console.error('PayPal Subscription Fetch Error:', err);
      throw new Error('Could not fetch subscription details');
    }
    const data = await response.json();

    console.log('data is the :', data);
    return data;
  }

  async verifyPayPalWebhook(headers: any, body: any) {
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
    if (!webhookId) {
      throw new InternalServerErrorException(
        'PAYPAL_WEBHOOK_ID is not defined',
      );
    }

    const request =
      new paypal.notifications.WebhookEventVerifySignatureRequest();
    request.requestBody({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    });

    const response = await this.paypalClient.execute(request);
    return response.result.verification_status === 'SUCCESS';
  }

  async createCheckoutSession(priceId: string, userId: string) {
    await this.validateOrResetUserSubscription(userId);

    const FRONTEND_URL = this.configService.get<string>(
      'FRONTEND_URL',
    );

    if (!FRONTEND_URL ) {
      throw new Error('FRONTEND_URL URLs are missing in env');
    }

    const session = await this.stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // success_url: `http://localhost:5173/app/payment/success`,
      success_url: `${FRONTEND_URL}/app/pricing`,
      cancel_url: `${FRONTEND_URL}/app/pricing`,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });
    return { url: session.url };
  }

  async handlePaypalWebhook(body: any) {
    const eventType = body.event_type;
    const resource = body.resource;

    const subscriptionId = resource.id || resource.billing_agreement_id;
    if (!subscriptionId) return { status: 'ignored' };

    let status: SubscriptionStatus;
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        status = SubscriptionStatus.CANCELED;
        break;
      default:
        return { status: 'unhandled' };
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { paypal_subscription_id: subscriptionId },
    });
    if (!subscription) return { status: 'not_found' };

    subscription.status = status;
    if (status == SubscriptionStatus.ACTIVE) {
      subscription.paypal_payer_email = body.resource.subscriber.email_address;
    }
    await this.subscriptionRepository.save(subscription);

    return { status: 'success', subscriptionId, updatedStatus: status };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret)
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not defined',
      );

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription created event received:', subscription.id);
      await this.handleSubscriptionCreated(subscription);
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated event:', subscription.id);
      console.log('subscription.status :: ', subscription.status);
      console.log(
        'cancel_at_period_end :: ',
        subscription.cancel_at_period_end,
      );
      console.log('cancel_at :: ', subscription.cancel_at);
      console.log('canceled_at :: ', subscription.canceled_at);
      if (subscription.status === 'active') {
      } else if (subscription.status === 'canceled') {
        await this.handleSubscriptionDeleted(subscription);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(
        'Subscription deleted/expired event received:',
        subscription.id,
      );
      await this.handleSubscriptionDeleted(subscription);
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;
    const subRecord = await this.subscriptionRepository.findOne({
      where: { stripe_customer_id: stripeCustomerId },
      relations: ['user'],
    });

    if (!subRecord) {
      console.error(`Subscription not found for customer ${stripeCustomerId}`);
      return;
    }

    // Mark subscription as expired/canceled
    subRecord.status = SubscriptionStatus.CANCELED;
    subRecord.current_period_end = new Date(); // Optional: set end date to now
    await this.subscriptionRepository.save(subRecord);

    console.log(
      `Subscription for user ${subRecord.user.id} has been marked as expired.`,
    );
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('Webhook Error: Missing userId in subscription metadata');
      return;
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.error(`Webhook Error: User not found with id ${userId}`);
      return;
    }

    // Fetch price and product details from Stripe
    const priceId = subscription.items.data[0].price.id;
    const price = await this.stripe.prices.retrieve(priceId);
    const product = await this.stripe.products.retrieve(
      price.product as string,
    );

    let subRecord = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!subRecord) {
      subRecord = new Subscription();
      subRecord.user = user;
    }

    subRecord.paypal_subscription_id = null;
    subRecord.paypal_payer_email = null;
    subRecord.paypal_plan_id = null;

    // Store Stripe details
    subRecord.stripe_customer_id = subscription.customer as string;
    subRecord.stripe_subscription_id = subscription.id;
    subRecord.status = subscription.status as SubscriptionStatus;

    // Store plan details
    const interval = price.recurring?.interval;
    subRecord.plan_type =
      interval === 'year' ? PlanType.YEARLY : PlanType.MONTHLY;
    subRecord.amount = price.unit_amount ? price.unit_amount / 100 : 0;
    subRecord.currency = price.currency.toUpperCase();
    const stripeData = subscription as any;

    console.log('stripeData :: ', stripeData);
    // Store billing period - FIX: Access properties directly from subscription object
    // Stripe.Subscription has these properties directly, not nested in 'as any'
    if (stripeData.current_period_start && stripeData.current_period_end) {
      subRecord.current_period_start = new Date(
        stripeData.current_period_start * 1000,
      );
      subRecord.current_period_end = new Date(
        stripeData.current_period_end * 1000,
      );
    } else {
      const now = new Date();
      subRecord.current_period_start = now;
      subRecord.current_period_end = new Date(
        now.getTime() +
          (subRecord.plan_type === PlanType.MONTHLY ? 30 : 365) *
            24 *
            60 *
            60 *
            1000,
      );
      console.error(
        'Warning: current_period_start or current_period_end is missing from subscription',
      );
    }

    // Define plan features based on plan type
    const planFeatures = {
      [PlanType.MONTHLY]: [
        {
          feature_name: 'Unlimited Widgets',
          description: 'Create unlimited widgets',
        },
        {
          feature_name: '10 Workspaces',
          description: 'Manage up to 10 workspaces',
        },
        {
          feature_name: 'Priority Support',
          description: '24/7 priority support',
        },
        {
          feature_name: 'Advanced Analytics',
          description: 'Detailed analytics and insights',
        },
      ],
      [PlanType.YEARLY]: [
        {
          feature_name: 'Unlimited Widgets',
          description: 'Create unlimited widgets',
        },
        {
          feature_name: '10 Workspaces',
          description: 'Manage up to 10 workspaces',
        },
        {
          feature_name: 'Priority Support',
          description: '24/7 priority support',
        },
        {
          feature_name: 'Advanced Analytics',
          description: 'Detailed analytics and insights',
        },
      ],
    };

    // Store plan features
    subRecord.plan_features = planFeatures[subRecord.plan_type];

    // Store plan features from product metadata (optional - as fallback)
    if (product.metadata && product.metadata.features) {
      try {
        subRecord.plan_features = JSON.parse(product.metadata.features);
      } catch (e) {
        console.error('Error parsing product features:', e);
      }
    }

    await this.subscriptionRepository.save(subRecord);
    console.log(` Subscription for user ${userId} has been activated.`);
  }

  async createPortalSession(userId: string) {
    const FRONTEND_URL = this.configService.get<string>(
      'FRONTEND_URL',
    );
    const billingUrl = this.configService.get<string>('FRONTEND_BILLING_URL');

    if (!FRONTEND_URL) {
      throw new Error('Frontend URLs are missing in env');
    }
    console.log('Creating portal session for user:', userId);

    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      relations: ['user'],
    });

    console.log('Subscription found:', subscription);

    if (!subscription) {
      throw new NotFoundException(
        'No active subscription found for this user.',
      );
    }

    // Stripe user
    if (subscription.stripe_customer_id) {
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${FRONTEND_URL}/app/dashboard`,
      });

      console.log('portalSession.url :: ', portalSession.url);
      return { url: portalSession.url };
    }

    // PayPal user
    if (subscription.paypal_subscription_id) {
      return { url: `${FRONTEND_URL}/app/billing` };
    }

    throw new NotFoundException('No active subscription found for this user.');
  }

  async createPaypalOrder(planType: PlanType) {
    // Define your plan amounts
    const amounts = {
      [PlanType.MONTHLY]: 9.99,
      [PlanType.YEARLY]: 99.99,
    };

    const amount = amounts[planType];

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
          description: `${planType} Subscription Plan`,
        },
      ],
    });

    const order = await this.paypalClient.execute(request);
    return { orderID: order.result.id };
  }

  async activatePaypalSubscription(
    subscriptionID: string,
    userId: string,
    planType: PlanType,
  ) {
    let sub = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.error(`Webhook Error: User not found with id ${userId}`);
      return;
    }
    if (!sub) {
      sub = new Subscription();

      sub.user = user;
    }

    // -------- CLEAR STRIPE DATA --------
    sub.stripe_customer_id = null;
    sub.stripe_subscription_id = null;
    sub.current_period_start = null;
    sub.current_period_end = null;

    // Define plan amounts and features
    const planDetails = {
      [PlanType.MONTHLY]: {
        amount: 15,
        currency: 'USD',
        features: [
          {
            feature_name: 'Unlimited Widgets',
            description: 'Create unlimited widgets',
          },
          {
            feature_name: '10 Workspaces',
            description: 'Manage up to 10 workspaces',
          },
          {
            feature_name: 'Priority Support',
            description: '24/7 priority support',
          },
          {
            feature_name: 'Advanced Analytics',
            description: 'Detailed analytics and insights',
          },
        ],
      },
      [PlanType.YEARLY]: {
        amount: 40,
        currency: 'USD',
        features: [
          {
            feature_name: 'Unlimited Widgets',
            description: 'Create unlimited widgets',
          },
          {
            feature_name: '10 Workspaces',
            description: 'Manage up to 10 workspaces',
          },
          {
            feature_name: 'Priority Support',
            description: '24/7 priority support',
          },
          {
            feature_name: 'Advanced Analytics',
            description: 'Detailed analytics and insights',
          },
        ],
      },
    };
    const plan = planDetails[planType];

    sub.paypal_subscription_id = subscriptionID;
    sub.plan_type = planType;
    sub.status = SubscriptionStatus.INCOMPLETE; // Will be confirmed by webhook
    sub.amount = plan.amount;
    sub.currency = plan.currency;
    sub.plan_features = plan.features;
    await this.subscriptionRepository.save(sub);

    return {
      message: 'Subscription saved, awaiting PayPal webhook confirmation',
    };
  }

  async capturePaypalOrder(
    orderID: string,
    userId: string,
    planType: PlanType,
  ) {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await this.paypalClient.execute(request);
    const result = capture.result;

    // Find User
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find or Create Subscription Entry
    let subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!subscription) {
      subscription = new Subscription();
      subscription.user = user;
    }

    // Define plan amounts and features
    const planDetails = {
      [PlanType.MONTHLY]: {
        amount: 15,
        features: [
          {
            feature_name: 'Unlimited Widgets',
            description: 'Create unlimited widgets',
          },
          {
            feature_name: '10 Workspaces',
            description: 'Manage up to 10 workspaces',
          },
          {
            feature_name: 'Priority Support',
            description: '24/7 priority support',
          },
          {
            feature_name: 'Advanced Analytics',
            description: 'Detailed analytics and insights',
          },
        ],
      },
      [PlanType.YEARLY]: {
        amount: 40,
        features: [
          {
            feature_name: 'Unlimited Widgets',
            description: 'Create unlimited widgets',
          },
          {
            feature_name: '10 Workspaces',
            description: 'Manage up to 10 workspaces',
          },
          {
            feature_name: 'Priority Support',
            description: '24/7 priority support',
          },
          {
            feature_name: 'Advanced Analytics',
            description: 'Detailed analytics and insights',
          },
        ],
      },
    };

    const plan = planDetails[planType];

    // Extract PayPal Fields
    const paypalSubscriptionId = result.id;
    const paypalPlanId =
      result.purchase_units?.[0]?.payments?.captures?.[0]?.supplementary_data
        ?.related_ids?.order_id || null;
    const payerEmail = result.payer?.email_address || null;

    // Save Data to DB
    subscription.paypal_subscription_id = paypalSubscriptionId;
    subscription.paypal_plan_id = paypalPlanId;
    subscription.paypal_payer_email = payerEmail;
    subscription.status = SubscriptionStatus.ACTIVE;

    // Store plan details
    subscription.plan_type = planType;
    subscription.amount = plan.amount;
    subscription.currency = 'USD';
    subscription.plan_features = plan.features;

    // Set billing period (example: 30 days for monthly, 365 days for yearly)
    const now = new Date();
    subscription.current_period_start = now;
    subscription.current_period_end = new Date(
      now.getTime() +
        (planType === PlanType.MONTHLY ? 30 : 365) * 24 * 60 * 60 * 1000,
    );

    await this.subscriptionRepository.save(subscription);

    console.log('PayPal Subscription Saved:', subscription);
    return result;
  }

  async getSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this user.');
    }

    // Format response with all subscription details
    const response: any = {
      id: subscription.id,
      status: subscription.status,
      plan_type: subscription.plan_type,
      amount: subscription.amount,
      currency: subscription.currency,
      plan_features: subscription.plan_features,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
      customer_email: subscription.user.email,
    };

    // If Stripe subscription
    if (
      subscription.stripe_customer_id &&
      subscription.stripe_subscription_id
    ) {
      try {
        const stripeSubResponse = await this.stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id,
        );

        const stripeSubscription = stripeSubResponse as any;

        response.provider = 'stripe';
        response.cancel_at_period_end = stripeSubscription.cancel_at_period_end;
        response.stripe_customer_id = subscription.stripe_customer_id;
        response.stripe_subscription_id = subscription.stripe_subscription_id;
      } catch (error) {
        console.error('Error fetching Stripe subscription details:', error);
        response.provider = 'stripe';
        response.stripe_customer_id = subscription.stripe_customer_id;
        response.stripe_subscription_id = subscription.stripe_subscription_id;
        response.error =
          'Could not fetch full subscription details from Stripe';
      }
    }
    // If PayPal subscription
    else if (subscription.paypal_subscription_id) {
      response.provider = 'paypal';
      response.paypal_subscription_id = subscription.paypal_subscription_id;
      response.paypal_plan_id = subscription.paypal_plan_id;
      response.paypal_payer_email = subscription.paypal_payer_email;
    } else {
      throw new NotFoundException(
        'No payment method found for this subscription.',
      );
    }

    return response;
  }

  private async validateOrResetUserSubscription(userId: string) {
    const existing = await this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!existing) return; // No subscription → allow create new

    // If subscription still active → block
    if (existing.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'You already have an active subscription. You can purchase a new plan after it expires or is cancelled.',
      );
    }

    // If subscription expired or canceled → delete it
    if (
      existing.status === SubscriptionStatus.CANCELED ||
      existing.status === SubscriptionStatus.INCOMPLETE
    ) {
      console.log('Deleting old subscription for user:', userId);
      await this.subscriptionRepository.remove(existing);
    }
  }

  async getActiveOrRecentSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      relations: ['user'],
    });

    // If no subscription found, return simple structure for frontend
    if (!subscription) {
      return { subscription: null };
    }

    return { subscription: subscription.status };
  }

  async getCancelSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.CANCELED },
      relations: ['user'],
    });

    // If no subscription found, return simple structure for frontend
    if (!subscription) {
      return { subscription: null };
    }

    return { subscription: subscription.status };
  }
}
