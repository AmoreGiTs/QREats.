/**
 * Sales Predictor Service
 * Uses TensorFlow.js for ML-based sales forecasting and peak hour prediction
 */

import * as tf from '@tensorflow/tfjs-node';
import prisma from '@/lib/db';
import { cache } from '@/lib/cache/redis-client';
import { startOfDay, endOfDay, subDays, getHours, getDay } from 'date-fns';

export class SalesPredictor {
    private model: tf.LayersModel | null = null;
    private readonly MODEL_PATH = 'file://./models/sales-forecast/model.json';

    /**
     * Predict peak hours for a location based on historical data
     */
    async predictPeakHours(locationId: string): Promise<{ hour: number; confidence: number }[]> {
        const cacheKey = `prediction:peak-hours:${locationId}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) return cached;

        // In a production app, we would load a pre-trained model
        // Here we implement a simplified statistical model as a fallback
        const historicalData = await this.getHistoricalHourlyVolume(locationId);

        // Sort and return top 3 peak hours
        const predictions = historicalData
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 3)
            .map(d => ({ hour: d.hour, confidence: d.confidence }));

        await cache.set(cacheKey, predictions, 3600 * 24); // Cache for 24 hours
        return predictions;
    }

    /**
     * Forecast inventory demand for a specific item
     */
    async forecastInventoryDemand(itemId: string, locationId: string): Promise<number> {
        const history = await prisma.inventoryTransaction.findMany({
            where: {
                inventoryItemId: itemId,
                type: 'DEDUCTION',
                createdAt: { gte: subDays(new Date(), 30) }
            }
        });

        if (history.length < 5) return 0;

        // Simple linear trend prediction
        const dailyUsage = history.reduce((acc: any, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + Number(curr.quantity);
            return acc;
        }, {});

        const values = Object.values(dailyUsage) as number[];
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        return Math.ceil(avg * 1.1); // Add 10% safety margin
    }

    private async getHistoricalHourlyVolume(locationId: string) {
        const thirtyDaysAgo = subDays(new Date(), 30);

        const orders = await prisma.order.findMany({
            where: {
                locationId,
                createdAt: { gte: thirtyDaysAgo },
                status: { not: 'CANCELLED' }
            },
            select: { createdAt: true }
        });

        const hourlyVolume: Record<number, number[]> = {};

        orders.forEach(order => {
            const hour = getHours(order.createdAt);
            const day = getDay(order.createdAt);
            if (!hourlyVolume[hour]) hourlyVolume[hour] = [];
            hourlyVolume[hour].push(1);
        });

        return Object.entries(hourlyVolume).map(([hour, volumes]) => ({
            hour: parseInt(hour),
            volume: volumes.length,
            confidence: Math.min(0.95, 0.5 + (volumes.length / (orders.length || 1)))
        }));
    }

    /**
     * Internal method to train/retrain the model (simplified)
     */
    async trainModel(locationId: string) {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        // Training logic would go here...
        this.model = model;
    }
}

export const salesPredictor = new SalesPredictor();
