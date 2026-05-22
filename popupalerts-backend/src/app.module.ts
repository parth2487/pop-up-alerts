import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService sudah diimpor
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer'; // MailerModule sudah diimpor
// import { mailerConfig } from './config/mailer.config'; // Tidak perlu lagi jika inline

// Impor semua modul fitur Anda
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WidgetsModule } from './widgets/widgets.module';
import { BillingModule } from './billing/billing.module';
import { LeadsModule } from './leads/leads.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaypalModule } from './paypal/paypal.module';
import { AdminModule } from './admin/admin.module';

// Impor SEMUA entitas Anda
import { User } from './users/entities/user.entity';
import { Subscription } from './users/entities/subscription.entity';
import { Workspace } from './workspaces/entities/workspace.entity';
import { Widget } from './widgets/entities/widget.entity';
import { Lead } from './leads/entities/lead.entity';
import { Review } from './reviews/entities/review.entity';
import { Feedback } from './feedback/entities/feedback.entity';
import { NewsletterModule } from './newsletter/newsletter.module';
import { Newsletter } from './newsletter/entities/newsletter.entity';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ContactUs } from './contact-us/entity/contact-us.entity';
import { WorkspaceLeadModule } from './workspace-lead/workspace-lead.module';
import { WorkspaceLead } from './workspace-lead/entity/lead.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }), // ConfigModule sudah ada

    // --- BAGIAN MAILERMODULE YANG DIPERBARUI ---
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Tetap impor ConfigModule
      // Ganti useFactory lama dengan yang ini:
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'), // Baca dari env
          port: configService.get<number>('MAIL_PORT'), // Baca dari env
          secure: configService.get<boolean>('MAIL_SECURE'), // Baca dari env (true/false)
          auth: {
            user: configService.get<string>('MAIL_USER'), // Baca dari env
            pass: configService.get<string>('MAIL_PASSWORD'), // Baca dari env
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'), // Baca dari env
        },
        // Jika Anda pakai template, tambahkan konfigurasinya di sini
        // template: {
        //   dir: join(__dirname, '..', 'mail-templates'),
        //   adapter: new HandlebarsAdapter(),
        // },
      }),
      inject: [ConfigService], // Tetap inject ConfigService
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // serve dist/public
      serveRoot: '/',                            // serve at root
      // exclude: ['/widgets*', '/workspaces*', '/api*'], 
    }),
        
    // Konfigurasi Database yang membaca dari .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: +configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Subscription, Workspace, Widget, Lead, Review, Feedback,Newsletter,ContactUs,WorkspaceLead],
        synchronize: false,
        logging: true, // Ubah ke false di produksi jika perlu
      }),
    }),
    
    // Muat semua modul fitur Anda
    UsersModule, AuthModule, WorkspacesModule, WidgetsModule, BillingModule, 
    LeadsModule, ReviewsModule, FeedbackModule, NotificationsModule, AdminModule, 
    PaypalModule, NewsletterModule, ContactUsModule, WorkspaceLeadModule // <-- PERBAIKAN 1: Ejaan yang benar
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}