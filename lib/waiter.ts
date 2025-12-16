import prisma from '@/lib/db';
import { getRestaurantBySlug } from '@/lib/tenant';

import { unstable_cache } from 'next/cache';

export const getWaiterMenu = unstable_cache(
    async (slug: string) => {
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
    },
    ['waiter-menu'], // Cache key
    { revalidate: 3600, tags: ['menu'] } // Revalidate every hour
);
