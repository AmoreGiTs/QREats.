import { cache } from 'react';
import prisma from './db';
import { notFound } from 'next/navigation';

export const getRestaurantBySlug = cache(async (slug: string) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
    });

    if (!restaurant) {
        notFound();
    }

    return restaurant;
});

export const getRestaurantById = cache(async (id: string) => {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
    });

    if (!restaurant) {
        throw new Error('Restaurant not found');
    }

    return restaurant;
});
