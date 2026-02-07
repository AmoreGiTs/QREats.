/**
 * Event Base Types and Schemas
 */

export enum EventType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_UPDATED = 'ORDER_UPDATED',
    ORDER_PAID = 'ORDER_PAID',
    INVENTORY_DEDUCTED = 'INVENTORY_DEDUCTED',
    INVENTORY_RESTOCKED = 'INVENTORY_RESTOCKED',
    INVENTORY_LOW_STOCK = 'INVENTORY_LOW_STOCK',
    PAYMENT_CALLBACK_RECEIVED = 'PAYMENT_CALLBACK_RECEIVED'
}

export interface BaseEvent {
    id: string;
    type: EventType;
    restaurantId: string;
    locationId?: string;
    timestamp: string;
    version: string;
    data: any;
}

export const TOPICS = {
    ORDERS: 'qreats.orders',
    INVENTORY: 'qreats.inventory',
    PAYMENTS: 'qreats.payments',
    ANALYTICS: 'qreats.analytics'
};
