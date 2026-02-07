/**
 * Kafka Client Configuration
 * Provides singleton instance of Kafka producer and consumer
 */

import { Kafka, Producer, Consumer, KafkaConfig, SASLOptions, Partitioners } from 'kafkajs';

export class KafkaClient {
    private kafka: Kafka;
    private producer: Producer | null = null;
    private consumers: Map<string, Consumer> = new Map();
    private static instance: KafkaClient;

    private constructor() {
        const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

        const sasl: SASLOptions | undefined = process.env.KAFKA_USERNAME ? {
            mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || 'scram-sha-256',
            username: process.env.KAFKA_USERNAME,
            password: process.env.KAFKA_PASSWORD || '',
        } : undefined;

        const kafkaConfig: KafkaConfig = {
            clientId: 'qreats-app',
            brokers,
            ssl: !!process.env.KAFKA_USERNAME, // Use SSL if credentials are provided
            sasl,
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        };

        this.kafka = new Kafka(kafkaConfig);
    }

    static getInstance(): KafkaClient {
        if (!KafkaClient.instance) {
            KafkaClient.instance = new KafkaClient();
        }
        return KafkaClient.instance;
    }

    /**
     * Get or create a producer instance
     */
    async getProducer(): Promise<Producer> {
        if (!this.producer) {
            this.producer = this.kafka.producer({
                createPartitioner: Partitioners.DefaultPartitioner,
                allowAutoTopicCreation: true,
                transactionalId: 'qreats-order-service'
            });
            await this.producer.connect();
            console.log('✅ Kafka Producer connected');
        }
        return this.producer;
    }

    /**
     * Get or create a consumer instance for a specific group
     */
    async getConsumer(groupId: string): Promise<Consumer> {
        let consumer = this.consumers.get(groupId);
        if (!consumer) {
            consumer = this.kafka.consumer({ groupId });
            await consumer.connect();
            this.consumers.set(groupId, consumer);
            console.log(`✅ Kafka Consumer connected (Group: ${groupId})`);
        }
        return consumer;
    }

    /**
     * Disconnect all clients
     */
    async disconnect(): Promise<void> {
        if (this.producer) {
            await this.producer.disconnect();
        }
        for (const consumer of this.consumers.values()) {
            await consumer.disconnect();
        }
        console.log('🔌 Kafka clients disconnected');
    }
}

export const kafkaClient = KafkaClient.getInstance();
