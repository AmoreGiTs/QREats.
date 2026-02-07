/**
 * Plaid Bank Reconciliation Integration
 */

import { Configuration, PlaidApi, PlaidEnvironments, TransactionsGetRequest } from 'plaid';
import prisma from '@/lib/db';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidIntegration {
    /**
     * Sync bank transactions and match with internal orders/expenses
     */
    async syncBankTransactions(restaurantId: string): Promise<number> {
        try {
            // 1. Get Access Token for the restaurant's connected bank
            const accessToken = await this.getAccessToken(restaurantId);
            if (!accessToken) throw new Error('No bank account connected');

            // 2. Fetch transactions from Plaid
            const request: TransactionsGetRequest = {
                access_token: accessToken,
                start_date: '2024-01-01', // Should be dynamic
                end_date: new Date().toISOString().split('T')[0],
            };

            const response = await plaidClient.transactionsGet(request);
            const transactions = response.data.transactions;

            // 3. Match with internal records (Simplified logic)
            let matchCount = 0;
            for (const tx of transactions) {
                const matchedOrder = await this.findMatchingOrder(restaurantId, tx);
                if (matchedOrder) {
                    await this.markAsReconciled(matchedOrder.id, tx.transaction_id);
                    matchCount++;
                }
            }

            return matchCount;
        } catch (e: any) {
            console.error('[Plaid] Sync failed:', e.message);
            throw e;
        }
    }

    private async getAccessToken(restaurantId: string): Promise<string | null> {
        // Logic to fetch from integration table
        return process.env.PLAID_ACCESS_TOKEN_MOCK || null;
    }

    private async findMatchingOrder(restaurantId: string, tx: any) {
        // Simple match by amount and date window
        return await prisma.order.findFirst({
            where: {
                restaurantId,
                totalAmount: tx.amount,
                status: 'PAID',
                createdAt: {
                    gte: new Date(new Date(tx.date).getTime() - 24 * 60 * 60 * 1000),
                    lte: new Date(new Date(tx.date).getTime() + 24 * 60 * 60 * 1000),
                }
            }
        });
    }

    private async markAsReconciled(orderId: string, plaidTxId: string) {
        // Update order or create reconciliation record
        console.log(`[Reconciliation] Matched Order ${orderId} with Plaid TX ${plaidTxId}`);
    }
}

export const plaidIntegration = new PlaidIntegration();
