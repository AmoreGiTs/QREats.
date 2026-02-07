/**
 * Background Job Queue (BullMQ)
 * Provides reliable, persistent background processing for integrations and reports
 */

import { Queue, Worker, Job } from 'bullmq';
import { cache } from '@/lib/cache/redis-client';
import { accountingService } from '../integrations/accounting/adapter';
import { communicationService } from '../communications/omnichannel';

const REDIS_CONNECTION = (cache as any).redis;

// Queues
export const syncQueue = new Queue('sync-queue', { connection: REDIS_CONNECTION });
export const commsQueue = new Queue('comms-queue', { connection: REDIS_CONNECTION });

/**
 * Worker Logic
 */
new Worker('sync-queue', async (job: Job) => {
    const { type, data } = job.data;

    console.log(`[Worker] Processing sync job: ${type}`);

    switch (type) {
        case 'ACCOUNTING_SYNC':
            await accountingService.syncOrder(data.restaurantId, data.orderId);
            break;
        case 'BANK_RECONCILE':
            // call plaid logic
            break;
    }
}, { connection: REDIS_CONNECTION });

new Worker('comms-queue', async (job: Job) => {
    const { customerId, payload, preferredChannel } = job.data;

    console.log(`[Worker] Processing comms job for ${customerId}`);

    await communicationService.send(customerId, payload, preferredChannel);
}, { connection: REDIS_CONNECTION });

/**
 * Helper to queue jobs
 */
export async function queueSync(type: 'ACCOUNTING_SYNC' | 'BANK_RECONCILE', data: any) {
    await syncQueue.add(`${type}_${Date.now()}`, { type, data }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    });
}

export async function queueNotification(customerId: string, payload: any, preferredChannel?: string) {
    await commsQueue.add(`notify_${customerId}_${Date.now()}`, {
        customerId,
        payload,
        preferredChannel
    });
}
