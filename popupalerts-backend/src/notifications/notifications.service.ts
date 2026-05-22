import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Lead } from 'src/leads/entities/lead.entity';
import { Widget } from 'src/widgets/entities/widget.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Widget)
        private widgetRepository: Repository<Widget>,
        private readonly mailerService: MailerService,
        private readonly httpService: HttpService,
    ) {}
    private escapeMarkdownV2(text: string): string {
        // Daftar karakter yang perlu di-escape untuk MarkdownV2 Telegram
        const charsToEscape = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
        let escapedText = text;
        for (const char of charsToEscape) {
            escapedText = escapedText.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
        }
        return escapedText;
    }
    @OnEvent('lead.created')
    async handleLeadCreated(lead: Lead) {
        const widget = await this.widgetRepository.findOne({ where: { id: lead.widget.id } });
        if (!widget) return;

        const notifications = widget.settings?.notifications;
        if (!notifications) return;

        // Cek dan kirim semua jenis notifikasi
        if (notifications.email?.enabled && notifications.email?.to) {
            await this.sendEmailNotification(notifications.email.to, lead, widget);
        }
        if (notifications.webhook?.enabled && notifications.webhook?.url) {
            await this.sendWebhookNotification(notifications.webhook.url, lead);
        }
        if (notifications.slack?.enabled && notifications.slack?.url) {
            await this.sendSlackNotification(notifications.slack.url, lead, widget);
        }
        if (notifications.discord?.enabled && notifications.discord?.url) {
            await this.sendDiscordNotification(notifications.discord.url, lead, widget);
        }
        if (notifications.telegram?.enabled && notifications.telegram?.botToken && notifications.telegram?.chatId) {
            await this.sendTelegramNotification(notifications.telegram.botToken, notifications.telegram.chatId, lead, widget);
        }
        if (notifications.teams?.enabled && notifications.teams?.url) {
            await this.sendTeamsNotification(notifications.teams.url, lead, widget);
        }
    }

    @OnEvent('auth.registered')
    async handleUserRegistered(payload: { email: string; token: string }) {
            const FRONTEND_URL = process.env.FRONTEND_URL

        const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${payload.token}`;
        const info = await this.mailerService.sendMail({
            to: payload.email,
            subject: 'Welcome to PopupAlerts! Please Verify Your Email',
            template: './verify-email',
            context: { verificationUrl },
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📧 Verification Email sent! Preview URL: ${previewUrl}`);
        }
    }

    @OnEvent('auth.reset_password')
    async handlePasswordResetRequest(payload: { email: string; token: string }) {
        const FRONTEND_URL = process.env.FRONTEND_URL

        const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${payload.token}`;
        const info = await this.mailerService.sendMail({
            to: payload.email,
            subject: 'Your PopupAlerts Password Reset Request',
            template: './reset-password',
            context: { resetUrl },
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📧 Password Reset Email sent! Preview URL: ${previewUrl}`);
        }
    }

    private async sendEmailNotification(recipient: string, lead: Lead, widget: Widget) {
        const info = await this.mailerService.sendMail({
            to: recipient,
            subject: `🚀 New Lead Captured via "${widget.name}"!`,
            template: './new-lead',
            context: {
                // leadData: JSON.stringify(lead.data, null, 2),
                leadData: JSON.stringify(lead.data, null, 2),
                widgetName: widget.name,
            },
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📧 Lead Notification Email sent! Preview URL: ${previewUrl}`);
        }
    }

    private async sendWebhookNotification(url: string, lead: Lead) {
        try {
            const payload = {
                event: 'lead.created',
                widgetId: lead.widget.id,
                leadId: lead.id,
                data: lead.data,
                timestamp: lead.created_at,
            };
            await firstValueFrom(this.httpService.post(url, payload));
            console.log('✅ Webhook sent successfully!');
        } catch (error) {
            console.error(`❌ Failed to send webhook to ${url}. Full error object:`, error);
        }
    }

    private async sendSlackNotification(url: string, lead: Lead, widget: Widget) {
        try {
            console.log(`💬 Attempting to send Slack notification to: ${url}`);
            
            // Format the message payload for Slack's Block Kit UI
            const payload = {
                text: `🚀 New Lead Captured via "${widget.name}"!`,
                blocks: [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `🚀 New Lead Captured!`
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            { "type": "mrkdwn", "text": `*Widget:*\n${widget.name}` },
                            { "type": "mrkdwn", "text": `*Date:*\n${new Date(lead.created_at).toLocaleString()}` }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Submitted Data:*"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "```" + JSON.stringify(lead.data, null, 2) + "```"
                        }
                    }
                ]
            };

            await firstValueFrom(
                this.httpService.post(url, payload)
            );

            console.log('✅ Slack notification sent successfully!');
        } catch (error) {
            console.error(`❌ Failed to send Slack notification. Full error object:`, error);
        }
    }
    private async sendDiscordNotification(url: string, lead: Lead, widget: Widget) {
        try {
            console.log(`💬 Attempting to send Discord notification to: ${url}`);
            
            // Format payload "embed" yang indah untuk Discord
            const payload = {
                content: `🚀 New Lead Captured via "${widget.name}"!`,
                embeds: [{
                    title: "Lead Details",
                    color: 0x5865F2, // Warna biru Discord
                    fields: [
                        { name: "Widget", value: widget.name, inline: true },
                        { name: "Date", value: new Date(lead.created_at).toLocaleString(), inline: true },
                        { name: "Submitted Data", value: "```json\n" + JSON.stringify(lead.data, null, 2) + "\n```" }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            };

            await firstValueFrom(
                this.httpService.post(url, payload)
            );

            console.log('✅ Discord notification sent successfully!');
        } catch (error) {
            console.error(`❌ Failed to send Discord notification. Full error object:`, error);
        }
    }
    private async sendTelegramNotification(botToken: string, chatId: string, lead: Lead, widget: Widget) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        try {
            console.log(`📲 Attempting to send Telegram notification...`);
            
            // --- PERBAIKAN UTAMA DI SINI: Gunakan fungsi escape ---
            const leadDataString = JSON.stringify(lead.data, null, 2);
            const text = `*🚀 New Lead Captured\\!*
                        \n*Widget:* ${this.escapeMarkdownV2(widget.name)}
                        \n*Date:* ${this.escapeMarkdownV2(new Date(lead.created_at).toLocaleString())}
                        \n\n*Submitted Data:*
                        \n\`\`\`json\n${this.escapeMarkdownV2(leadDataString)}\n\`\`\``;
            // ----------------------------------------------------

            const payload = {
                chat_id: chatId,
                text: text,
                parse_mode: 'MarkdownV2',
            };

            await firstValueFrom(this.httpService.post(url, payload));
            console.log('✅ Telegram notification sent successfully!');
        } catch (error) {
            console.error(`❌ Failed to send Telegram notification. Full error object:`, error.response?.data || error.message);
        }
    }
    private async sendTeamsNotification(url: string, lead: Lead, widget: Widget) {
        try {
            console.log(`💼 Attempting to send Teams notification...`);
            
            // Format "Adaptive Card" payload for Teams
            const payload = {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "type": "AdaptiveCard",
                            "body": [
                                { "type": "TextBlock", "size": "Medium", "weight": "Bolder", "text": "🚀 New Lead Captured!" },
                                { "type": "FactSet", "facts": [
                                    { "title": "Widget:", "value": widget.name },
                                    { "title": "Date:", "value": new Date(lead.created_at).toLocaleString() }
                                ]},
                                { "type": "TextBlock", "text": "Submitted Data:", "weight": "Bolder", "separator": true },
                                { "type": "TextBlock", "text": "```${JSON.stringify(lead.data, null, 2)}```", "wrap": true }
                            ],
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "version": "1.4"}
                    }
                ]
            };
            await firstValueFrom(
                this.httpService.post(url, payload)
            );

            console.log('✅ Teams notification sent successfully!');
        } catch (error: any) {
            console.error(`❌ Failed to send Teams notification. Full error object:`, error.response?.data || error.message);
        }
    }
}

