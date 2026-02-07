'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Pause, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

export default function HeroSection() {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <section className="relative min-h-svh flex items-center pt-24 md:pt-28 pb-20 overflow-hidden bg-restaurant-cream dark:bg-restaurant-neutral-900 transition-colors duration-300">
            {/* Organic Background Elements */}
            <div className="absolute inset-0 z-0 opacity-60">
                <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[70%] bg-restaurant-food-300/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-restaurant-food-500/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="max-w-2xl">
                        {/* Marketing Tag */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-restaurant-food-500 text-white shadow-lg shadow-restaurant-food-500/30 dark:shadow-restaurant-food-500/50 mb-8 border border-white/20"
                        >
                            <Sparkles className="w-4 h-4 text-white fill-white" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                #1 Restaurant OS in Kenya
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-restaurant-neutral-900 dark:text-restaurant-neutral-900 mb-6 leading-[1.05] tracking-tight"
                        >
                            Turn Tables
                            <span className="block text-restaurant-food-500">
                                3x Faster.
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-restaurant-neutral-600 dark:text-restaurant-neutral-500 mb-10 leading-relaxed max-w-lg font-sans font-medium"
                        >
                            The all-in-one platform for modern hospitality. QR ordering, inventory tracking, and M-Pesa payments—unified.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/auth/login?mode=register"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-restaurant-food-500 text-white rounded-2xl font-bold shadow-xl shadow-restaurant-food-500/40 hover:bg-restaurant-food-600 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-restaurant-neutral-200 text-restaurant-neutral-700 rounded-2xl font-bold hover:bg-restaurant-neutral-50 hover:border-restaurant-neutral-300 transition-all active:scale-95 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-restaurant-food-50 flex items-center justify-center group-hover:bg-restaurant-food-300/30 transition-colors">
                                    <Play className="w-4 h-4 text-restaurant-food-500 fill-restaurant-food-500" />
                                </div>
                                View Demo
                            </button>
                        </motion.div>
                    </div>

                    {/* Hero Visual / "Video" */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, duration: 1, type: "spring" }}
                        className="relative"
                    >
                        <div className="relative aspect-square md:aspect-4/3 bg-restaurant-neutral-900 rounded-[40px] shadow-2xl shadow-restaurant-neutral-900/20 overflow-hidden border-[6px] border-white flex items-center justify-center p-8 sm:p-12 ring-1 ring-restaurant-neutral-200">
                            {/* Cinematic Background */}
                            <div className="absolute inset-0">
                                <Image
                                    src="/hero-bg.jpg"
                                    alt="Fine dining atmosphere"
                                    fill
                                    className="object-cover opacity-80"
                                    priority
                                    quality={90}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-restaurant-neutral-900 via-restaurant-neutral-900/40 to-transparent" />
                            </div>

                            {/* Center Content - Interactive Logo */}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
                                    <AnimatedLogo
                                        size="hero"
                                        variant="hero"
                                        isPlaying={isPlaying}
                                    />
                                </div>
                            </div>

                            {/* Play/Pause Control */}
                            <div className="absolute bottom-8 right-8 z-20">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center text-restaurant-food-600 hover:scale-110 active:scale-95 transition-all"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 fill-current" />
                                    ) : (
                                        <Play className="w-6 h-6 fill-current pl-1" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Floating Stats Card - Refined */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 p-5 bg-white rounded-2xl shadow-xl shadow-restaurant-neutral-500/10 border border-restaurant-neutral-100 hidden md:block z-30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-restaurant-food-50 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-restaurant-food-600" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-restaurant-neutral-500 font-bold tracking-wider uppercase mb-1">Monthly Revenue</div>
                                    <div className="text-xl font-display font-bold text-restaurant-neutral-900 flex items-center gap-2">
                                        KES 4.2M
                                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md font-bold">+18%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
