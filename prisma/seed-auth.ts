import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create demo restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'demo-restaurant' },
        update: {},
        create: {
            slug: 'demo-restaurant',
            name: 'Demo Restaurant',
        },
    });

    // Create admin user
    const hashedPassword = await hash('demopassword123', 12);

    await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            name: 'Demo Admin',
            passwordHash: hashedPassword,
            role: 'OWNER',
            restaurantId: restaurant.id,
            emailVerified: new Date(),
        },
    });

    console.log('✅ Created demo restaurant and admin user');
    console.log('   Restaurant Slug:', restaurant.slug);
    console.log('   Admin Email: admin@demo.com');
    console.log('   Password: demopassword123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
