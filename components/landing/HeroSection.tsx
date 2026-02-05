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
        <section className="relative min-h-svh flex items-center pt-24 md:pt-28 pb-20 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-orange-50/50 to-transparent rounded-bl-[100px]" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-linear-to-tr from-blue-50/30 to-transparent rounded-tr-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider">
                                Now serving 500+ restaurants
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight"
                        >
                            The OS for
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600 pb-2">
                                Modern Dining
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-lg"
                        >
                            QREats streamlines your restaurant operations from QR ordering to
                            AI-powered inventory. Increase efficiency by 40% and revenue by 25%.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/signup"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-700 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                    <Play className="w-4 h-4 text-orange-600 fill-orange-600" />
                                </div>
                                Book a Demo
                            </button>
                        </motion.div>
                    </div>

                    {/* Hero Visual / "Video" */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative aspect-square md:aspect-4/3 bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 flex items-center justify-center p-8 sm:p-12">
                            {/* Futuristic Video Player Background */}
                            <div className="absolute inset-0">
                                {/* Background Image with Overlay */}
                                {/* Background Image with Overlay */}
                                <Image
                                    src="/hero-bg.jpg"
                                    alt="Hero background"
                                    fill
                                    className="object-cover"
                                    priority
                                    quality={90}
                                />
                                <div className="absolute inset-0 bg-linear-to-br from-gray-900/90 via-gray-900/70 to-black/90" />

                                {/* Animated Grid Overlay */}
                                <motion.div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                                         linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                                        backgroundSize: '50px 50px'
                                    }}
                                    animate={{
                                        backgroundPosition: ['0px 0px', '50px 50px']
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                            </div>

                            {/* Center Content - Interactive Logo */}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <AnimatedLogo
                                    size="hero"
                                    variant="hero"
                                    isPlaying={isPlaying}
                                />

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="mt-8 text-xl font-bold text-gray-400 tracking-widest uppercase"
                                >
                                    Restaurant OS
                                </motion.p>
                            </div>

                            {/* Play/Pause Control */}
                            <div className="absolute bottom-8 right-8 z-20">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-orange-600 hover:scale-110 active:scale-95 transition-all"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 fill-current" />
                                    ) : (
                                        <Play className="w-6 h-6 fill-current pl-1" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Floating Elements - Revenue Stats */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 p-6 bg-white rounded-3xl shadow-xl border border-gray-100 hidden md:block z-30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-600 font-bold">↑</span>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-semibold mb-1">REVENUE INCREASE</div>
                                    <div className="text-xl font-black text-gray-900">+24.8%</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
