/**
 * M-Pesa Callback Handler
 * Processes payment confirmations with signature verification and idempotency
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyMpesaSignature } from '@/lib/payments/signature';
import { notifyKitchenHTTP } from '@/lib/socket-client';

interface MpesaCallbackMetadata {
    Item: Array<{
        Name: string;
        Value: string | number;
    }>;
}

interface MpesaStkCallback {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: MpesaCallbackMetadata;
}

interface MpesaCallbackBody {
    Body: {
        stkCallback: MpesaStkCallback;
    };
}

/**
 * POST /api/payments/mpesa/callback
 * Webhook endpoint for M-Pesa payment confirmations
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Read raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-mpesa-signature');

        console.log('[M-Pesa Callback] Received callback');

        // 2. Verify Signature (if enabled in production)
        if (process.env.NODE_ENV === 'production' && process.env.MPESA_VERIFY_SIGNATURE === 'true') {
            if (!signature || !verifyMpesaSignature(rawBody, signature)) {
                console.error('[M-Pesa Callback] Invalid signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        // 3. Parse callback body
        const body: MpesaCallbackBody = JSON.parse(rawBody);
        const callback = body.Body.stkCallback;

        console.log('[M-Pesa Callback] Processing:', {
            checkoutRequestId: callback.CheckoutRequestID,
            resultCode: callback.ResultCode
        });

        // 4. Check Idempotency - prevent duplicate processing
        const existingPayment = await prisma.payment.findUnique({
            where: { mpesaCheckoutRequestId: callback.CheckoutRequestID }
        });

        if (existingPayment?.callbackProcessed) {
            console.log('[M-Pesa Callback] Already processed, returning success');
            return NextResponse.json({
                message: 'Already processed',
                ResultCode: 0,
                ResultDesc: 'Success'
            });
        }

        // 5. Extract metadata (only present on success)
        let receiptNumber: string | undefined;
        let transactionDate: Date | undefined;
        let phoneNumber: string | undefined;

        if (callback.ResultCode === 0 && callback.CallbackMetadata) {
            const items = callback.CallbackMetadata.Item;
            receiptNumber = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value as string;
            const rawDate = items.find(i => i.Name === 'TransactionDate')?.Value as number;
            phoneNumber = items.find(i => i.Name === 'PhoneNumber')?.Value as string;

            if (rawDate) {
                // Parse M-Pesa date format: YYYYMMDDHHmmss
                const dateStr = rawDate.toString();
                transactionDate = new Date(
                    parseInt(dateStr.substring(0, 4)), // year
                    parseInt(dateStr.substring(4, 6)) - 1, // month (0-indexed)
                    parseInt(dateStr.substring(6, 8)), // day
                    parseInt(dateStr.substring(8, 10)), // hour
                    parseInt(dateStr.substring(10, 12)), // minute
                    parseInt(dateStr.substring(12, 14)) // second
                );
            }
        }

        // 6. Update Payment and Order in Transaction
        await prisma.$transaction(async (tx) => {
            // Update payment record
            const payment = await tx.payment.update({
                where: { mpesaCheckoutRequestId: callback.CheckoutRequestID },
                data: {
                    status: callback.ResultCode === 0 ? 'COMPLETED' : 'FAILED',
                    mpesaReceiptNumber: receiptNumber,
                    mpesaTransactionDate: transactionDate,
                    mpesaPhoneNumber: phoneNumber,
                    callbackProcessed: true,
                    callbackAttempts: { increment: 1 },
                    lastCallbackAt: new Date()
                },
                include: {
                    order: {
                        include: {
                            restaurant: true,
                            items: { include: { menuItem: true } }
                        }
                    }
                }
            });

            // If payment successful, update order status
            if (callback.ResultCode === 0) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID'
                    }
                });

                // Trigger WebSocket notification to Kitchen Display
                try {
                    await notifyKitchenHTTP(payment.order.restaurant.slug, payment.order);
                } catch (socketError) {
                    console.error('[M-Pesa Callback] WebSocket notification failed:', socketError);
                    // Non-critical, continue
                }

                console.log('[M-Pesa Callback] Payment successful, order confirmed:', payment.orderId);
            } else {
                // Payment failed
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        paymentStatus: 'FAILED',
                        status: 'CANCELLED'
                    }
                });

                console.log('[M-Pesa Callback] Payment failed:', {
                    orderId: payment.orderId,
                    reason: callback.ResultDesc
                });
            }
        });

        // 7. Return success to M-Pesa
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Success'
        });

    } catch (error: any) {
        console.error('[M-Pesa Callback] Error:', error);

        // Still return success to M-Pesa to prevent retries
        // Log error for manual reconciliation
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Accepted'
        });
    }
}
