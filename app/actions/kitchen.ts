'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string, restaurantId: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });

        revalidatePath(`/${restaurantId}/kitchen`);
        revalidatePath(`/${restaurantId}/admin`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function getKitchenOrders(slug: string) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true }
    });

    if (!restaurant) throw new Error('Restaurant not found');

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: restaurant.id,
            status: { in: ['PENDING', 'PREPARING', 'READY'] } // Active orders only
        },
        select: {
            id: true,
            status: true,
            createdAt: true,
            items: {
                select: {
                    id: true,
                    quantity: true,
                    menuItem: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'asc' } // Oldest first (FIFO display)
    });

    return { restaurant, orders };
}
