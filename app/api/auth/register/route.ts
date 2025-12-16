import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { restaurantName, email, phone, password, plan } = body;

        // Validate required fields
        if (!restaurantName || !email || !phone || !password || !plan) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create restaurant and user
    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        slug: restaurantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        users: {
          create: {
            email,
            passwordHash: hashedPassword,
            role: 'OWNER',
            name: restaurantName,
            phone,
          },
        },
      },
    });

    // Get the created user
    const user = await prisma.user.findFirst({
      where: {
        restaurantId: restaurant.id,
        email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      restaurantId: restaurant.id,
      userId: user?.id,
    });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
