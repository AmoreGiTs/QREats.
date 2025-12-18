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
      customer: customerReq,
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

    // CRM: Find or create customer
    let customerId = null;
    if (customerReq?.phone) {
        const customer = await prisma.customer.upsert({
            where: {
                restaurantId_phone: {
                    restaurantId,
                    phone: customerReq.phone
                }
            },
            update: {
                name: customerReq.name || undefined,
                lastVisitAt: new Date(),
                visitsCount: { increment: 1 },
            },
            create: {
                restaurantId,
                phone: customerReq.phone,
                email: customerReq.email || null,
                name: customerReq.name || 'Guest',
                lastVisitAt: new Date(),
                visitsCount: 1,
            }
        });
        customerId = customer.id;
    }

    // Table Management: Update table status
    if (tableId) {
        try {
            await prisma.table.update({
                where: { id: tableId },
                data: { status: 'OCCUPIED' }
            });
        } catch (e) {
            console.warn('Could not update table status:', e);
        }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        restaurantId,
        status: 'PENDING',
        totalAmount,
        customerId,
        tableId,
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

    // Loyalty: Award points (1 point per KES 100)
    if (customerId) {
        const pointsAwarded = Math.floor(Number(totalAmount) / 100);
        if (pointsAwarded > 0) {
            await prisma.customer.update({
                where: { id: customerId },
                data: { loyaltyPoints: { increment: pointsAwarded } }
            });

            await prisma.loyaltyTransaction.create({
                data: {
                    customerId,
                    orderId: order.id,
                    points: pointsAwarded,
                    type: 'EARNED'
                }
            });
        }
    }

    // Process payment based on method
    if (paymentMethod === 'mpesa') {
// ... existing TODOs
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
