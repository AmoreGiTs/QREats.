'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStep {
    id: number;
    title: string;
    description: string;
}

const CHECKOUT_STEPS: CheckoutStep[] = [
    { id: 1, title: 'Review Order', description: 'Verify your items' },
    { id: 2, title: 'Payment', description: 'Choose payment method' },
    { id: 3, title: 'Confirmation', description: 'Order complete' },
];

interface CheckoutStepsProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export function CheckoutSteps({ currentStep, onStepClick }: CheckoutStepsProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {CHECKOUT_STEPS.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isClickable = onStepClick && currentStep > step.id;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => isClickable && onStepClick(step.id)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all relative',
                                        isCompleted && 'bg-restaurant-primary-600 text-white',
                                        isCurrent && 'bg-restaurant-primary-600 text-white ring-4 ring-restaurant-primary-100',
                                        !isCompleted && !isCurrent && 'bg-restaurant-neutral-200 text-restaurant-neutral-500',
                                        isClickable && 'cursor-pointer hover:scale-110'
                                    )}
                                >
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        >
                                            <Check className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        step.id
                                    )}

                                    {/* Pulse animation for current step */}
                                    {isCurrent && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-restaurant-primary-400"
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </button>

                                {/* Step Label */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            (isCompleted || isCurrent) && 'text-restaurant-neutral-900',
                                            !isCompleted && !isCurrent && 'text-restaurant-neutral-500'
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-restaurant-neutral-500 mt-0.5">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < CHECKOUT_STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 relative" style={{ marginTop: '-3rem' }}>
                                    <div className="absolute inset-0 bg-restaurant-neutral-200" />
                                    <motion.div
                                        className="absolute inset-0 bg-restaurant-primary-600 origin-left"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface CheckoutNavigationProps {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    isProcessing?: boolean;
}

export function CheckoutNavigation({
    currentStep,
    totalSteps,
    onNext,
    onBack,
    nextLabel = 'Continue',
    nextDisabled = false,
    isProcessing = false,
}: CheckoutNavigationProps) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-restaurant-neutral-200">
            {!isFirstStep ? (
                <button
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 text-restaurant-neutral-700 hover:bg-restaurant-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
            ) : (
                <div />
            )}

            <button
                onClick={onNext}
                disabled={nextDisabled || isProcessing}
                className={cn(
                    'flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    isLastStep
                        ? 'bg-restaurant-food-600 hover:bg-restaurant-food-700 text-white'
                        : 'bg-restaurant-primary-600 hover:bg-restaurant-primary-700 text-white'
                )}
            >
                {isProcessing ? (
                    <>
                        <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Processing...
                    </>
                ) : (
                    <>
                        {nextLabel}
                        {!isLastStep && <ChevronRight className="w-5 h-5" />}
                    </>
                )}
            </button>
        </div>
    );
}
