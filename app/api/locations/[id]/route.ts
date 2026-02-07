/**
 * Location Management API - Individual Location
 * Update and delete operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermissions } from '@/lib/rbac/middleware';
import { Permission } from '@/lib/rbac/permissions';
import prisma from '@/lib/db';
import { z } from 'zod';

const UpdateLocationSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    address: z.string().min(1).optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    openingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    closingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    isActive: z.boolean().optional()
});

/**
 * PATCH /api/locations/[id]
 * Update location details
 */
export const PATCH = withPermissions(
    [Permission.SETTINGS_MANAGE],
    async (request: NextRequest, { params, user }: any) => {
        const locationId = params.id;
        const body = await request.json();

        const validatedData = UpdateLocationSchema.parse(body);

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

        const updated = await prisma.location.update({
            where: { id: locationId },
            data: validatedData
        });

        return NextResponse.json({ location: updated });
    }
);

/**
 * DELETE /api/locations/[id]
 * Soft delete a location (set isActive = false)
 */
export const DELETE = withPermissions(
    [Permission.SETTINGS_MANAGE],
    async (request: NextRequest, { params, user }: any) => {
        const locationId = params.id;

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

        // Soft delete: set isActive = false
        const updated = await prisma.location.update({
            where: { id: locationId },
            data: { isActive: false }
        });

        return NextResponse.json({ location: updated });
    }
);
