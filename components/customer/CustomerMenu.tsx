'use client';

import { useState, useMemo, useEffect } from 'react';
import { placeCustomerOrder } from '@/app/actions/customer';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Minus, Plus, Search, Filter, ShoppingBag, X } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    imageUrl?: string;
    category?: string;
    dietaryInfo?: string; // "VEG, GF"
    isAvailable?: boolean;
};

export default function CustomerMenu({ restaurant, menuItems, tableId }: any) {
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { items, addItem, updateQuantity, clearCart, getTotal, getTotalItems, setTable } = useCart();

    // Persist Table and Restaurant Info from URL/Props
    useEffect(() => {
        if (tableId && restaurant.id) {
            setTable(tableId, restaurant.id);
        }
    }, [tableId, restaurant.id, setTable]);

    // Helper to get quantity in cart
    const getQty = (menuItemId: string) => items.find(i => i.itemId === menuItemId)?.quantity || 0;

    // 1. Extract Categories
    const categories: string[] = useMemo(() => {
        const cats = new Set(menuItems.map((i: MenuItem) => i.category || 'Mains'));
        return ['All', ...Array.from(cats)] as string[];
    }, [menuItems]);

    // 2. Filter Items
    const filteredItems = useMemo(() => {
        return menuItems.filter((item: MenuItem) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = activeCategory === 'All' || (item.category || 'Mains') === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menuItems, searchQuery, activeCategory]);

    // Group items for display if "All" is selected? 
    // Or just list them. If "All", let's group by headers.
    const groupedItems = useMemo(() => {
        if (activeCategory !== 'All') return { [activeCategory]: filteredItems };

        const groups: Record<string, MenuItem[]> = {};
        filteredItems.forEach((item: MenuItem) => {
            const cat = item.category || 'Mains';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredItems, activeCategory]);

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* 1. Sticky Header with Search & Categories */}
            <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="max-w-md mx-auto px-4 py-3 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-linear">
                        {categories.map((cat: string) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                    activeCategory === cat
                                        ? "bg-black text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Menu Listing */}
            <div className="max-w-md mx-auto px-4 pt-6 space-y-8">
                {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            {category}
                            <div className="h-px flex-1 bg-gray-200" />
                        </h3>

                        <div className="grid gap-4">
                            {items.map((item: MenuItem) => (
                                <Card key={item.id} className="overflow-hidden border-none shadow-sm group hover:shadow-md transition-all duration-300">
                                    <div className="flex p-3 gap-3">
                                        {/* Image (if exists) */}
                                        {(item.imageUrl || item.image) && (
                                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                                                <Image
                                                    src={item.imageUrl || item.image || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="96px"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between min-h-[96px]">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                                                    {item.dietaryInfo && (
                                                        <div className="flex gap-1 shrink-0">
                                                            {item.dietaryInfo.split(',').map(tag => (
                                                                <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md">
                                                                    {tag.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-bold text-gray-900">
                                                    {item.price.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                                                </span>

                                                {/* Add Button / Qty Control */}
                                                {getQty(item.id) > 0 ? (
                                                    <div className="flex items-center gap-2 bg-black text-white px-1 py-1 rounded-full shadow-lg">
                                                        <button
                                                            onClick={() => {
                                                                const cartItem = (items as any[]).find(i => i.itemId === item.id);
                                                                if (cartItem) updateQuantity(cartItem.id, cartItem.quantity - 1);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">{getQty(item.id)}</span>
                                                        <button
                                                            onClick={() => {
                                                                const cartItem = (items as any[]).find(i => i.itemId === item.id);
                                                                if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addItem({
                                                            id: `cart_${item.id}_${Date.now()}`,
                                                            itemId: item.id,
                                                            name: item.name,
                                                            basePrice: item.price,
                                                            image: item.imageUrl || item.image
                                                        })}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-900 hover:bg-black hover:text-white transition-all duration-300"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {Object.keys(groupedItems).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No items found.</p>
                        <button onClick={() => setSearchQuery('')} className="text-orange-600 text-sm font-bold mt-2">Clear Search</button>
                    </div>
                )}
            </div>

            {/* Float Cart Button */}
            <AnimatePresence>
                {items.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-50"
                    >
                        <Button
                            onClick={() => setIsCartDrawerOpen(true)}
                            className="w-full h-16 rounded-2xl shadow-xl shadow-orange-500/20 text-lg font-bold flex justify-between items-center px-6 bg-black text-white hover:bg-gray-900 transition-all border border-orange-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500 h-8 w-8 rounded-full flex items-center justify-center text-xs text-white">
                                    {getTotalItems()}
                                </div>
                                <span>View Order</span>
                            </div>
                            <span>
                                {getTotal().toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                            </span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartDrawerOpen}
                onClose={() => setIsCartDrawerOpen(false)}
            />
        </div>
    );
}
