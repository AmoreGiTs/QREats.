/**
 * Real-time Analytics Streaming Service
 * Connects Kafka event stream to WebSocket clients for live dashboard updates
 */

import { Server as SocketIOServer } from 'socket.io';
import { kafkaClient } from '../events/kafka-client';
import { TOPICS, BaseEvent, EventType } from '../events/types';
import { cache } from '../cache/redis-client';

export class AnalyticsStream {
    private io: SocketIOServer;
    private isRunning: boolean = false;

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    /**
     * Start the analytics stream consumer
     */
    async start() {
        if (this.isRunning) return;

        const consumer = await kafkaClient.getConsumer('analytics-streaming-group');
        await consumer.subscribe({
            topics: [TOPICS.ORDERS, TOPICS.PAYMENTS],
            fromBeginning: false
        });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) return;

                try {
                    const event: BaseEvent = JSON.parse(message.value.toString());

                    // 1. Update real-time metrics in Redis
                    await this.updateRealtimeMetrics(event);

                    // 2. Broadcast to connected dashboards via Socket.IO
                    this.io.to(`restaurant:${event.restaurantId}`).emit('analytics:update', {
                        topic,
                        type: event.type,
                        data: event.data,
                        timestamp: event.timestamp
                    });

                    // 3. Specific broadcast for location-based dashboards
                    if (event.locationId) {
                        this.io.to(`location:${event.locationId}`).emit('analytics:update', {
                            type: event.type,
                            data: event.data,
                            timestamp: event.timestamp
                        });
                    }
                } catch (error) {
                    console.error('Error in analytics stream processing:', error);
                }
            }
        });

        this.isRunning = true;
        console.log('⚡ Real-time Analytics Stream Started');
    }

    private async updateRealtimeMetrics(event: BaseEvent) {
        if (event.type !== EventType.ORDER_CREATED && event.type !== EventType.ORDER_PAID) return;

        const baseKey = `metrics:${event.restaurantId}`;
        const pipeline = (cache as any).redis.pipeline();

        if (event.type === EventType.ORDER_CREATED) {
            pipeline.incr(`${baseKey}:live:active_orders`);
        }

        if (event.type === EventType.ORDER_PAID) {
            pipeline.incrbyfloat(`${baseKey}:today:revenue`, event.data.totalAmount);
            pipeline.decr(`${baseKey}:live:active_orders`);
        }

        await pipeline.exec();
    }
}
