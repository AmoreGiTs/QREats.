'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Header() {
    const { scrollY } = useScroll();
    const [isHidden, setIsHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
    });

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: isHidden ? -200 : 0,
                    opacity: isHidden ? 0 : 1
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white/80 dark:bg-gray-950/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full pl-6 pr-3 py-2.5 shadow-2xl flex items-center justify-between pointer-events-auto w-[95%] md:w-[90%] lg:w-[80%] max-w-7xl transition-colors duration-300"
            >
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center transition-transform hover:scale-105 active:scale-95">
                        <AnimatedLogo />
                    </Link>

                    <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
                        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Enterprise</a>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-2 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 dark:shadow-white/5"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </motion.div>
        </header>
    );
}
