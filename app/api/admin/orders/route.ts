/**
 * API Route Protection Example
 * Demonstrates how to use RBAC middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/lib/rbac/middleware';
import { Permission } from '@/lib/rbac/permissions';
import prisma from '@/lib/db';

/**
 * GET /api/admin/orders
 * Fetch orders for admin dashboard
 * 
 * Protected by: REPORTS_VIEW permission (MANAGER+)
 */
export const GET = withPermissions(
    [Permission.REPORTS_VIEW],
    async (request: NextRequest, { user }) => {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Query is automatically filtered by restaurantId via tenant middleware
        const orders = await prisma.order.findMany({
            where: {
                ...(status && { status })
            },
            include: {
                items: { include: { menuItem: true } },
                customer: true,
                table: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        const total = await prisma.order.count({
            where: {
                ...(status && { status })
            }
        });

        return NextResponse.json({
            orders,
            total,
            hasMore: total > offset + limit
        });
    }
);

/**
 * PATCH /api/admin/orders/[id]
 * Update order status
 * 
 * Protected by: ORDER_UPDATE permission (WAITER+)
 */
export const PATCH = withPermissions(
    [Permission.ORDER_UPDATE],
    async (request: NextRequest, { user }) => {
        const { orderId, newStatus } = await request.json();

        // Tenant middleware ensures we can't update other restaurant's orders
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        return NextResponse.json({ success: true, order });
    }
);
