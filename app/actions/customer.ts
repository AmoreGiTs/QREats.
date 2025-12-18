'use server';

import prisma from '@/lib/db';
import { deductInventoryFIFO } from '@/lib/inventory';
import { revalidatePath } from 'next/cache';

import { PlaceCustomerOrderSchema } from '@/lib/validations';

export async function placeCustomerOrder(
    slug: string,
    tableId: string | number,
    items: { menuItemId: string; quantity: number; price: number }[]
) {
    const validation = PlaceCustomerOrderSchema.safeParse({ slug, tableId, items });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    // Re-assign explicitly to ensure type safety from validation, although args are already typed
    // const { slug: vSlug, tableId: vTableId, items: vItems } = validation.data;
    try {
        const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
        if (!restaurant) throw new Error("Restaurant not found");

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Transaction: Create Order -> Deduct Inventory
        // Note: For M-Pesa, we might want to creating Order as 'PAYMENT_PENDING' first, 
        // and only deduct inventory after callback. 
        // BUT for MVP/Optimistic, let's reserve inventory or deduct.
        // Let's go with 'PAYMENT_PENDING' and deduct immediately to prevent overselling?
        // Or deduct on confirmation.
        // Enterprise Strategy: Reserve Inventory (DEDUCT now), if payment fails, RESTOCK.

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    restaurantId: restaurant.id,
                    totalAmount,
                    status: 'PAYMENT_PENDING', // Waiting for M-Pesa
                    items: {
                        create: items.map(item => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            priceAtOrder: item.price
                        }))
                    },
                    payments: {
                        create: {
                            amount: totalAmount,
                            method: 'MPESA',
                            status: 'PENDING',
                            metadata: JSON.stringify({ tableId })
                        }
                    }
                }
            });

            // FIFO Deduction (Optimistic Reservation)
            for (const item of items) {
                const recipes = await tx.recipe.findMany({
                    where: { menuItemId: item.menuItemId }
                });

                for (const recipe of recipes) {
                    await deductInventoryFIFO(
                        recipe.inventoryItemId,
                        recipe.quantityRequired.mul(item.quantity).toNumber(),
                        tx,
                        newOrder.id
                    );
                }
            }

            return newOrder;
        });

        // In a real app, here we would trigger M-Pesa STK Push
        // await initiateSTKPush(order.id, phoneNumber);

        revalidatePath(`/${slug}/admin`);
        revalidatePath(`/${slug}/kitchen`); // Propagate to KDS if we want them to prepare immediately (or wait for payment)

        return { success: true, orderId: order.id };

    } catch (error) {
        console.error("Customer Order Failed:", error);
        return { success: false, error: 'Failed to place order.' };
    }
}
