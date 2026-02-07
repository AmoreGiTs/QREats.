/**
 * Accounting Integration Adapter Pattern
 * Provides a unified interface for multiple accounting platforms
 */

export enum AccountingPlatform {
    QUICKBOOKS = 'quickbooks',
    XERO = 'xero',
    SAGE = 'sage'
}

export interface SyncResult {
    success: boolean;
    externalId?: string;
    syncedAt: Date;
    error?: string;
}

export interface AccountingAdapter {
    platform: AccountingPlatform;
    syncSales(orderId: string): Promise<SyncResult>;
    syncExpense(expenseId: string): Promise<SyncResult>;
    reconcilePayment(paymentId: string): Promise<SyncResult>;
}

/**
 * Base Adapter Factory
 */
export class AccountingService {
    private adapters: Map<AccountingPlatform, AccountingAdapter> = new Map();

    registerAdapter(adapter: AccountingAdapter) {
        this.adapters.set(adapter.platform, adapter);
    }

    async syncOrder(restaurantId: string, orderId: string): Promise<SyncResult> {
        const config = await this.getIntegrationConfig(restaurantId);
        if (!config) return { success: false, error: 'No accounting integration configured', syncedAt: new Date() };

        const adapter = this.adapters.get(config.platform as AccountingPlatform);
        if (!adapter) return { success: false, error: 'Platform adapter not found', syncedAt: new Date() };

        return adapter.syncSales(orderId);
    }

    private async getIntegrationConfig(restaurantId: string) {
        // Fetch from a hypothetical RestaurantIntegration table
        // For now, mock return
        return { platform: AccountingPlatform.QUICKBOOKS };
    }
}

export const accountingService = new AccountingService();
