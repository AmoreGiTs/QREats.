import { Suspense } from 'react';
import { LivePreviewCard, SocialProofCard, FeatureHighlightCard } from '@/components/demo/DemoVisuals';
import BookDemoForm from '@/components/demo/BookDemoForm';
import DemoHeader from '@/components/demo/DemoHeader';

export const metadata = {
    title: "QREats Demo | See How It Works",
    description: "Experience the restaurant management platform that helps you streamline operations, boost revenue, and delight customers.",
    openGraph: {
        title: "QREats Demo | Restaurant Management Platform",
        description: "Book a personalized demo to see how QREats can transform your restaurant operations.",
        type: "website",
    },
};

// Skeleton loaders
const CardSkeleton = () => (
    <div className="h-full bg-gray-900/50 border border-white/10 rounded-3xl animate-pulse">
        <div className="p-6 space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
    </div>
);

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-900 flex flex-col relative overflow-x-hidden selection:bg-orange-500/30">
            <DemoHeader />

            {/* Background Ambience - Optimized */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <main className="grow relative z-10 flex flex-col justify-center pt-32 pb-20 lg:pt-36 lg:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <span className="text-sm font-medium text-orange-400">✨ Live Demo Available</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-linear-to-br from-white via-white to-white/40 mb-6 tracking-tight">
                            Command Your Kitchen.
                            <br />
                            <span className="bg-linear-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
                                Effortlessly.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                            Experience the operating system that powers the world's most efficient restaurants.
                            Join thousands of restaurateurs who trust QREats to streamline operations,
                            boost revenue, and delight every guest.
                        </p>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">10,000+</span>
                                <span>Restaurants Served</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">98%</span>
                                <span>Customer Satisfaction</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">24/7</span>
                                <span>Support</span>
                            </div>
                        </div>
                    </div>

                    {/* BENTO GRID LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                        {/* 1. Main Form Block (Left/Top) - Spans 5 columns */}
                        <div className="lg:col-span-5">
                            <Suspense fallback={<CardSkeleton />}>
                                <BookDemoForm />
                            </Suspense>
                        </div>

                        {/* 2. Visuals Grid (Right) - Spans 7 columns */}
                        <div className="lg:col-span-7 grid grid-rows-2 gap-6">

                            {/* Top Row: Live Preview (Wide) */}
                            <div className="row-span-1 border border-white/10 rounded-3xl bg-gray-900/50 backdrop-blur-sm p-2 hover:border-orange-500/30 transition-colors duration-500">
                                <div className="h-full w-full rounded-2xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gray-900 z-0" />
                                    <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                                        <Suspense fallback={<div className="text-gray-400">Loading preview...</div>}>
                                            <LivePreviewCard />
                                        </Suspense>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row: Split 2 cards */}
                            <div className="row-span-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-full">
                                    <Suspense fallback={<CardSkeleton />}>
                                        <FeatureHighlightCard />
                                    </Suspense>
                                </div>
                                <div className="h-full">
                                    <Suspense fallback={<CardSkeleton />}>
                                        <SocialProofCard />
                                    </Suspense>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/10">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} QREats Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
