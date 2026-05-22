import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalProvider {
  private client: any;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('PayPal Client ID or Secret is not defined in environment variables.');
    }

    // Creating a sandbox environment
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  getClient() {
    return this.client;
  }

  async createOrder(amount: number) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD', // Set currency to USD
          value: amount.toString(),
        }
      }]
    });

    try {
      const response = await this.client.execute(request);
      return { orderID: response.result.id };
    } catch (err) {
      console.error("Error creating PayPal order:", err);
      throw err;
    }
  }

  async captureOrder(orderID: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (err) {
      console.error("Error capturing PayPal order:", err);
      throw err;
    }
  }
}

