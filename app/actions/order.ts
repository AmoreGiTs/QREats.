'use server';

import prisma from '@/lib/db';
import { deductInventoryFIFO, restockInventoryForRefund } from '@/lib/inventory';
import { revalidatePath } from 'next/cache';

import { CreateOrderSchema } from '@/lib/validations';

export type CreateOrderInput = {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    customer?: {
        phone: string;
        name?: string;
        email?: string;
    };
    tableId?: string;
    paymentMethod?: 'MPESA' | 'CASH' | 'CARD';
};

import { eventProducer } from '@/lib/events/producer';
import { EventType } from '@/lib/events/types';

/**
 * Unified Order Creation
 * Handles: Order creation, Inventory (FIFO), CRM, Loyalty Points, Table Management
 * All operations are atomic via Prisma transaction
 */
export async function createOrder(input: CreateOrderInput) {
    const validation = CreateOrderSchema.safeParse(input);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { restaurantId, items, totalAmount, customer, tableId, paymentMethod } = validation.data;

    try {
        // Transaction ensures ALL operations succeed or ALL fail (atomicity)
        const result = await prisma.$transaction(async (tx) => {
            // 1. CRM: Upsert Customer (find or create)
            let customerId: string | null = null;
            if (customer?.phone) {
                const upsertedCustomer = await tx.customer.upsert({
                    where: {
                        restaurantId_phone: {
                            restaurantId,
                            phone: customer.phone
                        }
                    },
                    update: {
                        name: customer.name || undefined,
                        email: customer.email || undefined,
                        lastVisitAt: new Date(),
                        visitsCount: { increment: 1 },
                    },
                    create: {
                        restaurantId,
                        phone: customer.phone,
                        email: customer.email || null,
                        name: customer.name || 'Guest',
                        lastVisitAt: new Date(),
                        visitsCount: 1,
                        loyaltyPoints: 0
                    }
                });
                customerId = upsertedCustomer.id;
            }

            // 2. Create Order Record
            const newOrder = await tx.order.create({
                data: {
                    restaurantId,
                    totalAmount,
                    status: 'PENDING',
                    customerId,
                    tableId: tableId || null,
                    paymentMethod: paymentMethod || 'CASH',
                    paymentStatus: 'PENDING',
                    items: {
                        create: items.map((item) => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            priceAtOrder: item.price,
                        })),
                    },
                },
                include: {
                    items: { include: { menuItem: true } },
                    customer: true,
                    table: true
                }
            });

            // 3. Deduct Inventory (FIFO Logic)
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

            // 4. Loyalty: Award Points (1 point per KES 100 spent)
            if (customerId) {
                const pointsAwarded = Math.floor(Number(totalAmount) / 100);
                if (pointsAwarded > 0) {
                    await tx.customer.update({
                        where: { id: customerId },
                        data: { loyaltyPoints: { increment: pointsAwarded } }
                    });

                    await tx.loyaltyTransaction.create({
                        data: {
                            customerId,
                            orderId: newOrder.id,
                            points: pointsAwarded,
                            type: 'EARNED'
                        }
                    });
                }
            }

            // 5. Table Management: Update table status
            if (tableId) {
                try {
                    await tx.table.update({
                        where: { id: tableId },
                        data: {
                            status: 'OCCUPIED'
                        }
                    });
                } catch (e) {
                    // Table update is non-critical, log but don't fail transaction
                    console.warn('Could not update table status:', e);
                }
            }

            return newOrder;
        });

        // 6. Emit Order Created Event (Async, non-blocking for the user)
        eventProducer.publishOrderEvent(EventType.ORDER_CREATED, result).catch(err => {
            console.error('Failed to emit ORDER_CREATED event:', err);
        });

        revalidatePath(`/${restaurantId}/orders`);
        return {
            success: true,
            order: result,
            orderId: result.id
        };
    } catch (error: any) {
        console.error('Order creation failed:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function refundOrder(orderId: string, restaurantId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    if (session.user.restaurantId !== restaurantId) {
        return { success: false, error: 'Unauthorized: Invalid Restaurant' };
    }

    if (!['OWNER', 'MANAGER'].includes(session.user.role)) {
        return { success: false, error: 'Unauthorized: Insufficient Permissions' };
    }

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
