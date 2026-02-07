/**
 * Multi-Tenant Query Middleware
 * Automatically filters queries by restaurantId to prevent cross-tenant data leaks
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// Models that require tenant isolation
const TENANT_MODELS = [
    'Order',
    'OrderItem',
    'MenuItem',
    'InventoryItem',
    'InventoryBatch',
    'Table',
    'Customer',
    'Reservation',
    'Payment',
    'Refund',
    'LoyaltyTransaction'
];

// Models that don't have restaurantId (skip filtering)
const SKIP_MODELS = ['User', 'Session', 'Restaurant', 'AuditLog'];

/**
 * Add tenant filtering middleware to Prisma Client
 */
export function addTenantMiddleware(prisma: PrismaClient) {
    prisma.$use(async (params, next) => {
        // Skip if not a tenant model
        if (!TENANT_MODELS.includes(params.model || '')) {
            return next(params);
        }

        // Get current session
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (error) {
            // No session available (e.g., during build time)
            return next(params);
        }

        // Skip if no user or user is ADMIN
        if (!session?.user || session.user.role === 'ADMIN') {
            return next(params);
        }

        const restaurantId = session.user.restaurantId;

        // Skip if user has no restaurant (shouldn't happen in production)
        if (!restaurantId) {
            console.warn('[Tenant Middleware] User has no restaurantId:', session.user.id);
            return next(params);
        }

        // Apply filtering based on operation
        switch (params.action) {
            case 'findUnique':
            case 'findFirst':
            case 'findMany':
            case 'count':
            case 'aggregate':
                // Add restaurantId filter to WHERE clause
                params.args.where = {
                    ...params.args.where,
                    restaurantId
                };
                break;

            case 'create':
            case 'createMany':
                // Ensure restaurantId is set on create
                if (params.args.data) {
                    if (Array.isArray(params.args.data)) {
                        // createMany
                        params.args.data = params.args.data.map((item: any) => ({
                            ...item,
                            restaurantId: item.restaurantId || restaurantId
                        }));
                    } else {
                        // create
                        params.args.data = {
                            ...params.args.data,
                            restaurantId: params.args.data.restaurantId || restaurantId
                        };
                    }
                }
                break;

            case 'update':
            case 'updateMany':
                // Prevent updating records from other restaurants
                params.args.where = {
                    ...params.args.where,
                    restaurantId
                };

                // Prevent changing restaurantId
                if (params.args.data?.restaurantId && params.args.data.restaurantId !== restaurantId) {
                    throw new Error('Cannot change restaurantId');
                }
                break;

            case 'delete':
            case 'deleteMany':
                // Prevent deleting records from other restaurants
                params.args.where = {
                    ...params.args.where,
                    restaurantId
                };
                break;

            case 'upsert':
                // Filter on WHERE and set on CREATE
                params.args.where = {
                    ...params.args.where,
                    restaurantId
                };
                params.args.create = {
                    ...params.args.create,
                    restaurantId
                };
                params.args.update = {
                    ...params.args.update
                };
                break;
        }

        return next(params);
    });
}

/**
 * Audit logging middleware
 * Logs all mutations for compliance and debugging
 */
export function addAuditMiddleware(prisma: PrismaClient) {
    prisma.$use(async (params, next) => {
        const result = await next(params);

        // Only log mutations
        const mutationActions = ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany'];
        if (!mutationActions.includes(params.action)) {
            return result;
        }

        // Get session for audit trail
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (error) {
            return result;
        }

        // Log mutation (async, don't block the response)
        if (session?.user) {
            prisma.auditLog.create({
                data: {
                    userId: session.user.id,
                    restaurantId: session.user.restaurantId || '',
                    action: params.action,
                    model: params.model || '',
                    recordId: result?.id || '',
                    metadata: JSON.stringify({
                        args: params.args,
                        timestamp: new Date().toISOString()
                    })
                }
            }).catch(error => {
                console.error('[Audit Middleware] Failed to log:', error);
            });
        }

        return result;
    });
}
