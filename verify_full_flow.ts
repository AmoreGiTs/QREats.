
import prisma from './lib/db';
import { createRestaurant } from './app/actions/onboarding';
import { deductInventoryFIFO } from './lib/inventory';
import { getFinancialStats } from './lib/reporting';

async function main() {
    console.log('🧪 Starting End-to-End Verification...');

    // 1. Mock Onboarding
    console.log('\n[1] Testing Onboarding...');
    const slug = `test-verify-${Date.now()}`;

    // We can't easily call the Server Action directly with FormData in this script
    // providing a clean manual setup instead to verify the logic "under the hood" works
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Verification Bistro',
            slug,
            primaryColor: '#000000',
        }
    });
    console.log(`✅ Restaurant Created: ${restaurant.name} (${restaurant.id})`);

    // 2. Mock Inventory Setup (FIFO)
    console.log('\n[2] Setting up Inventory (FIFO)...');
    const inventoryItem = await prisma.inventoryItem.create({
        data: {
            name: 'Test Ingredient',
            unit: 'kg',
            restaurantId: restaurant.id,
            batches: {
                create: [
                    { quantityInitial: 10, quantityRemaining: 10, costPerUnit: 5.00 }, // Batch A (Oldest)
                    { quantityInitial: 10, quantityRemaining: 10, costPerUnit: 10.00 } // Batch B (Newer)
                ]
            }
        },
        include: { batches: true }
    });
    console.log(`✅ Inventory Created with 2 batches (Cost $5 vs $10)`);

    // 3. Mock Menu Item
    console.log('\n[3] Creating Menu Item...');
    const menuItem = await prisma.menuItem.create({
        data: {
            name: 'Test Dish',
            price: 20.00,
            restaurantId: restaurant.id,
            recipe: {
                create: {
                    inventoryItemId: inventoryItem.id,
                    quantityRequired: 15
                }
            }
        }
    });
    console.log(`✅ Menu Item Created: ${menuItem.name} (Requires 15kg)`);

    // 4. Place Order & Trigger FIFO Logic
    console.log('\n[4] Placing Order (Testing FIFO)...');
    // Logic: 15kg needed. Should take ALL 10kg from Batch A ($5) and 5kg from Batch B ($10).
    // Expected COGS: (10 * 5) + (5 * 10) = 50 + 50 = $100.

    const order = await prisma.order.create({
        data: {
            restaurantId: restaurant.id,
            status: 'COMPLETED',
            totalAmount: menuItem.price,
            items: {
                create: {
                    menuItemId: menuItem.id,
                    quantity: 1,
                    priceAtOrder: menuItem.price
                }
            }
        }
    });

    // Manually trigger the deduction logic (usually handled by action)
    await deductInventoryFIFO(
        inventoryItem.id,
        15,
        undefined,
        order.id
    );

    // Verify Batches
    const updatedBatches = await prisma.inventoryBatch.findMany({
        where: { inventoryItemId: inventoryItem.id },
        orderBy: { receivedAt: 'asc' }
    });

    const batchA = updatedBatches[0];
    const batchB = updatedBatches[1];

    console.log(`   Batch A Remaining: ${batchA.quantityRemaining} (Expected 0)`);
    console.log(`   Batch B Remaining: ${batchB.quantityRemaining} (Expected 5)`);

    if (batchA.quantityRemaining.toNumber() === 0 && batchB.quantityRemaining.toNumber() === 5) {
        console.log('✅ FIFO Deduction Accurate');
    } else {
        console.error('❌ FIFO Logic Failed');
        process.exit(1);
    }

    // 5. Verify Financial Analytics (COGS)
    console.log('\n[5] Verifying Analytics (Real-time COGS)...');
    const stats = await getFinancialStats(restaurant.id);

    console.log(`   Revenue: $${stats.revenue} (Expected $20)`);
    console.log(`   COGS: $${stats.cogs} (Expected $100)`); // Loss leader!
    console.log(`   Profit: $${stats.profit} (Expected -$80)`);

    if (stats.cogs === 100) {
        console.log('✅ Analytics Calculation Accurate');
    } else {
        console.error('❌ Analytics Failed');
        process.exit(1);
    }

    console.log('\n🎉 ALL SYSTEMS GO. Verification Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
