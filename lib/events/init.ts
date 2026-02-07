/**
 * Event Infrastructure Initialization
 * Registers and starts all domain event consumers
 */

import { analyticsConsumer } from './consumers/analytics-consumer';

export async function initEventInfrastructure() {
    if (process.env.ENABLE_KAFKA_EVENTS !== 'true') {
        console.log('ℹ️ Kafka Events are disabled (ENABLE_KAFKA_EVENTS != true)');
        return;
    }

    try {
        console.log('🚀 Initializing Event Infrastructure...');

        // Start consumers
        await Promise.all([
            analyticsConsumer.start(),
            // Add other consumers here as they are implemented
        ]);

        console.log('✅ Event Infrastructure Initialized Successfully');
    } catch (error) {
        console.error('❌ Failed to initialize event infrastructure:', error);
    }
}
