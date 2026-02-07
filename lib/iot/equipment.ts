/**
 * IoT Equipment Monitor
 * Foundation for integrating kitchen sensors and refrigerator monitoring
 */

import { cache } from '@/lib/cache/redis-client';
import { communicationService, ChannelType } from '../communications/omnichannel';

export interface SensorData {
    equipmentId: string;
    type: 'TEMPERATURE' | 'HUMIDITY' | 'POWER';
    value: number;
    unit: string;
    timestamp: string;
}

export class EquipmentMonitor {
    private readonly REFRIGERATION_THRESHOLD = 5.0; // Celsius

    /**
     * Process incoming IoT telemetry
     */
    async processTelemetry(data: SensorData, restaurantId: string): Promise<void> {
        // 1. Log telemetry to Redis for real-time dashboarding
        const key = `iot:${restaurantId}:equipment:${data.equipmentId}:latest`;
        await cache.set(key, data, 3600);

        // 2. Check for anomalies
        if (data.type === 'TEMPERATURE' && data.value > this.REFRIGERATION_THRESHOLD) {
            await this.handleTemperatureAlert(data, restaurantId);
        }
    }

    private async handleTemperatureAlert(data: SensorData, restaurantId: string) {
        console.warn(`⚠️ ALERT: High temperature detected in ${data.equipmentId}: ${data.value}°${data.unit}`);

        // 3. Trigger alert to staff via Omnichannel platform
        // In production, we'd fetch the manager's ID
        const managerId = 'manager-id-placeholder';

        await communicationService.send(managerId, {
            content: `CRITICAL ALERT: Refrigerator ${data.equipmentId} is at ${data.value}°${data.unit}. Check immediately to prevent spoilage.`,
            recipient: '' // Handled by service
        }, ChannelType.SMS);
    }

    /**
     * Get health status for all equipment in a location
     */
    async getLocationHealth(restaurantId: string): Promise<any> {
        // In production, this would scan Redis keys or a specialized TimescaleDB
        return {
            status: 'HEALTHY',
            refrigeration: { temp: 3.2, status: 'OK' },
            powerUsage: { current: 1.2, unit: 'kW', status: 'OK' }
        };
    }
}

export const equipmentMonitor = new EquipmentMonitor();
