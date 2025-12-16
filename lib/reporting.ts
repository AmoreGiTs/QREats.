import prisma from '@/lib/db';

export async function getFinancialStats(restaurantId: string) {
    // Get all completed orders
    const orders = await prisma.order.findMany({
        where: {
            restaurantId,
            status: 'COMPLETED'
        },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            recipe: {
                                include: {
                                    inventoryItem: {
                                        include: {
                                            batches: true // In real app, relate to specific transactions for exact cost
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    let totalRevenue = 0;
    let totalCOGS = 0;

    for (const order of orders) {
        totalRevenue += order.totalAmount.toNumber();

        // Calculate COGS based on recipe + average cost (simplified for demo)
        // To be 100% accurate FIFO, we'd query the InventoryTransactions for this order
        // But for a fast dashboard stats, average cost or current cost is often used for estimates.
        // Let's use the Transaction data for accuracy if possible, otherwise Estimate.

        // BETTER WAY: Query InventoryTransactions for this order.
        const txs = await prisma.inventoryTransaction.findMany({
            where: { orderId: order.id, type: 'DEDUCT' },
            include: { batch: true }
        });

        const orderCost = txs.reduce((sum, tx) => {
            // Cost = Quantity * BatchCost
            return sum + (tx.quantity.toNumber() * tx.batch.costPerUnit.toNumber());
        }, 0);

        totalCOGS += orderCost;
    }

    const grossProfit = totalRevenue - totalCOGS;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
        revenue: totalRevenue,
        cogs: totalCOGS,
        profit: grossProfit,
        margin: margin,
        orderCount: orders.length
    };
}
