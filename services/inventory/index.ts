/**
 * Inventory Microservice
 * High-performance inventory management with Redis caching and Kafka event sourcing
 */

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { inventoryCache } from '../../lib/cache/inventory-cache';
import { eventProducer } from '../../lib/events/producer';
import { EventType } from '../../lib/events/types';

const app = express();
const prisma = new PrismaClient();
const port = process.env.INVENTORY_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

// GET /inventory/location/:locationId
app.get('/inventory/location/:locationId', async (req, res) => {
    const { locationId } = req.params;

    try {
        const inventory = await inventoryCache.getLocationInventory(locationId);
        res.json({ data: inventory });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /inventory/deduct
app.post('/inventory/deduct', async (req, res) => {
    const { itemId, locationId, quantity, restaurantId, orderId } = req.body;

    try {
        // In a real microservice, we would use a more sophisticated transaction or event sourcing
        // For now, we reuse the existing logic and emit events

        // Update cache immediately for optimistic UI
        await inventoryCache.updateItemQuantity(itemId, locationId, -quantity);

        // Emit event for data consistency across other services
        await eventProducer.publishInventoryEvent(EventType.INVENTORY_DEDUCTED, {
            itemId,
            locationId,
            quantity,
            orderId,
            timestamp: new Date().toISOString()
        }, restaurantId, locationId);

        res.json({ success: true, message: 'Inventory deduction event emitted' });
    } catch (error) {
        console.error('Error deducting inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Inventory Service running on http://localhost:${port}`);
});
