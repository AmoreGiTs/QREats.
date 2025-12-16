import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Enhanced Types
export interface CartModifier {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    id: string; // Unique cart item ID
    itemId: string; // Menu item ID
    name: string;
    basePrice: number;
    quantity: number;
    image?: string;
    notes?: string;
    modifiers?: CartModifier[];
    totalPrice: number; // Calculated price including modifiers
}

interface PromoCode {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
}

interface CartStore {
    items: CartItem[];
    tableId: string | null;
    restaurantId: string | null;
    serviceCharge: number; // Percentage (e.g., 5 for 5%)
    vatRate: number; // Percentage (e.g., 16 for 16%)
    promoCode?: PromoCode;

    // Actions
    addItem: (item: Omit<CartItem, 'quantity' | 'totalPrice'>) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    updateNotes: (cartItemId: string, notes: string) => void;
    clearCart: () => void;
    setTable: (tableId: string, restaurantId: string) => void;
    applyPromoCode: (code: PromoCode) => void;
    removePromoCode: () => void;

    // Computed properties
    getTotalItems: () => number;
    getSubtotal: () => number;
    getServiceChargeAmount: () => number;
    getVatAmount: () => number;
    getPromoDiscount: () => number;
    getTotal: () => number;
    getItemPriceBreakdown: (cartItemId: string) => {
        base: number;
        modifiers: number;
        total: number;
    };
}

// Helper: Calculate item price with modifiers
const calculateItemPrice = (basePrice: number, modifiers?: CartModifier[]): number => {
    let total = basePrice;
    if (modifiers) {
        total += modifiers.reduce((sum, mod) => sum + mod.price, 0);
    }
    return total;
};

// Helper: Generate unique cart item ID
const generateCartItemId = (): string => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            tableId: null,
            restaurantId: null,
            serviceCharge: 5, // 5%
            vatRate: 16, // 16% for Kenya
            promoCode: undefined,

            addItem: (item) => {
                set((state) => {
                    // Check if identical item exists (same itemId, modifiers, and notes)
                    const existingIndex = state.items.findIndex(
                        (i) =>
                            i.itemId === item.itemId &&
                            JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
                            i.notes === item.notes
                    );

                    if (existingIndex !== -1) {
                        // Update quantity of existing item
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex].quantity += 1;
                        updatedItems[existingIndex].totalPrice =
                            calculateItemPrice(item.basePrice, item.modifiers) *
                            updatedItems[existingIndex].quantity;
                        return { items: updatedItems };
                    }

                    // Add new item
                    const newItem: CartItem = {
                        ...item,
                        id: generateCartItemId(),
                        quantity: 1,
                        totalPrice: calculateItemPrice(item.basePrice, item.modifiers),
                    };

                    return {
                        items: [...state.items, newItem],
                    };
                });
            },

            removeItem: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== cartItemId),
                }));
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity < 1) {
                    get().removeItem(cartItemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === cartItemId
                            ? {
                                ...i,
                                quantity,
                                totalPrice:
                                    calculateItemPrice(i.basePrice, i.modifiers) * quantity,
                            }
                            : i
                    ),
                }));
            },

            updateNotes: (cartItemId, notes) => {
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === cartItemId ? { ...i, notes } : i
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [], tableId: null, promoCode: undefined });
            },

            setTable: (tableId, restaurantId) => {
                set({ tableId, restaurantId });
            },

            applyPromoCode: (code) => {
                set({ promoCode: code });
            },

            removePromoCode: () => {
                set({ promoCode: undefined });
            },

            // Computed properties
            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
            },

            getServiceChargeAmount: () => {
                const subtotal = get().getSubtotal();
                return (subtotal * get().serviceCharge) / 100;
            },

            getVatAmount: () => {
                const subtotal = get().getSubtotal();
                const serviceCharge = get().getServiceChargeAmount();
                const taxableAmount = subtotal + serviceCharge;
                return (taxableAmount * get().vatRate) / 100;
            },

            getPromoDiscount: () => {
                const promo = get().promoCode;
                const subtotal = get().getSubtotal();

                if (!promo || subtotal < promo.minOrderAmount) return 0;

                if (promo.discountType === 'percentage') {
                    return (subtotal * promo.discountValue) / 100;
                } else {
                    return promo.discountValue;
                }
            },

            getTotal: () => {
                const subtotal = get().getSubtotal();
                const serviceCharge = get().getServiceChargeAmount();
                const vat = get().getVatAmount();
                const discount = get().getPromoDiscount();

                return subtotal + serviceCharge + vat - discount;
            },

            getItemPriceBreakdown: (cartItemId) => {
                const item = get().items.find((i) => i.id === cartItemId);
                if (!item) return { base: 0, modifiers: 0, total: 0 };

                const basePrice = item.basePrice * item.quantity;
                const modifiersPrice = item.modifiers
                    ? item.modifiers.reduce((sum, mod) => sum + mod.price, 0) * item.quantity
                    : 0;

                return {
                    base: basePrice,
                    modifiers: modifiersPrice,
                    total: item.totalPrice,
                };
            },
        }),
        {
            name: 'qr-eats-cart',
            skipHydration: true,
        }
    )
);
