'use client';

import { useActionState } from 'react';
import { createRestaurant } from '@/app/actions/onboarding';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

const initialState = {
    message: '',
};

export default function OnboardingPage() {
    const [state, formAction, isPending] = useActionState(createRestaurant, initialState);

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left: Branding & Context */}
            <div className="hidden lg:flex w-1/2 bg-black text-white p-16 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <div className="mb-8"><AnimatedLogo className="text-white" /></div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Build your restaurant's <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
                            digital backbone.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Join thousands of forward-thinking restaurateurs using QREats to manage inventory, eliminate waste, and delight guests.
                    </p>
                </div>

                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-10 translate-y-1/3 -translate-x-1/4"></div>

                <div className="z-10 space-y-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-xs">👤</div>
                            ))}
                        </div>
                        <span>Trusted by modern teams worldwide</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        &copy; 2024 QREats Inc.
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
                        <p className="text-gray-500 mt-2">Create your dedicated workspace in seconds.</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Restaurant Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                placeholder="e.g. The Burger Joint"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Workspace URL</label>
                            <div className="flex group focus-within:ring-2 focus-within:ring-black rounded-xl transition-all">
                                <span className="bg-gray-100 border border-r-0 border-gray-200 px-4 py-3 rounded-l-xl text-gray-500 font-medium select-none text-sm flex items-center">
                                    qreats.app/
                                </span>
                                <input
                                    name="slug"
                                    type="text"
                                    required
                                    className="flex-1 px-4 py-3 bg-white border border-l-0 border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none"
                                    placeholder="your-brand"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    name="primaryColor"
                                    type="color"
                                    defaultValue="#000000"
                                    className="w-12 h-12 p-1 rounded-xl cursor-copy border border-gray-200"
                                />
                                <span className="text-sm text-gray-500">Pick a color for your dashboard & tablets</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Owner Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                placeholder="owner@restaurant.com"
                            />
                        </div>

                        {state?.message && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                                <span>⚠️</span> {state.message}
                            </div>
                        )}

                        <button
                            disabled={isPending}
                            className="w-full bg-black text-white h-14 rounded-xl font-bold text-lg hover:bg-gray-900 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 flex items-center justify-center"
                        >
                            {isPending ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Create Workspace →'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
