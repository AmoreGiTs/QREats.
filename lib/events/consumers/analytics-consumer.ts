/**
 * Analytics Consumer
 * Processes domain events to update real-time analytics dashboards
 */

import { BaseConsumer } from '../consumer';
import { BaseEvent, EventType, TOPICS } from '../types';
import { cache } from '@/lib/cache/redis-client';

export class AnalyticsConsumer extends BaseConsumer {
    protected groupId = 'analytics-service';
    protected topics = [TOPICS.ORDERS, TOPICS.INVENTORY];

    /**
     * Process incoming events for analytics
     */
    protected async processEvent(event: BaseEvent): Promise<void> {
        const { type, restaurantId, locationId, data } = event;

        switch (type) {
            case EventType.ORDER_CREATED:
                await this.updateOrderMetrics(restaurantId, locationId, data);
                break;

            case EventType.INVENTORY_LOW_STOCK:
                await this.handleLowStockAlert(restaurantId, locationId, data);
                break;

            default:
                console.log(`ℹ️ Analytics ignoring event type: ${type}`);
        }
    }

    /**
     * Update real-time order metrics in Redis
     */
    private async updateOrderMetrics(restaurantId: string, locationId: string | undefined, order: any) {
        const today = new Date().toISOString().split('T')[0];
        const baseKey = `metrics:${restaurantId}`;
        const keys = [
            `${baseKey}:today:revenue`,
            `${baseKey}:today:orders`
        ];

        if (locationId) {
            keys.push(`${baseKey}:location:${locationId}:today:revenue`);
            keys.push(`${baseKey}:location:${locationId}:today:orders`);
        }

        try {
            const pipeline = (cache as any).redis.pipeline();

            // Update global restaurant metrics
            pipeline.incrbyfloat(`${baseKey}:today:revenue`, order.totalAmount);
            pipeline.incr(`${baseKey}:today:orders`);

            // Update location specific metrics if present
            if (locationId) {
                pipeline.incrbyfloat(`${baseKey}:location:${locationId}:today:revenue`, order.totalAmount);
                pipeline.incr(`${baseKey}:location:${locationId}:today:orders`);
            }

            await pipeline.exec();

            // Publish event for real-time frontend updates (Socket.IO or SSE)
            await cache.publish(`metrics:${restaurantId}:updates`, {
                type: 'METRICS_UPDATED',
                timestamp: new Date().toISOString()
            });

            console.log(`📈 Metrics updated for restaurant ${restaurantId}`);
        } catch (error) {
            console.error('❌ Failed to update metrics in Redis:', error);
        }
    }

    /**
     * Handle low stock alerts
     */
    private async handleLowStockAlert(restaurantId: string, locationId: string | undefined, data: any) {
        // In a real system, this might push to a specialized low-stock dashboard or trigger a notification
        console.log(`⚠️ Low stock alert for restaurant ${restaurantId}:`, data);
    }
}

export const analyticsConsumer = new AnalyticsConsumer();
