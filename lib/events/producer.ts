/**
 * Event Producer Service
 * Handles publishing domain events to Kafka
 */

import { kafkaClient } from './kafka-client';
import { BaseEvent, EventType, TOPICS } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventProducer {
    /**
     * Publish a domain event to a specific topic
     */
    async publish(topic: string, type: EventType, data: any, restaurantId: string, locationId?: string) {
        const producer = await kafkaClient.getProducer();

        const event: BaseEvent = {
            id: uuidv4(),
            type,
            restaurantId,
            locationId,
            timestamp: new Date().toISOString(),
            version: '1.0',
            data
        };

        try {
            await producer.send({
                topic,
                messages: [
                    {
                        key: restaurantId, // Partition by restaurantId to ensure order per tenant
                        value: JSON.stringify(event),
                        headers: {
                            'event-type': type,
                            'restaurant-id': restaurantId
                        }
                    }
                ]
            });
            console.log(`📡 Event Published: ${topic} [${type}]`);
        } catch (error) {
            console.error(`❌ Failed to publish event to ${topic}:`, error);
            // In production, consider adding to a failed-event table for retry
            throw error;
        }
    }

    /**
     * Specialized method for Order Events
     */
    async publishOrderEvent(type: EventType, order: any) {
        return this.publish(TOPICS.ORDERS, type, order, order.restaurantId, order.locationId);
    }

    /**
     * Specialized method for Inventory Events
     */
    async publishInventoryEvent(type: EventType, data: any, restaurantId: string, locationId?: string) {
        return this.publish(TOPICS.INVENTORY, type, data, restaurantId, locationId);
    }
}

export const eventProducer = new EventProducer();
