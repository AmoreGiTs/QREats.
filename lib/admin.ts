'use server';

import prisma from '@/lib/db';
import { getRestaurantBySlug } from '@/lib/tenant';

export async function getAdminData(slug: string) {
    const restaurant = await getRestaurantBySlug(slug);

    const orders = await prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        include: {
            items: { include: { menuItem: true } },
            refunds: true
        },
        orderBy: { createdAt: 'desc' },
    });

    const inventory = await prisma.inventoryItem.findMany({
        where: { restaurantId: restaurant.id },
        include: { batches: true },
    });

    return { restaurant, orders, inventory };
}
