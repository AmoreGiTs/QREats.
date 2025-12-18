'use server';

import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

import { RestaurantSchema } from '@/lib/validations';

export async function createRestaurant(prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        email: formData.get('email') as string,
        primaryColor: formData.get('primaryColor') as string,
    };

    const validation = RestaurantSchema.safeParse(rawData);

    if (!validation.success) {
        return { message: validation.error.issues[0].message };
    }

    const { name, slug, email, primaryColor } = validation.data;

    try {
        const existing = await prisma.restaurant.findUnique({ where: { slug } });
        if (existing) {
            return { message: 'This URL is already taken. Please choose another.' };
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.$transaction(async (tx) => {
            // 1. Create Restaurant with initial Owner
            const restaurant = await tx.restaurant.create({
                data: {
                    name,
                    slug,
                    primaryColor,
                    users: {
                        create: {
                            email,
                            passwordHash: hashedPassword,
                            role: 'OWNER',
                        }
                    }
                },
            });

            // 2. Seed Inventory (Ingredients)
            const flour = await tx.inventoryItem.create({
                data: {
                    name: 'Pizza Dough Base',
                    unit: 'pcs',
                    restaurantId: restaurant.id,
                    batches: {
                        create: {
                            quantityInitial: 50,
                            quantityRemaining: 50,
                            costPerUnit: 0.50,
                        }
                    }
                }
            });

            const cheese = await tx.inventoryItem.create({
                data: {
                    name: 'Mozzarella Cheese',
                    unit: 'g',
                    restaurantId: restaurant.id,
                    batches: {
                        create: {
                            quantityInitial: 5000,
                            quantityRemaining: 5000,
                            costPerUnit: 0.02,
                        }
                    }
                }
            });

            const sauce = await tx.inventoryItem.create({
                data: {
                    name: 'Tomato Sauce',
                    unit: 'ml',
                    restaurantId: restaurant.id,
                    batches: {
                        create: {
                            quantityInitial: 5000,
                            quantityRemaining: 5000,
                            costPerUnit: 0.01,
                        }
                    }
                }
            });

            // 3. Seed Menu Item (Margherita Pizza)
            await tx.menuItem.create({
                data: {
                    name: 'Margherita Pizza',
                    price: 14.00,
                    restaurantId: restaurant.id,
                    recipe: {
                        create: [
                            { inventoryItemId: flour.id, quantityRequired: 1 },    // 1 base
                            { inventoryItemId: cheese.id, quantityRequired: 150 }, // 150g cheese
                            { inventoryItemId: sauce.id, quantityRequired: 100 },  // 100ml sauce
                        ]
                    }
                }
            });

            // 4. Seed Menu Item (Pepperoni Pizza) - Optional second item
            await tx.menuItem.create({
                data: {
                    name: 'Pepperoni Pizza',
                    price: 16.00,
                    restaurantId: restaurant.id,
                    recipe: {
                        create: [
                            { inventoryItemId: flour.id, quantityRequired: 1 },
                            { inventoryItemId: cheese.id, quantityRequired: 150 },
                            { inventoryItemId: sauce.id, quantityRequired: 100 },
                            // Note: We didn't create Pepperoni inventory for simplicity, reusing base/cheese/sauce logic
                        ]
                    }
                }
            });
        });

    } catch (e) {
        console.error(e);
        return { message: 'Failed to create restaurant' };
    }

    redirect(`/${slug}/admin`);
}
