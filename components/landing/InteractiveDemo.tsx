'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Tablet, Monitor, QrCode, ChefHat, BarChart3, ArrowRight } from 'lucide-react';

const STEPS = [
    {
        id: 'customer',
        title: 'Customer Orders',
        desc: 'Guests scan, browse, and pay in under 60 seconds.',
        icon: QrCode,
        mockup: 'customer'
    },
    {
        id: 'kitchen',
        title: 'Kitchen Prep',
        desc: 'Orders sync instantly with smart prep timers.',
        icon: ChefHat,
        mockup: 'kitchen'
    },
    {
        id: 'admin',
        title: 'Real-time Analytics',
        desc: 'Track sales and inventory as it happens.',
        icon: BarChart3,
        mockup: 'admin'
    }
];

export default function InteractiveDemo() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
                            See how QREats <br />
                            <span className="text-orange-600">Transforms</span> your workflow
                        </h2>

                        <div className="space-y-4">
                            {STEPS.map((step, i) => (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(i)}
                                    className={`w-full text-left p-6 rounded-[24px] border-2 transition-all ${activeStep === i
                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                        : 'border-gray-100 hover:border-gray-200 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${activeStep === i ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            <step.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${activeStep === i ? 'text-gray-900' : 'text-gray-600'}`}>{step.title}</h3>
                                            <p className={`mt-1 font-medium ${activeStep === i ? 'text-gray-700' : 'text-gray-500'}`}>{step.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-12">
                            <button className="inline-flex items-center gap-2 text-orange-600 font-bold hover:gap-3 transition-all">
                                Try it yourself <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full" />
                        <div className="relative aspect-4/3 bg-gray-900 rounded-[32px] shadow-2xl border-4 border-gray-800 p-4">
                            {/* Mockup content based on active step */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full w-full rounded-2xl bg-gray-800 p-6 overscroll-none overflow-hidden"
                                >
                                    {activeStep === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
                                                <QrCode className="text-gray-900 w-24 h-24" />
                                            </div>
                                            <div className="text-white">
                                                <div className="text-xl font-bold mb-2">Scan & Order</div>
                                                <div className="text-gray-400">Mobile-first ordering interface</div>
                                            </div>
                                            <div className="w-full h-12 bg-orange-600 rounded-xl animate-pulse" />
                                        </div>
                                    )}
                                    {activeStep === 1 && (
                                        <div className="h-full space-y-4">
                                            <div className="flex justify-between items-center text-white mb-6">
                                                <span className="font-bold">Active Orders</span>
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Live</span>
                                            </div>
                                            {[1, 2, 3].map(item => (
                                                <div key={item} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between">
                                                    <div className="h-4 w-32 bg-white/20 rounded-full" />
                                                    <div className="h-4 w-12 bg-orange-500/30 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeStep === 2 && (
                                        <div className="h-full flex flex-col">
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
                                                <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
                                            </div>
                                            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4">
                                                <div className="h-full w-full border-b border-l border-white/10 flex items-end">
                                                    <div className="w-1/4 h-[80%] bg-orange-500/40 rounded-t-lg mx-1" />
                                                    <div className="w-1/4 h-[60%] bg-orange-500/40 rounded-t-lg mx-1" />
                                                    <div className="w-1/4 h-[90%] bg-orange-500/40 rounded-t-lg mx-1" />
                                                    <div className="w-1/4 h-[40%] bg-orange-500/40 rounded-t-lg mx-1" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Floating Device Icons */}
                        <div className="absolute -bottom-6 -left-6 flex gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-400 active:text-orange-500 transition-colors cursor-pointer border border-gray-100">
                                <Smartphone size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-400 active:text-orange-500 transition-colors cursor-pointer border border-gray-100">
                                <Tablet size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-gray-400 active:text-orange-500 transition-colors cursor-pointer border border-gray-100">
                                <Monitor size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
