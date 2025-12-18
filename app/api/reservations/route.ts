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

    try {
        const reservations = await prisma.reservation.findMany({
            where: { restaurantId },
            include: {
                customer: true,
                table: true,
            },
            orderBy: { reserveTime: 'asc' },
        });
        return NextResponse.json(reservations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !['OWNER', 'MANAGER', 'WAITER'].includes(session.user.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
        id,
        restaurantId,
        customerId,
        tableId,
        reserveTime,
        partySize,
        status,
        notes
    } = body;

    try {
        if (id) {
            // Update
            const reservation = await prisma.reservation.update({
                where: { id },
                data: {
                    tableId,
                    reserveTime: new Date(reserveTime),
                    partySize: parseInt(partySize),
                    status,
                    notes,
                },
            });
            return NextResponse.json(reservation);
        } else {
            // Create
            const reservation = await prisma.reservation.create({
                data: {
                    restaurantId,
                    customerId,
                    tableId,
                    reserveTime: new Date(reserveTime),
                    partySize: parseInt(partySize),
                    status: status || 'CONFIRMED',
                    notes,
                },
            });
            return NextResponse.json(reservation);
        }
    } catch (error: any) {
        console.error('Reservation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
