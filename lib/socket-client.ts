import { io as ioClient, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create Socket.IO client connection
 */
export function getSocketClient(): Socket {
    if (!socket) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        socket = ioClient(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });
    }

    return socket;
}

/**
 * Emit real-time event to Kitchen Display System
 */
export function notifyKitchen(restaurantSlug: string, order: any) {
    const client = getSocketClient();

    // Join restaurant room if not already
    client.emit('join-restaurant', restaurantSlug);

    // Emit new order event
    client.emit('order:new', {
        room: `restaurant:${restaurantSlug}`,
        order
    });

    console.log(`[Socket] Notified kitchen for ${restaurantSlug}, order #${order.id}`);
}

/**
 * Server-side HTTP trigger (for Server Actions that can't use Socket.IO directly)
 */
export async function notifyKitchenHTTP(restaurantSlug: string, order: any) {
    try {
        const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3001';

        const response = await fetch(`${socketServerUrl}/api/socket/emit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room: `restaurant:${restaurantSlug}`,
                event: 'order:new',
                data: order
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`[Socket HTTP] Notified kitchen for ${restaurantSlug}`);
    } catch (error) {
        console.error('[Socket HTTP] Failed to notify kitchen:', error);
        // Don't throw - kitchen notification is non-critical
    }
}

/**
 * Disconnect socket (cleanup)
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
