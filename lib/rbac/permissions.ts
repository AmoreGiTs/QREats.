/**
 * RBAC Permission System
 * Defines granular permissions and role-based access control
 */

// Permission enumeration
export enum Permission {
    // Order permissions
    ORDER_CREATE = 'order:create',
    ORDER_VIEW = 'order:view',
    ORDER_UPDATE = 'order:update',
    ORDER_REFUND = 'order:refund',
    ORDER_CANCEL = 'order:cancel',

    // Menu permissions
    MENU_VIEW = 'menu:view',
    MENU_CREATE = 'menu:create',
    MENU_UPDATE = 'menu:update',
    MENU_DELETE = 'menu:delete',

    // Inventory permissions
    INVENTORY_VIEW = 'inventory:view',
    INVENTORY_MANAGE = 'inventory:manage',
    INVENTORY_DEDUCT = 'inventory:deduct',
    INVENTORY_RESTOCK = 'inventory:restock',

    // Customer/CRM permissions
    CUSTOMER_VIEW = 'customer:view',
    CUSTOMER_MANAGE = 'customer:manage',
    LOYALTY_VIEW = 'loyalty:view',
    LOYALTY_MANAGE = 'loyalty:manage',

    // Staff & User permissions
    STAFF_VIEW = 'staff:view',
    STAFF_CREATE = 'staff:create',
    STAFF_UPDATE = 'staff:update',
    STAFF_DELETE = 'staff:delete',

    // Reports & Analytics
    REPORTS_VIEW = 'reports:view',
    REPORTS_EXPORT = 'reports:export',
    ANALYTICS_VIEW = 'analytics:view',

    // Settings permissions
    SETTINGS_VIEW = 'settings:view',
    SETTINGS_MANAGE = 'settings:manage',

    // Table & Reservation permissions
    TABLE_VIEW = 'table:view',
    TABLE_MANAGE = 'table:manage',
    RESERVATION_VIEW = 'reservation:view',
    RESERVATION_MANAGE = 'reservation:manage',

    // Payment permissions
    PAYMENT_VIEW = 'payment:view',
    PAYMENT_PROCESS = 'payment:process',
    PAYMENT_REFUND = 'payment:refund'
}

// User roles
export enum Role {
    CUSTOMER = 'CUSTOMER',
    WAITER = 'WAITER',
    KITCHEN_STAFF = 'KITCHEN_STAFF',
    MANAGER = 'MANAGER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN'
}

// Role-to-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.CUSTOMER]: [
        Permission.ORDER_CREATE,
        Permission.ORDER_VIEW,
        Permission.MENU_VIEW,
        Permission.TABLE_VIEW,
        Permission.LOYALTY_VIEW
    ],

    [Role.WAITER]: [
        Permission.ORDER_CREATE,
        Permission.ORDER_VIEW,
        Permission.ORDER_UPDATE,
        Permission.MENU_VIEW,
        Permission.TABLE_VIEW,
        Permission.TABLE_MANAGE,
        Permission.CUSTOMER_VIEW,
        Permission.RESERVATION_VIEW,
        Permission.RESERVATION_MANAGE,
        Permission.PAYMENT_VIEW
    ],

    [Role.KITCHEN_STAFF]: [
        Permission.ORDER_VIEW,
        Permission.ORDER_UPDATE,
        Permission.MENU_VIEW,
        Permission.INVENTORY_VIEW,
        Permission.INVENTORY_DEDUCT
    ],

    [Role.MANAGER]: [
        // All Waiter permissions
        ...ROLE_PERMISSIONS[Role.WAITER],
        // Additional Manager permissions
        Permission.ORDER_REFUND,
        Permission.ORDER_CANCEL,
        Permission.MENU_CREATE,
        Permission.MENU_UPDATE,
        Permission.MENU_DELETE,
        Permission.INVENTORY_VIEW,
        Permission.INVENTORY_MANAGE,
        Permission.INVENTORY_DEDUCT,
        Permission.INVENTORY_RESTOCK,
        Permission.CUSTOMER_MANAGE,
        Permission.LOYALTY_MANAGE,
        Permission.STAFF_VIEW,
        Permission.REPORTS_VIEW,
        Permission.REPORTS_EXPORT,
        Permission.ANALYTICS_VIEW,
        Permission.SETTINGS_VIEW,
        Permission.PAYMENT_PROCESS,
        Permission.PAYMENT_REFUND
    ],

    [Role.OWNER]: [
        // All Manager permissions
        ...ROLE_PERMISSIONS[Role.MANAGER],
        // Additional Owner permissions
        Permission.STAFF_CREATE,
        Permission.STAFF_UPDATE,
        Permission.STAFF_DELETE,
        Permission.SETTINGS_MANAGE
    ],

    [Role.ADMIN]: Object.values(Permission) // Admin has all permissions
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | string, permission: Permission): boolean {
    const roleEnum = role as Role;
    const permissions = ROLE_PERMISSIONS[roleEnum];
    return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role | string, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role | string, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role | string): Permission[] {
    const roleEnum = role as Role;
    return ROLE_PERMISSIONS[roleEnum] || [];
}

/**
 * Permission decorator for type-safe permission checking
 */
export function requiresPermission(...permissions: Permission[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // This would be implemented with actual session checking
            // For now, it's a placeholder for the pattern
            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
