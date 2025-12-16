
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
// import { socket } from '@/lib/socket'; // Client-side socket cannot be used here
// Actually server-side should use the socket server instance or a redis pubsub if scaled. 
// For this simple custom server, we might need an HTTP endpoint or just rely on client polling/refresh if we don't have a backend channel.
// Wait, we designed the custom server to just relay.
// The implementation plan says "app/api/payments/callback/route.ts".

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("M-Pesa Callback:", body);

        // M-Pesa standard format
        const { Body } = body;
        const { stkCallback } = Body;

        const merchantRequestID = stkCallback.MerchantRequestID;
        const resultCode = stkCallback.ResultCode;

        if (resultCode === 0) {
            // Success
            // Find related payment/order. logic depends on how we stored the request ID.
            // For MVP/Demo, we assume we find the Pending order associated.
            // In a real app, we'd have a PaymentTransaction table.

            console.log(`Payment Successful for Request ID: ${merchantRequestID}`);

            // Here we would:
            // 1. Update Order Status to 'CONFIRMED'
            // 2. Trigger Inventory Logic (if not already done at creation)
            // 3. Emit Socket Event (requires backend-to-backend socket or polling)
        }

        return NextResponse.json({ received: true });
    } catch (e) {
        console.error("Callback Error", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
