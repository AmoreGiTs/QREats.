'use server';

import prisma from './db';

export async function getCustomers(restaurantId: string) {
    return await prisma.customer.findMany({
        where: { restaurantId },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            loyaltyTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            }
        },
        orderBy: { lastVisitAt: 'desc' },
    });
}

export async function getCustomerStats(restaurantId: string) {
    const totalCustomers = await prisma.customer.count({ where: { restaurantId } });
    const loyalCustomers = await prisma.customer.count({
        where: {
            restaurantId,
            loyaltyPoints: { gt: 500 }
        }
    });

    return { totalCustomers, loyalCustomers };
}
