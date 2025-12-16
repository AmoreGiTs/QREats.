'use server';

import prisma from '@/lib/db';
import { deductInventoryFIFO, restockInventoryForRefund } from '@/lib/inventory';
import { revalidatePath } from 'next/cache';

export type CreateOrderInput = {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
};

export async function createOrder(input: CreateOrderInput) {
    const { restaurantId, items, totalAmount } = input;

    try {
        // Transaction ensures inventory is deducted ONLY if order is created successfully
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create the Order Record
            const newOrder = await tx.order.create({
                data: {
                    restaurantId,
                    totalAmount,
                    status: 'PENDING',
                    items: {
                        create: items.map((item) => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            priceAtOrder: item.price,
                        })),
                    },
                },
            });

            // 2. Deduct Inventory for each item
            for (const item of items) {
                // Find recipes for this menu item to know what inventory to deduct
                const recipes = await tx.recipe.findMany({
                    where: { menuItemId: item.menuItemId },
                });

                for (const recipe of recipes) {
                    const qtyToDeduct = recipe.quantityRequired.mul(item.quantity).toNumber();

                    // Use our FIFO logic, passing the transaction client
                    await deductInventoryFIFO(
                        recipe.inventoryItemId,
                        qtyToDeduct,
                        tx,
                        newOrder.id
                    );
                }
            }

            return newOrder;
        });

        revalidatePath(`/${restaurantId}/orders`);
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error('Order creation failed:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}

export async function refundOrder(orderId: string, restaurantId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Verify Order exists and is not already refunded
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) throw new Error('Order not found');
            if (order.status === 'REFUNDED') throw new Error('Order already refunded');

            // 2. Update Order Status
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'REFUNDED' },
            });

            // 3. Create Refund Record
            await tx.refund.create({
                data: {
                    orderId,
                    amount: order.totalAmount,
                    reason: 'Full Refund',
                },
            });

            // 4. Restock Inventory
            // This looks up all 'DEDUCT' transactions for this order and reverses them
            await restockInventoryForRefund(orderId, tx);

            return order;
        });

        revalidatePath(`/${restaurantId}/orders`);
        return { success: true, orderId: result.id };
    } catch (error: any) {
        console.error('Refund failed:', error);
        return { success: false, error: error.message || 'Failed to process refund' };
    }
}
