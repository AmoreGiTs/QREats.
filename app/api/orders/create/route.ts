import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      tableId,
      restaurantId,
      paymentMethod,
      totalAmount,
      subtotal,
      serviceCharge,
      vat,
      promoDiscount,
      promoCode,
      paymentData,
    } = body;

    // Validate required fields
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        restaurantId,
        status: 'PENDING',
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtOrder: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // TODO: Store additional order metadata (table, payment method, etc.) in a separate table
    // For now, we'll return success with the order ID

    // Process payment based on method
    if (paymentMethod === 'mpesa') {
      // TODO: Integrate M-Pesa STK Push
      // const mpesaResult = await initiateMpesaPayment({
      //   orderId: order.id,
      //   phoneNumber: paymentData.phoneNumber,
      //   amount: totalAmount,
      // });
    } else if (paymentMethod === 'card') {
      // TODO: Integrate Stripe Payment Intent
      // const stripeResult = await createStripePaymentIntent({
      //   orderId: order.id,
      //   amount: totalAmount,
      //   cardData: paymentData,
      // });
    }

    // TODO: Send order confirmation email
    // TODO: Trigger real-time notification to kitchen via WebSocket
    // TODO: Update inventory

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
