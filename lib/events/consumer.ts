/**
 * Base Event Consumer Service
 * Handles subscribing to topics and processing events with error handling
 */

import { kafkaClient } from './kafka-client';
import { BaseEvent, TOPICS } from './types';
import { EachMessageHandler, EachMessagePayload } from 'kafkajs';

export abstract class BaseConsumer {
    protected abstract groupId: string;
    protected abstract topics: string[];

    /**
     * Start the consumer and begin processing messages
     */
    async start() {
        const consumer = await kafkaClient.getConsumer(this.groupId);

        await consumer.subscribe({
            topics: this.topics,
            fromBeginning: false
        });

        await consumer.run({
            eachMessage: this.handleMessage.bind(this)
        });

        console.log(`🏃 Consumer Started: ${this.groupId} (Topics: ${this.topics.join(', ')})`);
    }

    /**
     * Internal message handler that wraps the abstract process method
     */
    private async handleMessage(payload: EachMessagePayload) {
        const { topic, partition, message } = payload;

        if (!message.value) return;

        try {
            const event: BaseEvent = JSON.parse(message.value.toString());
            console.log(`📥 Received Event: ${topic} [${event.type}] (Partition: ${partition})`);

            await this.processEvent(event);
        } catch (error) {
            console.error(`❌ Error processing Kafka message from ${topic}:`, error);
            // In production, consider sending to a Dead Letter Queue (DLQ)
        }
    }

    /**
     * Abstract method to be implemented by sub-classes to handle specific logic
     */
    protected abstract processEvent(event: BaseEvent): Promise<void>;
}
