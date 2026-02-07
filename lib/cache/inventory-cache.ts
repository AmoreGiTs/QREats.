/**
 * Inventory Cache Service
 * Real-time inventory caching with Redis
 */

import { cache } from './redis-client';
import prisma from '@/lib/db';
import type { InventoryItem } from '@prisma/client';

export class InventoryCache {
    private readonly TTL = 300; // 5 minutes
    private readonly CHANNEL_PREFIX = 'inventory:';

    /**
     * Get location inventory from cache or database
     */
    async getLocationInventory(locationId: string): Promise<InventoryItem[]> {
        const cacheKey = `inventory:${locationId}`;

        // Try cache first
        const cached = await cache.get<InventoryItem[]>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const inventory = await prisma.inventoryItem.findMany({
            where: { locationId },
            include: {
                batches: {
                    where: { quantityRemaining: { gt: 0 } },
                    orderBy: { expiryDate: 'asc' }
                }
            }
        });

        // Cache the result
        await cache.set(cacheKey, inventory, this.TTL);

        return inventory;
    }

    /**
     * Update location inventory in cache
     */
    async updateLocationInventory(locationId: string, items: InventoryItem[]): Promise<void> {
        const cacheKey = `inventory:${locationId}`;
        await cache.set(cacheKey, items, this.TTL);

        // Publish update to subscribers
        await cache.publish(`${this.CHANNEL_PREFIX}${locationId}`, {
            type: 'INVENTORY_UPDATED',
            locationId,
            timestamp: new Date().toISOString(),
            itemCount: items.length
        });
    }

    /**
     * Invalidate inventory cache for location
     */
    async invalidateLocation(locationId: string): Promise<void> {
        await cache.del(`inventory:${locationId}`);

        // Notify subscribers
        await cache.publish(`${this.CHANNEL_PREFIX}${locationId}`, {
            type: 'CACHE_INVALIDATED',
            locationId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get single inventory item from cache
     */
    async getItem(itemId: string): Promise<InventoryItem | null> {
        const cacheKey = `inventory:item:${itemId}`;

        const cached = await cache.get<InventoryItem>(cacheKey);
        if (cached) return cached;

        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId },
            include: {
                batches: {
                    where: { quantityRemaining: { gt: 0 } },
                    orderBy: { expiryDate: 'asc' }
                }
            }
        });

        if (item) {
            await cache.set(cacheKey, item, this.TTL);
        }

        return item;
    }

    /**
     * Update item quantity in cache
     */
    async updateItemQuantity(itemId: string, locationId: string, delta: number): Promise<void> {
        // Invalidate both item and location cache
        await cache.del(`inventory:item:${itemId}`);
        await cache.del(`inventory:${locationId}`);

        // Publish real-time update
        await cache.publish(`${this.CHANNEL_PREFIX}${locationId}`, {
            type: 'QUANTITY_CHANGED',
            itemId,
            locationId,
            delta,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get low stock items for location
     */
    async getLowStockItems(locationId: string, threshold: number = 10): Promise<InventoryItem[]> {
        const cacheKey = `inventory:${locationId}:low-stock`;

        const cached = await cache.get<InventoryItem[]>(cacheKey);
        if (cached) return cached;

        const items = await prisma.inventoryItem.findMany({
            where: {
                locationId,
                batches: {
                    some: {
                        quantityRemaining: { lte: threshold }
                    }
                }
            },
            include: {
                batches: {
                    where: { quantityRemaining: { gt: 0 } },
                    orderBy: { expiryDate: 'asc' }
                }
            }
        });

        // Cache for shorter duration (1 minute)
        await cache.set(cacheKey, items, 60);

        return items;
    }

    /**
     * Subscribe to inventory changes for location
     */
    subscribeToChanges(locationId: string, callback: (event: InventoryEvent) => void): void {
        cache.subscribe(`${this.CHANNEL_PREFIX}${locationId}`, callback);
    }

    /**
     * Unsubscribe from inventory changes
     */
    unsubscribeFromChanges(locationId: string): void {
        cache.unsubscribe(`${this.CHANNEL_PREFIX}${locationId}`);
    }

    /**
     * Batch update multiple items
     */
    async batchUpdate(updates: InventoryUpdate[]): Promise<void> {
        const locationIds = new Set(updates.map(u => u.locationId));

        // Invalidate all affected locations
        await Promise.all(
            Array.from(locationIds).map(locationId =>
                cache.del(`inventory:${locationId}`)
            )
        );

        // Publish batch update event
        for (const locationId of locationIds) {
            await cache.publish(`${this.CHANNEL_PREFIX}${locationId}`, {
                type: 'BATCH_UPDATE',
                locationId,
                updateCount: updates.filter(u => u.locationId === locationId).length,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get cache statistics for monitoring
     */
    async getStats(): Promise<InventoryCacheStats> {
        const stats = await cache.getStats();

        return {
            ...stats,
            inventoryKeys: await this.countInventoryKeys()
        };
    }

    private async countInventoryKeys(): Promise<number> {
        // This is a simplified version - in production, use Redis SCAN
        return 0; // Placeholder
    }
}

export interface InventoryEvent {
    type: 'INVENTORY_UPDATED' | 'QUANTITY_CHANGED' | 'CACHE_INVALIDATED' | 'BATCH_UPDATE';
    locationId: string;
    itemId?: string;
    delta?: number;
    timestamp: string;
    itemCount?: number;
    updateCount?: number;
}

export interface InventoryUpdate {
    itemId: string;
    locationId: string;
    delta: number;
}

export interface InventoryCacheStats {
    connected: boolean;
    totalKeys: number;
    hitRate: number;
    memoryUsed: number;
    inventoryKeys: number;
}

// Export singleton instance
export const inventoryCache = new InventoryCache();
