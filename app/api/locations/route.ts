/**
 * Location Management API
 * CRUD operations for restaurant locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, requireRestaurantAccess } from '@/lib/rbac/middleware';
import { Permission } from '@/lib/rbac/permissions';
import prisma from '@/lib/db';
import { z } from 'zod';

const LocationSchema = z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1),
    phone: z.string().optional(),
    timezone: z.string().default('Africa/Nairobi'),
    openingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    closingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    isActive: z.boolean().default(true)
});

/**
 * GET /api/locations
 * List all locations for a restaurant
 */
export const GET = withPermissions(
    [Permission.SETTINGS_VIEW],
    async (request: NextRequest, { user }) => {
        const { searchParams } = new URL(request.url);
        const restaurantId = user.restaurantId!;

        const includeInactive = searchParams.get('includeInactive') === 'true';

        const locations = await prisma.location.findMany({
            where: {
                restaurantId,
                ...(includeInactive ? {} : { isActive: true })
            },
            include: {
                _count: {
                    select: {
                        tables: true,
                        staff: true,
                        inventoryItems: true,
                        orders: {
                            where: {
                                createdAt: {
                                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ locations });
    }
);

/**
 * POST /api/locations
 * Create a new location
 */
export const POST = withPermissions(
    [Permission.SETTINGS_MANAGE],
    async (request: NextRequest, { user }) => {
        const restaurantId = user.restaurantId!;
        const body = await request.json();

        const validatedData = LocationSchema.parse(body);

        const location = await prisma.location.create({
            data: {
                ...validatedData,
                restaurantId
            }
        });

        return NextResponse.json({ location }, { status: 201 });
    }
);
