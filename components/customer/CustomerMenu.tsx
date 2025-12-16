'use client';

import { useState } from 'react';
import { placeCustomerOrder } from '@/app/actions/customer';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { CartDrawer } from './CartDrawer';

type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
};

export default function CustomerMenu({ restaurant, menuItems, tableId }: any) {
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const { items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, getTotalItems, getTotal } = useCart();

    // Helper to get quantity in cart
    const getQty = (menuItemId: string) => items.find(i => i.itemId === menuItemId)?.quantity || 0;

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        const orderItems = items.map((item) => ({
            menuItemId: item.itemId,
            quantity: item.quantity,
            price: item.basePrice
        }));

        try {
            // Simulate M-Pesa prompt logic here or redirect
            const phone = prompt("Enter M-Pesa Phone Number for Payment:");
            if (!phone) {
                setIsCheckingOut(false);
                return;
            }

            const res = await placeCustomerOrder(
                window.location.pathname.split('/')[1], // slug from URL or prop
                tableId,
                orderItems
            );

            if (res.success) {
                alert(`Order Placed! Order ID: ${res.orderId}\n(Simulated M-Pesa Prompt would appear now)`);
                clearCart();
                // Redirect to status page logic would go here
            } else {
                alert('Failed to place order: ' + (res.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 pb-32 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-2xl text-slate-900">Menu</h2>
                <div className="text-sm text-slate-500">{menuItems.length} items</div>
            </div>

            <div className="space-y-4">
                {menuItems.map((item: MenuItem) => (
                    <Card key={item.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                                {item.description && (
                                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
                                )}
                                <div className="text-primary font-bold">KES {item.price.toFixed(2)}</div>
                            </div>

                            {getQty(item.id) > 0 ? (
                                <div className="flex items-center gap-3 bg-slate-900 text-white p-1 rounded-full shadow-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-white hover:bg-slate-800 hover:text-white"
                                        onClick={() => {
                                            const cartItem = items.find(i => i.itemId === item.id);
                                            if (cartItem) updateQuantity(cartItem.id, cartItem.quantity - 1);
                                        }}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold w-4 text-center text-sm">{getQty(item.id)}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-white hover:bg-slate-800 hover:text-white"
                                        onClick={() => {
                                            const cartItem = items.find(i => i.itemId === item.id);
                                            if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1);
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-md bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 hover:scale-105 transition-all"
                                    onClick={() => addItem({
                                        id: `cart_${item.id}_${Date.now()}`,
                                        itemId: item.id,
                                        name: item.name,
                                        basePrice: item.price,
                                        image: item.image
                                    })}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Float Cart Button */}
            {items.length > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-50">
                    <Button
                        onClick={() => setIsCartDrawerOpen(true)}
                        className="w-full h-16 rounded-2xl shadow-xl text-lg font-bold flex justify-between items-center px-6 animate-in slide-in-from-bottom duration-300 bg-slate-900 text-white hover:bg-slate-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center text-xs">
                                {getTotalItems()}
                            </div>
                            <span>View Order</span>
                        </div>
                        <span>KES {getTotal().toFixed(2)}</span>
                    </Button>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartDrawerOpen}
                onClose={() => setIsCartDrawerOpen(false)}
            />
        </div>
    );
}
