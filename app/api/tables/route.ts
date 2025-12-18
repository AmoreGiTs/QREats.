import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
        return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const tables = await prisma.table.findMany({
        where: { restaurantId },
        orderBy: { number: 'asc' },
    });

    return NextResponse.json(tables);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !['OWNER', 'MANAGER'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, number, capacity, status, restaurantId } = body;

    try {
        if (id) {
            // Update
            const table = await prisma.table.update({
                where: { id },
                data: {
                    number,
                    capacity: parseInt(capacity),
                    status
                },
            });
            return NextResponse.json(table);
        } else {
            // Create
            const table = await prisma.table.create({
                data: {
                    number,
                    capacity: parseInt(capacity),
                    status: status || 'AVAILABLE',
                    restaurantId
                },
            });
            return NextResponse.json(table);
        }
    } catch (error: any) {
        console.error('Table error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
