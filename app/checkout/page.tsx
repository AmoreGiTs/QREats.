'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/lib/stores/cart-store';
import { CheckoutSteps, CheckoutNavigation } from '@/components/customer/CheckoutSteps';
import {
    PaymentMethodSelector,
    MpesaPaymentForm,
    CardPaymentForm,
    CashPaymentInfo,
    PaymentMethodType,
} from '@/components/customer/PaymentMethod';
import { ShoppingBag, MapPin, CreditCard, CheckCircle, User, Award } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const {
        items,
        getSubtotal,
        getServiceChargeAmount,
        getVatAmount,
        getTotal,
        getPromoDiscount,
        promoCode,
        clearCart,
        tableId,
        restaurantId,
    } = useCart();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0 && currentStep === 1) {
            router.push('/');
        }
    }, [items.length, currentStep, router]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePayment = async (paymentData?: any) => {
        setIsProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                items: items.map(item => ({
                    menuItemId: item.itemId,
                    quantity: item.quantity,
                    price: item.basePrice,
                    modifiers: item.modifiers,
                    notes: item.notes,
                })),
                tableId,
                restaurantId,
                paymentMethod: selectedPaymentMethod,
                totalAmount: getTotal(),
                subtotal: getSubtotal(),
                serviceCharge: getServiceChargeAmount(),
                vat: getVatAmount(),
                promoDiscount: getPromoDiscount(),
                promoCode: promoCode?.code,
                paymentData,
                customer: customerInfo,
            };

            // Submit order
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (result.success) {
                setOrderId(result.orderId);
                setCurrentStep(3); // Move to confirmation step

                // Clear cart after successful order
                setTimeout(() => {
                    clearCart();
                }, 1000);
            } else {
                throw new Error(result.error || 'Failed to create order');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(`Payment failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const canProceedToPayment = currentStep === 1;
    const canSubmitPayment = currentStep === 2 && selectedPaymentMethod !== null;

    return (
        <div className="min-h-screen bg-restaurant-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-restaurant-neutral-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-restaurant-neutral-900">Checkout</h1>
                    <p className="text-restaurant-neutral-600 mt-1">Complete your order</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white border-b border-restaurant-neutral-200">
                <div className="max-w-4xl mx-auto px-4">
                    <CheckoutSteps currentStep={currentStep} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Checkout Steps */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            {/* Step 1: Review Order */}
                            {currentStep === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-restaurant-primary-100 rounded-lg">
                                            <ShoppingBag className="w-6 h-6 text-restaurant-primary-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-restaurant-neutral-900">Review Your Order</h2>
                                            <p className="text-sm text-restaurant-neutral-600">
                                                Verify items before proceeding to payment
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 p-4 bg-restaurant-neutral-50 rounded-lg"
                                            >
                                                <div className="w-16 h-16 bg-restaurant-neutral-200 rounded-lg overflow-hidden shrink-0">
                                                    {item.image && (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-restaurant-neutral-900">{item.name}</h3>
                                                    {item.modifiers && item.modifiers.length > 0 && (
                                                        <p className="text-xs text-restaurant-neutral-600 mt-1">
                                                            {item.modifiers.map(m => m.name).join(', ')}
                                                        </p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-xs text-restaurant-neutral-600 italic mt-1">
                                                            Note: {item.notes}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-sm text-restaurant-neutral-600">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <span className="font-bold text-restaurant-primary-600">
                                                            KES {item.totalPrice.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Table Info */}
                                    {tableId && (
                                        <div className="mt-6 p-4 bg-restaurant-primary-50 rounded-lg flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-restaurant-primary-600" />
                                            <div>
                                                <p className="text-sm font-medium text-restaurant-primary-900">
                                                    Table: {tableId}
                                                </p>
                                                <p className="text-xs text-restaurant-primary-700">
                                                    Your order will be delivered to this table
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <CheckoutNavigation
                                        currentStep={currentStep}
                                        totalSteps={3}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        nextLabel="Proceed to Payment"
                                        nextDisabled={!canProceedToPayment}
                                    />
                                </motion.div>
                            )}

                            {/* Step 2: Payment */}
                            {currentStep === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-restaurant-primary-100 rounded-lg">
                                            <CreditCard className="w-6 h-6 text-restaurant-primary-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-restaurant-neutral-900">Payment Method</h2>
                                            <p className="text-sm text-restaurant-neutral-600">
                                                Choose how you'd like to pay
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer Info Form */}
                                    <div className="mb-8 p-6 bg-restaurant-neutral-50 rounded-2xl border border-restaurant-neutral-100">
                                        <h3 className="text-lg font-bold text-restaurant-neutral-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-restaurant-primary-600" />
                                            Customer Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-restaurant-neutral-500 uppercase tracking-wider mb-1">Your Name</label>
                                                <input
                                                    type="text"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-restaurant-neutral-200 focus:outline-none focus:ring-2 focus:ring-restaurant-primary-500 transition-all"
                                                    placeholder="e.g. John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-restaurant-neutral-500 uppercase tracking-wider mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-restaurant-neutral-200 focus:outline-none focus:ring-2 focus:ring-restaurant-primary-500 transition-all"
                                                    placeholder="e.g. 0712345678"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex items-center gap-3 border border-emerald-100">
                                            <Award className="w-5 h-5 text-emerald-600" />
                                            <div className="text-xs text-emerald-800 font-medium">
                                                You'll earn <span className="font-bold">{Math.floor(getTotal() / 100)} points</span> with this order!
                                            </div>
                                        </div>
                                    </div>

                                    <PaymentMethodSelector
                                        selectedMethod={selectedPaymentMethod}
                                        onSelectMethod={setSelectedPaymentMethod}
                                    />

                                    {/* Payment Forms */}
                                    {selectedPaymentMethod && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-6"
                                        >
                                            {selectedPaymentMethod === 'mpesa' && (
                                                <MpesaPaymentForm
                                                    onSubmit={(phone) => handlePayment({ phoneNumber: phone })}
                                                    isProcessing={isProcessing}
                                                />
                                            )}

                                            {selectedPaymentMethod === 'card' && (
                                                <CardPaymentForm
                                                    onSubmit={(cardData) => handlePayment(cardData)}
                                                    isProcessing={isProcessing}
                                                />
                                            )}

                                            {selectedPaymentMethod === 'cash' && (
                                                <CashPaymentInfo
                                                    onConfirm={() => handlePayment()}
                                                    isProcessing={isProcessing}
                                                    totalAmount={getTotal()}
                                                />
                                            )}
                                        </motion.div>
                                    )}

                                    {!selectedPaymentMethod && (
                                        <CheckoutNavigation
                                            currentStep={currentStep}
                                            totalSteps={3}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            nextLabel="Continue"
                                            nextDisabled={!canSubmitPayment}
                                        />
                                    )}
                                </motion.div>
                            )}

                            {/* Step 3: Confirmation */}
                            {currentStep === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="w-24 h-24 bg-restaurant-food-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <CheckCircle className="w-16 h-16 text-restaurant-food-600" />
                                    </motion.div>

                                    <h2 className="text-3xl font-bold text-restaurant-neutral-900 mb-3">
                                        Order Confirmed!
                                    </h2>
                                    <p className="text-restaurant-neutral-600 mb-2">
                                        Your order has been successfully placed
                                    </p>
                                    {orderId && (
                                        <p className="text-sm text-restaurant-neutral-500 mb-8">
                                            Order ID: <span className="font-mono font-bold">{orderId}</span>
                                        </p>
                                    )}

                                    <div className="bg-restaurant-primary-50 rounded-lg p-6 mb-8">
                                        <h3 className="font-bold text-restaurant-primary-900 mb-3">What's Next?</h3>
                                        <ul className="text-sm text-restaurant-primary-700 space-y-2 text-left max-w-md mx-auto">
                                            <li className="flex items-start gap-2">
                                                <span className="text-restaurant-primary-600 mt-0.5">✓</span>
                                                <span>Your order is being prepared by our kitchen</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-restaurant-primary-600 mt-0.5">✓</span>
                                                <span>You'll receive updates on your order status</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-restaurant-primary-600 mt-0.5">✓</span>
                                                <span>Estimated preparation time: 15-20 minutes</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => router.push('/')}
                                            className="px-6 py-3 bg-restaurant-neutral-200 text-restaurant-neutral-700 rounded-lg hover:bg-restaurant-neutral-300 transition-colors"
                                        >
                                            Back to Menu
                                        </button>
                                        <button
                                            onClick={() => router.push(`/orders/${orderId}`)}
                                            className="px-6 py-3 bg-restaurant-primary-600 text-white rounded-lg hover:bg-restaurant-primary-700 transition-colors"
                                        >
                                            Track Order
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h3 className="font-bold text-lg text-restaurant-neutral-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 pb-4 border-b border-restaurant-neutral-200">
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
                            </div>

                            <div className="pt-4">
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span className="text-restaurant-primary-600">KES {getTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
