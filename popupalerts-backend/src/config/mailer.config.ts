
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

// Production Mailer Config using real email credentials
export const mailerConfig = async (configService: ConfigService): Promise<MailerOptions> => {

  return {
    transport: {
      host: configService.get<string>('MAIL_HOST'),   // e.g. smtp.gmail.com
      port: configService.get<number>('MAIL_PORT'),   // e.g. 587
      secure: false,                                  // true for 465, false for 587
      auth: {
        user: configService.get<string>('MAIL_USER'), // your real email
        pass: configService.get<string>('MAIL_PASS'), // your real password/app password
      },
    },
    defaults: {
      from: `"PopupAlerts No Reply" <${configService.get<string>('MAIL_FROM')}>`,
    },
    template: {
      dir: join(process.cwd(), 'src/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
