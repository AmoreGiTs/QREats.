/**
 * Cache Statistics API
 * Monitor Redis cache performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/lib/rbac/middleware';
import { Permission } from '@/lib/rbac/permissions';
import { cache } from '@/lib/cache/redis-client';
import { inventoryCache } from '@/lib/cache/inventory-cache';

/**
 * GET /api/cache/stats
 * Get cache performance metrics
 */
export const GET = withPermissions(
    [Permission.SETTINGS_VIEW],
    async (request: NextRequest) => {
        try {
            const [cacheStats, inventoryStats] = await Promise.all([
                cache.getStats(),
                inventoryCache.getStats()
            ]);

            return NextResponse.json({
                cache: cacheStats,
                inventory: inventoryStats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching cache stats:', error);
            return NextResponse.json(
                { error: 'Failed to fetch cache statistics' },
                { status: 500 }
            );
        }
    }
);

/**
 * DELETE /api/cache/stats
 * Clear cache (admin only)
 */
export const DELETE = withPermissions(
    [Permission.SETTINGS_MANAGE],
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const pattern = searchParams.get('pattern') || '*';

            await cache.invalidate(pattern);

            return NextResponse.json({
                success: true,
                message: `Cache cleared for pattern: ${pattern}`
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
            return NextResponse.json(
                { error: 'Failed to clear cache' },
                { status: 500 }
            );
        }
    }
);
