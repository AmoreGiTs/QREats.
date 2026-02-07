import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/app/actions/order';
import prisma from '@/lib/db';
import { notifyKitchenHTTP } from '@/lib/socket-client';

/**
 * Order Creation API Route
 * 
 * This route is a thin wrapper around the createOrder Server Action.
 * All business logic (inventory, CRM, loyalty) is handled in the Server Action.
 * 
 * Responsibilities:
 * 1. Parse and validate request
 * 2. Call unified createOrder Server Action
 * 3. Trigger WebSocket notification to kitchen
 * 4. Return response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      tableId,
      restaurantId,
      paymentMethod,
      totalAmount,
      customer: customerReq,
    } = body;

    // Basic validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order' },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Call unified Server Action (handles inventory + CRM + loyalty)
    const result = await createOrder({
      restaurantId,
      items: items.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price || item.priceAtOrder
      })),
      totalAmount,
      customer: customerReq ? {
        phone: customerReq.phone,
        name: customerReq.name,
        email: customerReq.email
      } : undefined,
      tableId,
      paymentMethod: paymentMethod || 'CASH'
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Trigger WebSocket notification to Kitchen Display System
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { slug: true }
      });

      if (restaurant) {
        await notifyKitchenHTTP(restaurant.slug, result.order);
      }
    } catch (socketError) {
      // WebSocket notification failure is non-critical
      console.error('WebSocket notification failed:', socketError);
      // Continue - order was successfully created
    }

    // Generate readable order number for response
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: orderNumber,
      message: 'Order created successfully',
      order: result.order
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
