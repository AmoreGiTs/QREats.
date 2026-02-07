/**
 * RBAC Middleware
 * Request guards for enforcing permission-based access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Permission, hasPermission, hasAnyPermission, Role } from './permissions';

interface SessionUser {
    id: string; email: string;
    role: Role | string;
    restaurantId?: string;
}

/**
 * Get session with type safety
 */
export async function getSession() {
    const session = await getServerSession(authOptions);
    return session as { user: SessionUser } | null;
}

/**
 * Require authentication (must be logged in)
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    return session;
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: Permission) {
    const session = await requireAuth();

    if (!hasPermission(session.user.role, permission)) {
        throw new Error(`Forbidden: Missing permission ${permission}`);
    }

    return session;
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissions: Permission[]) {
    const session = await requireAuth();

    if (!hasAnyPermission(session.user.role, permissions)) {
        throw new Error(`Forbidden: Missing required permissions`);
    }

    return session;
}

/**
 * Require specific role(s)
 */
export async function requireRole(...roles: Role[]) {
    const session = await requireAuth();

    if (!roles.includes(session.user.role as Role)) {
        throw new Error(`Forbidden: Insufficient role. Required: ${roles.join(', ')}`);
    }

    return session;
}

/**
 * Verify restaurant ownership/access
 */
export async function requireRestaurantAccess(restaurantId: string) {
    const session = await requireAuth();

    // Admin can access all restaurants
    if (session.user.role === Role.ADMIN) {
        return session;
    }

    // Check if user belongs to this restaurant
    if (session.user.restaurantId !== restaurantId) {
        throw new Error('Forbidden: Cannot access other restaurant data');
    }

    return session;
}

/**
 * Middleware helper for API routes
 * Usage: const session = await withPermission(Permission.ORDER_CREATE);
 */
export async function withPermission(permission: Permission) {
    try {
        return await requirePermission(permission);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

/**
 * Higher-order function to wrap API route with permission check
 */
export function withAuth(
    handler: (request: NextRequest, context: { user: SessionUser }) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        try {
            const session = await requireAuth();
            return await handler(request, { user: session.user });
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'Unauthorized' },
                { status: error.message.includes('Forbidden') ? 403 : 401 }
            );
        }
    };
}

/**
 * Higher-order function to wrap API route with permission check
 */
export function withPermissions(
    permissions: Permission[],
    handler: (request: NextRequest, context: { user: SessionUser }) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        try {
            const session = await requireAnyPermission(permissions);
            return await handler(request, { user: session.user });
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'Unauthorized' },
                { status: error.message.includes('Forbidden') ? 403 : 401 }
            );
        }
    };
}

/**
 * Server Action guard - use in Server Actions
 */
export async function guardAction(permission: Permission) {
    try {
        await requirePermission(permission);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

/**
 * Example usage in API route:
 * 
 * export const POST = withPermissions([Permission.ORDER_CREATE], async (request, { user }) => {
 *   // Handler code here
 *   return NextResponse.json({ success: true });
 * });
 */
