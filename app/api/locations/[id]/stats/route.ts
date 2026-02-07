/**
 * Location Stats API - Enhanced with Redis Caching
 * Real-time metrics for individual locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/lib/rbac/middleware';
import { Permission } from '@/lib/rbac/permissions';
import prisma from '@/lib/db';
import { cache } from '@/lib/cache/redis-client';
import { inventoryCache } from '@/lib/cache/inventory-cache';
import { startOfDay, endOfDay, subDays } from 'date-fns';

/**
 * GET /api/locations/[id]/stats
 * Get location-specific metrics with caching
 */
export const GET = withPermissions(
  [Permission.REPORTS_VIEW],
  async (request: NextRequest, { params, user }: any) => {
    const locationId = params.id;
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('days') || '7');

    // Verify location belongs to user's restaurant
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        restaurantId: user.restaurantId!
      }
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Try cache first
    const cacheKey = `location:${locationId}:stats:${period}d`;
    const cached = await cache.get<any>(cacheKey);

    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true
      });
    }

    const startDate = subDays(new Date(), period);

    // Today's stats
    const today = new Date();
    const todayStats = await prisma.order.aggregate({
      where: {
        locationId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    // Staff count
    const staffCount = await prisma.user.count({
      where: { locationId }
    });

    // Active tables
    const activeTables = await prisma.table.count({
      where: {
        locationId,
        status: 'OCCUPIED'
      }
    });

    // Get inventory from cache
    const inventory = await inventoryCache.getLocationInventory(locationId);
    const lowStockCount = inventory.filter(item =>
      item.batches?.some(batch => Number(batch.quantityRemaining) <= 10)
    ).length;

    const stats = {
      location,
      today: {
        revenue: todayStats._sum.totalAmount || 0,
        orders: todayStats._count
      },
      staff: staffCount,
      tables: {
        active: activeTables
      },
      inventory: {
        totalItems: inventory.length,
        lowStockItems: lowStockCount
      }
    };

    // Cache for 1 minute
    await cache.set(cacheKey, stats, 60);

    return NextResponse.json({
      ...stats,
      cached: false
    });
  }
);
