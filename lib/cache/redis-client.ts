/**
 * Redis Cache Client
 * Provides caching, pub/sub, and real-time updates
 */

import Redis from 'ioredis';

export class RedisCache {
    private redis: Redis;
    private pubsub: Redis;
    private static instance: RedisCache;

    private constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            enableReadyCheck: true,
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };

        this.redis = new Redis(redisConfig);
        this.pubsub = this.redis.duplicate();

        this.redis.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.redis.on('connect', () => {
            console.log('✅ Redis connected');
        });
    }

    static getInstance(): RedisCache {
        if (!RedisCache.instance) {
            RedisCache.instance = new RedisCache();
        }
        return RedisCache.instance;
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Cache GET error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     */
    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error(`Cache SET error for key ${key}:`, error);
        }
    }

    /**
     * Delete key from cache
     */
    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error(`Cache DEL error for key ${key}:`, error);
        }
    }

    /**
     * Invalidate cache by pattern
     */
    async invalidate(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error(`Cache INVALIDATE error for pattern ${pattern}:`, error);
        }
    }

    /**
     * Get multiple keys at once
     */
    async mget<T>(keys: string[]): Promise<(T | null)[]> {
        try {
            const values = await this.redis.mget(...keys);
            return values.map(v => v ? JSON.parse(v) : null);
        } catch (error) {
            console.error('Cache MGET error:', error);
            return keys.map(() => null);
        }
    }

    /**
     * Set multiple keys at once
     */
    async mset(entries: Record<string, any>, ttl: number = 300): Promise<void> {
        try {
            const pipeline = this.redis.pipeline();

            Object.entries(entries).forEach(([key, value]) => {
                pipeline.setex(key, ttl, JSON.stringify(value));
            });

            await pipeline.exec();
        } catch (error) {
            console.error('Cache MSET error:', error);
        }
    }

    /**
     * Increment counter
     */
    async incr(key: string, amount: number = 1): Promise<number> {
        try {
            return await this.redis.incrby(key, amount);
        } catch (error) {
            console.error(`Cache INCR error for key ${key}:`, error);
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache EXISTS error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Subscribe to channel for real-time updates
     */
    subscribe(channel: string, callback: (message: any) => void): void {
        this.pubsub.subscribe(channel);
        this.pubsub.on('message', (ch, msg) => {
            if (ch === channel) {
                try {
                    callback(JSON.parse(msg));
                } catch (error) {
                    console.error(`Error parsing message from channel ${channel}:`, error);
                }
            }
        });
    }

    /**
     * Unsubscribe from channel
     */
    unsubscribe(channel: string): void {
        this.pubsub.unsubscribe(channel);
    }

    /**
     * Publish message to channel
     */
    async publish(channel: string, message: any): Promise<void> {
        try {
            await this.redis.publish(channel, JSON.stringify(message));
        } catch (error) {
            console.error(`Publish error for channel ${channel}:`, error);
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<CacheStats> {
        try {
            const info = await this.redis.info('stats');
            const keyspace = await this.redis.info('keyspace');

            return {
                connected: this.redis.status === 'ready',
                totalKeys: this.parseKeyspaceKeys(keyspace),
                hitRate: this.parseHitRate(info),
                memoryUsed: await this.getMemoryUsage()
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {
                connected: false,
                totalKeys: 0,
                hitRate: 0,
                memoryUsed: 0
            };
        }
    }

    private parseKeyspaceKeys(keyspace: string): number {
        const match = keyspace.match(/keys=(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    private parseHitRate(info: string): number {
        const hitsMatch = info.match(/keyspace_hits:(\d+)/);
        const missesMatch = info.match(/keyspace_misses:(\d+)/);

        if (!hitsMatch || !missesMatch) return 0;

        const hits = parseInt(hitsMatch[1]);
        const misses = parseInt(missesMatch[1]);
        const total = hits + misses;

        return total > 0 ? (hits / total) * 100 : 0;
    }

    private async getMemoryUsage(): Promise<number> {
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Close connections
     */
    async disconnect(): Promise<void> {
        await this.redis.quit();
        await this.pubsub.quit();
    }
}

export interface CacheStats {
    connected: boolean;
    totalKeys: number;
    hitRate: number;
    memoryUsed: number;
}

// Export singleton instance
export const cache = RedisCache.getInstance();
