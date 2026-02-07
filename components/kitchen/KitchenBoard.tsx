'use client';

import { useOptimistic, startTransition, useEffect } from 'react';
import { updateOrderStatus } from '@/app/actions/kitchen';
import { socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

type Order = {
    id: string;
    status: string;
    createdAt: Date;
    items: {
        id: string;
        quantity: number;
        menuItem: { name: string }
    }[];
};

export function KitchenBoard({ initialOrders, restaurantId, slug }: { initialOrders: Order[], restaurantId: string, slug: string }) {
    const router = useRouter();
    const [orders, addOptimisticOrder] = useOptimistic(
        initialOrders,
        (state, updatedOrder: { id: string; status: string }) =>
            state.map((o) => (o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o))
                .filter(o => o.status !== 'COMPLETED')
    );

    // Real-time listener
    useEffect(() => {
        if (!socket.connected) socket.connect();

        socket.emit('join-room', slug);

        socket.on('order:new', (newOrder) => {
            console.log('New order received:', newOrder);
            // Since newOrder comes with data, we could optimistically add it,
            // but for simplicity and consistency with RSC, we just refresh.
            // A better approach would be to append to state if the shape matches.
            router.refresh();

            // Play notification sound
            const audio = new Audio('/sounds/ding.mp3'); // We'll need to add this or ignore if missing
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        return () => {
            socket.off('order:new');
            socket.emit('leave-room', slug);
        };
    }, [slug, router]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        startTransition(async () => {
            // Optimistic update must happen inside a transition
            addOptimisticOrder({ id: orderId, status: newStatus });
            // Server mutation
            await updateOrderStatus(orderId, newStatus, restaurantId);
        });
    };

    const pending = orders.filter(o => o.status === 'PENDING');
    const preparing = orders.filter(o => o.status === 'PREPARING');
    const ready = orders.filter(o => o.status === 'READY');

    return (
        <div className="grid grid-cols-3 gap-4 h-[calc(100vh-100px)]">
            <Column
                title="New Tickets"
                orders={pending}
                color="border-l-4 border-yellow-500"
                onAction={(id: string) => handleStatusChange(id, 'PREPARING')}
                actionLabel="Start Prep →"
                actionColor="bg-zinc-800 hover:bg-yellow-900 hover:text-yellow-100"
            />
            <Column
                title="Preparing"
                orders={preparing}
                color="border-l-4 border-blue-500"
                onAction={(id: string) => handleStatusChange(id, 'READY')}
                actionLabel="Mark Ready →"
                actionColor="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Column
                title="Ready for Pickup"
                orders={ready}
                color="border-l-4 border-green-500"
                onAction={(id: string) => handleStatusChange(id, 'COMPLETED')}
                actionLabel="Complete ✓"
                actionColor="bg-green-600 hover:bg-green-700 text-white"
            />
        </div>
    );
}

interface ColumnProps {
    title: string;
    orders: Order[];
    color: string;
    onAction: (id: string) => void;
    actionLabel: string;
    actionColor: string;
}

function Column({ title, orders, color, onAction, actionLabel, actionColor }: ColumnProps) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-full">
            <div className={`p-4 font-bold text-lg bg-zinc-950 rounded-t-xl border-b border-zinc-800 ${color} flex justify-between`}>
                {title} <span className="bg-zinc-800 px-2 py-0.5 rounded text-sm">{orders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/30">
                {orders.map((order: Order) => (
                    <div key={order.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-mono font-bold text-zinc-400">#{order.id.slice(0, 4)}</span>
                            <span className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className="space-y-1 mb-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-2 text-sm font-medium">
                                    <span className="text-zinc-500 w-4">{item.quantity}x</span>
                                    <span className="text-zinc-300">{item.menuItem.name}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onAction(order.id)}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${actionColor}`}
                        >
                            {actionLabel}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
