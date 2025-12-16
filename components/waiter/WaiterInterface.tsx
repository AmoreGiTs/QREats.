'use client';

import { useState } from 'react';
import { createOrder } from '@/app/actions/order';

interface MenuItem {
    id: string;
    name: string;
    price: number;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export function WaiterInterface({
    restaurantId,
    menuItems
}: {
    restaurantId: string;
    menuItems: MenuItem[]
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'loading' | '' }>({ message: '', type: '' });

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            });
        });
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        setStatus({ message: 'Submitting Order...', type: 'loading' });

        const result = await createOrder({
            restaurantId,
            items: cart.map(i => ({
                menuItemId: i.id,
                quantity: i.quantity,
                price: i.price
            })),
            totalAmount: total,
        });

        if (result.success) {
            setStatus({ message: `Order #${result.orderId?.slice(0, 6)} Confirmed!`, type: 'success' });
            setCart([]);
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } else {
            setStatus({ message: `Failed: ${result.error}`, type: 'error' });
        }
    };

    return (
        <div className="flex h-full bg-gray-50 font-sans">
            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Menu</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-0 overflow-hidden flex flex-col h-64 border border-gray-100 text-left active:scale-[0.98]"
                        >
                            {/* Placeholder Image Area */}
                            <div className="h-32 bg-gray-100 w-full flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors">
                                🍕
                            </div>
                            <div className="p-5 flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">{item.name}</h3>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="font-bold text-lg text-gray-900">${item.price.toFixed(2)}</span>
                                    <div className="bg-gray-100 p-2 rounded-full w-8 h-8 flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        +
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 bg-white shadow-2xl border-l border-gray-100 flex flex-col z-20">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-black text-gray-900">Current Order</h2>
                    <div className="text-sm text-gray-500">{cart.length} Items</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <span className="text-6xl mb-4">🛒</span>
                            <p>Basket is empty</p>
                        </div>
                    )}
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex-1">
                                <div className="font-bold text-gray-800">{item.name}</div>
                                <div className="text-sm text-gray-500">${item.price.toFixed(2)} / unit</div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm px-1 h-8">
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="w-6 text-gray-500 hover:text-black">-</button>
                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="w-6 text-gray-500 hover:text-black">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500">Total</span>
                        <span className="text-3xl font-black text-gray-900">${total.toFixed(2)}</span>
                    </div>

                    {status.message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center animate-pulse
               ${status.type === 'error' ? 'bg-red-100 text-red-700' :
                                status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        onClick={handlePlaceOrder}
                        disabled={cart.length === 0 || status.type === 'loading'}
                        className="w-full bg-black text-white h-14 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
                    >
                        {status.type === 'loading' ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
