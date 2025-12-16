import prisma from './db';
import { Prisma } from '@prisma/client';

export class InventoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InventoryError';
    }
}

/**
 * Deducts inventory using FIFO method.
 * Consumes from oldest batches first.
 */
export async function deductInventoryFIFO(
    inventoryItemId: string,
    quantityToDeduct: number,
    tx: Prisma.TransactionClient = prisma,
    orderId?: string
) {
    if (quantityToDeduct <= 0) throw new InventoryError('Quantity must be positive');

    // 1. Get batches with remaining quantity, sorted by receivedAt (FIFO)
    const batches = await tx.inventoryBatch.findMany({
        where: {
            inventoryItemId,
            quantityRemaining: { gt: 0 },
        },
        orderBy: { receivedAt: 'asc' },
    });

    let remainingToDeduct = new Prisma.Decimal(quantityToDeduct);

    // Check total available
    const totalAvailable = batches.reduce(
        (sum: Prisma.Decimal, b: typeof batches[0]) => sum.add(b.quantityRemaining),
        new Prisma.Decimal(0)
    );

    if (totalAvailable.lessThan(remainingToDeduct)) {
        throw new InventoryError(`Insufficient inventory. Available: ${totalAvailable}, Required: ${remainingToDeduct}`);
    }

    for (const batch of batches) {
        if (remainingToDeduct.equals(0)) break;

        const availableInBatch = batch.quantityRemaining;
        let deductFromBatch = new Prisma.Decimal(0);

        if (availableInBatch.greaterThanOrEqualTo(remainingToDeduct)) {
            // Batch has enough
            deductFromBatch = remainingToDeduct;
            remainingToDeduct = new Prisma.Decimal(0);
        } else {
            // Batch partial
            deductFromBatch = availableInBatch;
            remainingToDeduct = remainingToDeduct.minus(availableInBatch);
        }

        // Update Batch
        await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
                quantityRemaining: { decrement: deductFromBatch },
            },
        });

        // Create Transaction Record
        await tx.inventoryTransaction.create({
            data: {
                inventoryItemId,
                batchId: batch.id,
                quantity: deductFromBatch,
                type: 'DEDUCT',
                orderId: orderId ?? null, // Match schema optional
            },
        });
    }
}

/**
 * Restocks inventory for a refund.
 * Reverses the original deductions associated with an order.
 * This ensures we put items back into the correct batches (unless expired, logic omitted for MVP).
 */
export async function restockInventoryForRefund(
    orderId: string,
    tx: Prisma.TransactionClient = prisma
) {
    // 1. Find all deduction transactions for this order
    // Note: We need to link deductions to orderId when creating them. 
    // currently deductInventoryFIFO doesn't accept orderId, we should update it or handle it in the caller.
    // Assuming the caller links them or we update the schema/function. 

    // Let's rely on finding transactions linked to orderId.
    // BUT `deductInventoryFIFO` created transactions without `orderId` in the code above.
    // I need to update `deductInventoryFIFO` to accept optional `orderId`.

    const deductions = await tx.inventoryTransaction.findMany({
        where: {
            orderId: orderId,
            type: 'DEDUCT',
        },
        orderBy: { createdAt: 'desc' }, // LIFO reversal
    });

    for (const txRecord of deductions) {
        // Increment batch
        await tx.inventoryBatch.update({
            where: { id: txRecord.batchId },
            data: {
                quantityRemaining: { increment: txRecord.quantity },
            },
        });

        // Create Restock Transaction
        await tx.inventoryTransaction.create({
            data: {
                inventoryItemId: txRecord.inventoryItemId,
                batchId: txRecord.batchId,
                quantity: txRecord.quantity,
                type: 'RESTOCK',
                refundId: orderId, // Using orderId as refund group for now
            },
        });
    }
}
