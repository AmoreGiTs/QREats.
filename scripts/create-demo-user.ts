import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const restaurant = await prisma.restaurant.findUnique({ where: { slug: 'demo' } });
    if (!restaurant) {
        console.error('Restaurant not found');
        return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            passwordHash: hashedPassword,
            name: 'Demo Admin',
            role: 'OWNER',
            restaurantId: restaurant.id,
        },
    });

    console.log('User created:', user.email);
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
