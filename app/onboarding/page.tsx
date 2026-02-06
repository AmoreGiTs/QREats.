'use client';

import { useActionState, useState, useEffect, useCallback } from 'react';
import { createRestaurant } from '@/app/actions/onboarding';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { Check, X, AlertCircle } from 'lucide-react';

const initialState = { message: '' };

export default function OnboardingPage() {
    const [state, formAction, isPending] = useActionState(createRestaurant, initialState);
    const [slug, setSlug] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [debouncing, setDebouncing] = useState(false);
    const [brandColor, setBrandColor] = useState('#000000');

    // Debounced slug availability check
    const checkSlugAvailability = useCallback(async (value: string) => {
        if (!value || value.length < 3) return;

        setDebouncing(true);
        try {
            const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(value)}`);
            const data = await response.json();
            setSlugAvailable(data.available);
        } catch (error) {
            console.error('Slug check failed:', error);
            setSlugAvailable(null);
        } finally {
            setDebouncing(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (slug.trim().length >= 3) {
                checkSlugAvailability(slug.trim());
            } else {
                setSlugAvailable(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, checkSlugAvailability]);

    const colorPresets = [
        '#000000', '#1e3a8a', '#059669', '#dc2626',
        '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'
    ];

    return (
        <div className="min-h-screen flex bg-white font-sans">
            <div className="hidden lg:flex w-1/2 bg-black text-white p-16 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <div className="mb-8">
                        <AnimatedLogo className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Build your restaurant's
                        <br />
                        <span className="bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            digital backbone.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Join thousands of forward-thinking restaurateurs using QREats.
                    </p>
                </div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3" />
                </div>
                <div className="z-10 text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} QREats Inc.
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50 lg:bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
                        <p className="text-gray-500 mt-2">Create your dedicated workspace in seconds.</p>
                    </div>

                    <form action={formAction} className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-semibold text-gray-700 block">
                                Restaurant Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                                placeholder="e.g. The Burger Joint"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-semibold text-gray-700 block">
                                Workspace URL
                            </label>
                            <div className="flex">
                                <span className="bg-gray-100 border border-r-0 px-4 py-3 rounded-l-xl text-gray-500">
                                    qreats.app/
                                </span>
                                <div className="relative flex-1">
                                    <input
                                        id="slug"
                                        name="slug"
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        className="flex-1 px-4 py-3 bg-white border border-l-0 rounded-r-xl w-full"
                                        placeholder="your-brand"
                                    />
                                    {slug.length > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {debouncing ? (
                                                <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                            ) : slugAvailable === true ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : slugAvailable === false ? (
                                                <X className="w-5 h-5 text-red-600" />
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {slug.length > 0 && slugAvailable !== null && (
                                <p className={`text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {slugAvailable ? '✓ Available' : '✗ Taken'}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="primaryColor" className="text-sm font-semibold text-gray-700 block">
                                Brand Color
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="primaryColor"
                                    name="primaryColor"
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="w-12 h-12 rounded-xl cursor-pointer"
                                />
                                <div className="grid grid-cols-8 gap-2 flex-1">
                                    {colorPresets.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setBrandColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 ${brandColor === color ? 'border-black scale-110' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select ${color}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                                Owner Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                                placeholder="owner@restaurant.com"
                            />
                        </div>

                        {state?.message && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">
                                <AlertCircle className="w-5 h-5 shrink-0 inline mr-2" />
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending || (slug.length > 0 && slugAvailable === false)}
                            className="w-full bg-black text-white h-14 rounded-xl font-bold hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending ? 'Creating...' : 'Create Workspace →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
