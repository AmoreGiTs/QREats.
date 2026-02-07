/**
 * Location Microservice
 * Handles location data with high performance edge-ready API
 */

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { cache } from '../../lib/cache/redis-client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.LOCATION_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[Location Service] ${req.method} ${req.url}`);
    next();
});

// GET /locations/:id
app.get('/locations/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `location:${id}`;

    try {
        // Check cache
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json({ data: cached, source: 'cache' });
        }

        // Fetch from DB
        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: { name: true, slug: true }
                }
            }
        });

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Update cache
        await cache.set(cacheKey, location, 3600); // 1 hour TTL

        res.json({ data: location, source: 'database' });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /locations/:id/tables
app.get('/locations/:id/tables', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `location:${id}:tables`;

    try {
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json({ data: cached, source: 'cache' });
        }

        const tables = await prisma.table.findMany({
            where: { locationId: id },
            orderBy: { number: 'asc' }
        });

        await cache.set(cacheKey, tables, 300); // 5 minutes TTL

        res.json({ data: tables, source: 'database' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Location Service running on http://localhost:${port}`);
});
