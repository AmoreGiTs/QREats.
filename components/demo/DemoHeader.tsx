'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function DemoHeader() {
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
                className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full pl-6 pr-3 py-3 shadow-2xl flex items-center justify-between pointer-events-auto w-[60%] max-w-5xl"
            >
                <Link href="/" className="flex items-center scale-90">
                    <AnimatedLogo />
                </Link>

                <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-auto" />

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors px-3"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </motion.div>
        </header>
    );
}
