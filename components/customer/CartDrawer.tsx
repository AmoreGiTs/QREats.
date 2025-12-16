'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ChevronRight, Tag, Shield, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/stores/cart-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const {
        items,
        getSubtotal,
        getServiceChargeAmount,
        getVatAmount,
        getTotal,
        getTotalItems,
        getItemPriceBreakdown,
        updateQuantity,
        removeItem,
        clearCart,
        promoCode,
        getPromoDiscount,
        removePromoCode,
    } = useCart();

    const [promoInput, setPromoInput] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;

        setIsApplyingPromo(true);
        setPromoError(null);

        try {
            // Simulate API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation - replace with actual API call
            if (promoInput.toUpperCase() === 'SAVE10') {
                // This would come from the API
                const mockPromo = {
                    code: promoInput.toUpperCase(),
                    discountType: 'percentage' as const,
                    discountValue: 10,
                    minOrderAmount: 500,
                };
                // applyPromoCode(mockPromo); // Uncomment when API is ready
                setPromoInput('');
            } else {
                setPromoError('Invalid promo code');
            }
        } catch (error: any) {
            setPromoError(error.message || 'Failed to apply promo code');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) return;
        onClose();
        router.push('/checkout');
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto flex flex-col"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-restaurant-neutral-200 p-6 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-restaurant-neutral-900">Your Order</h2>
                            <p className="text-sm text-restaurant-neutral-600">
                                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-restaurant-neutral-100 rounded-lg transition-colors"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5 text-restaurant-neutral-600" />
                        </button>
                    </div>

                    {/* Order Summary Bar */}
                    <div className="mt-4 p-3 bg-restaurant-primary-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-restaurant-primary-700">Total</span>
                            <div className="text-lg font-bold text-restaurant-primary-900">
                                KES {getTotal().toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-6 text-restaurant-neutral-300">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-restaurant-neutral-900 mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-restaurant-neutral-600 mb-6">
                                Add some delicious items to get started!
                            </p>
                            <Button onClick={onClose} className="bg-restaurant-primary-600 hover:bg-restaurant-primary-700">
                                Browse Menu
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const priceBreakdown = getItemPriceBreakdown(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white border border-restaurant-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-4">
                                            {/* Item Image */}
                                            <div className="w-20 h-20 bg-restaurant-neutral-100 rounded-lg overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-restaurant-neutral-400">
                                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-restaurant-neutral-900 truncate">
                                                        {item.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1 hover:bg-restaurant-neutral-100 rounded shrink-0"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-restaurant-neutral-500" />
                                                    </button>
                                                </div>

                                                {/* Modifiers */}
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <div className="mt-1">
                                                        <p className="text-xs text-restaurant-neutral-600">
                                                            {item.modifiers.map(m => m.name).join(', ')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {item.notes && (
                                                    <p className="mt-1 text-xs text-restaurant-neutral-600 italic">
                                                        Note: {item.notes}
                                                    </p>
                                                )}

                                                {/* Price Breakdown */}
                                                <div className="mt-2 text-xs text-restaurant-neutral-500">
                                                    KES {priceBreakdown.base.toFixed(2)}
                                                    {priceBreakdown.modifiers > 0 && (
                                                        <span className="ml-1">
                                                            + KES {priceBreakdown.modifiers.toFixed(2)} extras
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="p-1.5 bg-restaurant-neutral-100 rounded-lg hover:bg-restaurant-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1.5 bg-restaurant-neutral-100 rounded-lg hover:bg-restaurant-neutral-200 transition-colors"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="text-base font-bold text-restaurant-primary-600">
                                                        KES {item.totalPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Clear Cart Button */}
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear your cart?')) {
                                        clearCart();
                                    }
                                }}
                                className="w-full py-2.5 border border-restaurant-neutral-300 text-restaurant-neutral-700 rounded-lg hover:bg-restaurant-neutral-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Cart
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer - Summary & Checkout */}
                {items.length > 0 && (
                    <div className="sticky bottom-0 bg-white border-t border-restaurant-neutral-200 p-6 space-y-4">
                        {/* Promo Code */}
                        <div className="space-y-2">
                            {promoCode ? (
                                <div className="flex items-center justify-between p-3 bg-restaurant-primary-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-restaurant-primary-600" />
                                        <span className="font-medium text-restaurant-primary-700">{promoCode.code}</span>
                                        <span className="text-sm text-restaurant-primary-600">
                                            -KES {getPromoDiscount().toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={removePromoCode}
                                        className="text-sm text-restaurant-neutral-500 hover:text-restaurant-neutral-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => {
                                                setPromoInput(e.target.value);
                                                setPromoError(null);
                                            }}
                                            placeholder="Promo code"
                                            className="flex-1 px-4 py-2 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                        />
                                        <Button
                                            onClick={handleApplyPromo}
                                            disabled={isApplyingPromo || !promoInput.trim()}
                                            className="px-4 py-2 bg-restaurant-primary-600 text-white rounded-lg hover:bg-restaurant-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApplyingPromo ? 'Applying...' : 'Apply'}
                                        </Button>
                                    </div>
                                    {promoError && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {promoError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-restaurant-neutral-600">Subtotal</span>
                                <span>KES {getSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-restaurant-neutral-600">Service Charge (5%)</span>
                                <span>KES {getServiceChargeAmount().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-restaurant-neutral-600">VAT (16%)</span>
                                <span>KES {getVatAmount().toFixed(2)}</span>
                            </div>
                            {getPromoDiscount() > 0 && (
                                <div className="flex justify-between text-sm text-restaurant-primary-600">
                                    <span>Promo Discount</span>
                                    <span>-KES {getPromoDiscount().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-restaurant-neutral-200">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>KES {getTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={items.length === 0}
                            className="w-full py-3.5 bg-linear-to-r from-restaurant-primary-600 to-restaurant-primary-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-restaurant-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Security Notice */}
                        <div className="flex items-center justify-center gap-2 text-xs text-restaurant-neutral-500">
                            <Shield className="w-3 h-3" />
                            <span>Secure payment • 256-bit SSL encrypted</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
