'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, Check, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PaymentMethodType = 'mpesa' | 'card' | 'cash';

interface PaymentMethod {
    id: PaymentMethodType;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    processingTime: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'mpesa',
        name: 'M-Pesa',
        description: 'Pay with your M-Pesa mobile money',
        icon: <Smartphone className="w-6 h-6" />,
        enabled: true,
        processingTime: 'Instant',
    },
    {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Amex',
        icon: <CreditCard className="w-6 h-6" />,
        enabled: true,
        processingTime: 'Instant',
    },
    {
        id: 'cash',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: <Banknote className="w-6 h-6" />,
        enabled: true,
        processingTime: 'On delivery',
    },
];

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethodType | null;
    onSelectMethod: (method: PaymentMethodType) => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-restaurant-primary-600" />
                <p className="text-sm text-restaurant-neutral-600">
                    All payments are secured with 256-bit SSL encryption
                </p>
            </div>

            <div className="grid gap-4">
                {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;

                    return (
                        <motion.button
                            key={method.id}
                            onClick={() => method.enabled && onSelectMethod(method.id)}
                            disabled={!method.enabled}
                            whileHover={method.enabled ? { scale: 1.02 } : {}}
                            whileTap={method.enabled ? { scale: 0.98 } : {}}
                            className={cn(
                                'relative p-6 border-2 rounded-xl text-left transition-all',
                                isSelected && 'border-restaurant-primary-600 bg-restaurant-primary-50',
                                !isSelected && method.enabled && 'border-restaurant-neutral-200 hover:border-restaurant-primary-300',
                                !method.enabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className={cn(
                                        'p-3 rounded-lg',
                                        isSelected && 'bg-restaurant-primary-600 text-white',
                                        !isSelected && 'bg-restaurant-neutral-100 text-restaurant-neutral-600'
                                    )}
                                >
                                    {method.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg text-restaurant-neutral-900">{method.name}</h3>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 bg-restaurant-primary-600 rounded-full flex items-center justify-center"
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className="text-sm text-restaurant-neutral-600 mt-1">{method.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-xs text-restaurant-neutral-500">
                                            Processing: {method.processingTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Selected Border Animation */}
                            {isSelected && (
                                <motion.div
                                    layoutId="payment-method-border"
                                    className="absolute inset-0 border-2 border-restaurant-primary-600 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

interface MpesaPaymentFormProps {
    onSubmit: (phoneNumber: string) => void;
    isProcessing: boolean;
}

export function MpesaPaymentForm({ onSubmit, isProcessing }: MpesaPaymentFormProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validatePhoneNumber = (phone: string): boolean => {
        // Kenyan phone number validation
        const cleaned = phone.replace(/\D/g, '');
        return /^(254|0)?[17]\d{8}$/.test(cleaned);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid Kenyan phone number');
            return;
        }

        onSubmit(phoneNumber);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="mpesa-phone" className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                    M-Pesa Phone Number
                </label>
                <input
                    id="mpesa-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setError(null);
                    }}
                    placeholder="0712345678 or 254712345678"
                    className={cn(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none',
                        error && 'border-red-500'
                    )}
                    disabled={isProcessing}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </p>
                )}
            </div>

            <div className="bg-restaurant-primary-50 border border-restaurant-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-restaurant-primary-900 mb-2">How it works:</h4>
                <ol className="text-sm text-restaurant-primary-700 space-y-1 list-decimal list-inside">
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>You'll receive an STK push notification</li>
                    <li>Enter your M-Pesa PIN to complete payment</li>
                    <li>Receive instant confirmation</li>
                </ol>
            </div>

            <Button
                type="submit"
                disabled={isProcessing || !phoneNumber}
                className="w-full py-3 bg-restaurant-primary-600 hover:bg-restaurant-primary-700 text-white font-bold"
            >
                {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
            </Button>
        </form>
    );
}

interface CardPaymentFormProps {
    onSubmit: (cardData: any) => void;
    isProcessing: boolean;
}

export function CardPaymentForm({ onSubmit, isProcessing }: CardPaymentFormProps) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.slice(0, 19); // 16 digits + 3 spaces
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate,
            cvv,
            cardholderName,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                    Card Number
                </label>
                <input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none"
                    disabled={isProcessing}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="expiry-date" className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                        Expiry Date
                    </label>
                    <input
                        id="expiry-date"
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none"
                        disabled={isProcessing}
                    />
                </div>

                <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                        CVV
                    </label>
                    <input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none"
                        disabled={isProcessing}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="cardholder-name" className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                    Cardholder Name
                </label>
                <input
                    id="cardholder-name"
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="JOHN DOE"
                    className="w-full px-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent outline-none uppercase"
                    disabled={isProcessing}
                />
            </div>

            <Button
                type="submit"
                disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName}
                className="w-full py-3 bg-restaurant-primary-600 hover:bg-restaurant-primary-700 text-white font-bold"
            >
                {isProcessing ? 'Processing...' : 'Pay with Card'}
            </Button>
        </form>
    );
}

interface CashPaymentInfoProps {
    onConfirm: () => void;
    isProcessing: boolean;
    totalAmount: number;
}

export function CashPaymentInfo({ onConfirm, isProcessing, totalAmount }: CashPaymentInfoProps) {
    return (
        <div className="space-y-4">
            <div className="bg-restaurant-accent-50 border border-restaurant-accent-200 rounded-lg p-6">
                <h4 className="font-bold text-restaurant-accent-900 mb-3 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Cash Payment Instructions
                </h4>
                <div className="space-y-2 text-sm text-restaurant-accent-700">
                    <p>• Your order will be prepared immediately</p>
                    <p>• Please have exact change ready: <strong>KES {totalAmount.toFixed(2)}</strong></p>
                    <p>• Payment is due upon order collection</p>
                    <p>• Our staff will confirm your payment at the counter</p>
                </div>
            </div>

            <div className="bg-restaurant-neutral-50 border border-restaurant-neutral-200 rounded-lg p-4">
                <p className="text-sm text-restaurant-neutral-600">
                    <strong>Note:</strong> By confirming, you agree to pay the total amount in cash when collecting your order.
                </p>
            </div>

            <Button
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full py-3 bg-restaurant-primary-600 hover:bg-restaurant-primary-700 text-white font-bold"
            >
                {isProcessing ? 'Confirming...' : 'Confirm Cash Payment'}
            </Button>
        </div>
    );
}
