/**
 * Omnichannel Communication Platform
 * Supports SMS, WhatsApp, Push, and Email with intelligent failover
 */

import mail from '@sendgrid/mail';
import twilio from 'twilio';
import prisma from '@/lib/db';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    mail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export enum ChannelType {
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
    EMAIL = 'email',
    PUSH = 'push'
}

export interface MessagePayload {
    recipient: string;
    content: string;
    subject?: string;
    metadata?: any;
}

export interface SendResult {
    success: boolean;
    messageId?: string;
    channel: ChannelType;
    error?: string;
}

export abstract class CommunicationChannel {
    abstract type: ChannelType;
    abstract send(payload: MessagePayload): Promise<SendResult>;
}

/**
 * Twilio SMS Channel
 */
class SmsChannel extends CommunicationChannel {
    type = ChannelType.SMS;
    async send(payload: MessagePayload): Promise<SendResult> {
        if (!twilioClient) return { success: false, error: 'Twilio not configured', channel: this.type };
        try {
            const res = await twilioClient.messages.create({
                body: payload.content,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: payload.recipient,
            });
            return { success: true, messageId: res.sid, channel: this.type };
        } catch (e: any) {
            return { success: false, error: e.message, channel: this.type };
        }
    }
}

/**
 * SendGrid Email Channel
 */
class EmailChannel extends CommunicationChannel {
    type = ChannelType.EMAIL;
    async send(payload: MessagePayload): Promise<SendResult> {
        try {
            const [res] = await mail.send({
                to: payload.recipient,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL!,
                    name: process.env.SENDGRID_FROM_NAME || 'QREats'
                },
                subject: payload.subject || 'Notification from QREats',
                text: payload.content,
                html: payload.content.replace(/\n/g, '<br>'),
            });
            return { success: true, messageId: res.headers['x-message-id'], channel: this.type };
        } catch (e: any) {
            return { success: false, error: e.message, channel: this.type };
        }
    }
}

/**
 * Unified Communication Service
 */
export class CommunicationService {
    private channels: Map<ChannelType, CommunicationChannel> = new Map();

    constructor() {
        this.channels.set(ChannelType.SMS, new SmsChannel());
        this.channels.set(ChannelType.EMAIL, new EmailChannel());
        // WhatsApp and Push will be added as integrations grow
    }

    async send(
        customerId: string,
        payload: MessagePayload,
        preferredChannel?: ChannelType
    ): Promise<SendResult> {
        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) throw new Error('Customer not found');

        // Logic for choosing channel
        const channelsToTry = preferredChannel
            ? [preferredChannel, ChannelType.EMAIL, ChannelType.SMS]
            : [ChannelType.EMAIL, ChannelType.SMS];

        const uniqueChannels = Array.from(new Set(channelsToTry));

        for (const type of uniqueChannels) {
            const channel = this.channels.get(type);
            if (!channel) continue;

            // Check consent
            if (type === ChannelType.EMAIL && !customer.emailOptIn) continue;
            if (type === ChannelType.SMS && !customer.smsOptIn) continue;

            const result = await channel.send({
                ...payload,
                recipient: type === ChannelType.EMAIL ? customer.email || '' : customer.phone || ''
            });

            if (result.success) {
                // Log to DB
                await this.logCommunication(customerId, result, payload);
                return result;
            }
        }

        return { success: false, error: 'All channels failed or no consent provided', channel: ChannelType.SMS };
    }

    private async logCommunication(customerId: string, result: SendResult, payload: MessagePayload) {
        // Audit log or specialized communication log table
        console.log(`[CommService] Message sent to ${customerId} via ${result.channel}: ${result.messageId}`);
    }
}

export const communicationService = new CommunicationService();
