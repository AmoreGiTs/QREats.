import { cache } from 'react';
import prisma from './db';
import { notFound } from 'next/navigation';

import { unstable_cache } from 'next/cache';

export const getRestaurantBySlug = unstable_cache(
    async (slug: string) => {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
        });

        if (!restaurant) {
            notFound();
        }

        return restaurant;
    },
    ['restaurant-slug'],
    { revalidate: 3600, tags: ['restaurant'] }
);

export const getRestaurantById = cache(async (id: string) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
    });

    if (!restaurant) {
        throw new Error('Restaurant not found');
    }

    return restaurant;
});
