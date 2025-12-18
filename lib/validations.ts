import { z } from 'zod';

export const RestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric'),
  email: z.string().email('Invalid email address'),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional().default('#000000'),
});

export type RestaurantInput = z.infer<typeof RestaurantSchema>;

export const OrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export type OrderItemInput = z.infer<typeof OrderItemSchema>;

export const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  totalAmount: z.number().nonnegative(),
  items: z.array(OrderItemSchema).min(1),
  tableId: z.union([z.string(), z.number()]).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const PlaceCustomerOrderSchema = z.object({
  slug: z.string(),
  items: z.array(OrderItemSchema),
  tableId: z.union([z.string(), z.number()]),
});

export type PlaceCustomerOrderInput = z.infer<typeof PlaceCustomerOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PAYMENT_PENDING']),
  restaurantId: z.string(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
