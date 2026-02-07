/**
 * AI-Powered Kitchen Optimizer
 * Uses heuristic algorithms and ML signals to optimize order preparation sequence
 */

import prisma from '@/lib/db';
import { cache } from '@/lib/cache/redis-client';

export interface KitchenQueueItem {
    orderId: string;
    priority: number;
    estimatedPrepTime: number; // minutes
    station: 'GRILL' | 'COLD' | 'PASTRY' | 'DRINKS';
    status: 'QUEUED' | 'PREPARING' | 'READY';
    complexity: number; // 1-10
}

export class KitchenOptimizer {
    /**
     * Optimize the preparation sequence for a list of active orders
     */
    async optimizePreparation(restaurantId: string, locationId: string): Promise<KitchenQueueItem[]> {
        const activeOrders = await prisma.order.findMany({
            where: {
                restaurantId,
                locationId,
                status: 'PENDING',
                paymentStatus: 'PAID'
            },
            include: { items: { include: { menuItem: true } }, customer: true }
        });

        const queue: KitchenQueueItem[] = [];

        for (const order of activeOrders) {
            const priority = this.calculatePriority(order);

            for (const item of order.items) {
                queue.push({
                    orderId: order.id,
                    priority,
                    estimatedPrepTime: this.estimatePrepTime(item),
                    station: this.assignStation(item.menuItem.category),
                    status: 'QUEUED',
                    complexity: this.calculateComplexity(item)
                });
            }
        }

        // Sort by priority (desc) and then prep time (asc) for Shortest Processing Time First (SPT)
        return queue.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.estimatedPrepTime - b.estimatedPrepTime;
        });
    }

    private calculatePriority(order: any): number {
        let score = 1;

        // VIP Segment gets priority
        if (order.customer?.segment === 'VIP') score += 5;

        // Older orders get higher priority (First-In, First-Out component)
        const waitTimeMinutes = (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000;
        score += Math.floor(waitTimeMinutes / 5);

        return score;
    }

    private estimatePrepTime(item: any): number {
        // In a real system, this would fetch from historical AI model
        // Fallback to static mapping
        const baseTimes: Record<string, number> = {
            'Starters': 5,
            'Mains': 15,
            'Desserts': 8,
            'Drinks': 3
        };
        return baseTimes[item.menuItem.category] || 10;
    }

    private assignStation(category: string): KitchenQueueItem['station'] {
        if (category === 'Drinks') return 'DRINKS';
        if (category === 'Desserts') return 'PASTRY';
        if (category === 'Starters') return 'COLD';
        return 'GRILL';
    }

    private calculateComplexity(item: any): number {
        // Complexity based on quantity and item metadata
        return Math.min(10, item.quantity * 2);
    }
}

export const kitchenOptimizer = new KitchenOptimizer();
