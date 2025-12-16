import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding...');

    // 1. Create Restaurant
    // Clean up first
    try {
        await prisma.inventoryTransaction.deleteMany();
        await prisma.inventoryBatch.deleteMany();
        await prisma.recipe.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.refund.deleteMany();
        await prisma.order.deleteMany();
        await prisma.menuItem.deleteMany();
        await prisma.inventoryItem.deleteMany();
        await prisma.user.deleteMany();
        await prisma.restaurant.deleteMany();
    } catch (e) {
        console.log('Cleanup failed (might be first run):', e);
    }

    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Demo Eats',
            slug: 'demo',
            primaryColor: '#ff6600',
        },
    });

    console.log('Restaurant created:', restaurant.id);

    // 2. Create Inventory Items
    const flour = await prisma.inventoryItem.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Flour',
            unit: 'kg',
            batches: {
                create: {
                    quantityInitial: 100,
                    quantityRemaining: 100,
                    costPerUnit: 2.50, // $2.50 per kg
                },
            },
        },
    });

    const cheese = await prisma.inventoryItem.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Cheese',
            unit: 'kg',
            batches: {
                create: {
                    quantityInitial: 50,
                    quantityRemaining: 50,
                    costPerUnit: 10.00,
                },
            },
        },
    });

    console.log('Inventory created');

    // 3. Create Menu Items & Recipes
    const pizza = await prisma.menuItem.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Margherita Pizza',
            price: 15.00,
            recipe: {
                create: [
                    {
                        inventoryItemId: flour.id,
                        quantityRequired: 0.3, // 300g flour
                    },
                    {
                        inventoryItemId: cheese.id,
                        quantityRequired: 0.2, // 200g cheese
                    },
                ],
            },
        },
    });

    console.log('Menu Item created:', pizza.name);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
