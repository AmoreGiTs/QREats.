import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test user...');

    // Check if test restaurant exists
    let restaurant = await prisma.restaurant.findFirst({
        where: { slug: 'test-restaurant' },
    });

    if (!restaurant) {
        // Create test restaurant
        restaurant = await prisma.restaurant.create({
            data: {
                name: 'Test Restaurant',
                slug: 'test-restaurant',
                primaryColor: '#FF6B6B',
            },
        });
        console.log('✅ Created test restaurant:', restaurant.name);
    } else {
        console.log('ℹ️  Test restaurant already exists');
    }

    // Check if test user exists
    const existingUser = await prisma.user.findFirst({
        where: { email: 'admin@test.com' },
    });

    if (!existingUser) {
        // Create test user
        const hashedPassword = await hash('password123', 12);

        const user = await prisma.user.create({
            data: {
                email: 'admin@test.com',
                passwordHash: hashedPassword,
                name: 'Test Admin',
                phone: '+254712345678',
                role: 'OWNER',
                restaurantId: restaurant.id,
            },
        });

        console.log('✅ Created test user:');
        console.log('   Email: admin@test.com');
        console.log('   Password: password123');
        console.log('   Role:', user.role);
    } else {
        console.log('ℹ️  Test user already exists');
        console.log('   Email: admin@test.com');
        console.log('   Password: password123');
    }

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
