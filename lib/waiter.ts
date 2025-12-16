import prisma from '@/lib/db';
import { getRestaurantBySlug } from '@/lib/tenant';

export async function getWaiterMenu(slug: string) {
    const restaurant = await getRestaurantBySlug(slug);

    const menuItems = await prisma.menuItem.findMany({
        where: { restaurantId: restaurant.id },
    });

    // Serialize Decimals for Client Component
    const serializedMenuItems = menuItems.map(item => ({
        ...item,
        price: item.price.toNumber(),
    }));

    return { restaurant, menuItems: serializedMenuItems };
}
