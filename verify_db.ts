
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const restaurants = await prisma.restaurant.count();
    const items = await prisma.inventoryItem.count();
    const batches = await prisma.inventoryBatch.count();
    const menuItems = await prisma.menuItem.count();

    console.log(`Restaurants: ${restaurants}`);
    console.log(`Inventory Items: ${items}`);
    console.log(`Batches: ${batches}`);
    console.log(`Menu Items: ${menuItems}`);
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
