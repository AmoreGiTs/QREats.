'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-24 bg-white px-4">
            <div className="max-w-7xl mx-auto rounded-[60px] bg-linear-to-br from-orange-500 to-red-600 p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-orange-500/40">
                {/* Abstract background shapes */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
                <div className="absolute -bottom-24 -left-12 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-black/20 backdrop-blur-md rounded-full text-white font-bold text-sm mb-10"
                    >
                        <Zap size={16} className="fill-white" />
                        READY TO SCALE?
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                        Stop losing revenue to <br />
                        legacy systems.
                    </h2>

                    <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium max-w-2xl mx-auto">
                        Join 500+ modern restaurants already operating at peak efficiency
                        with QREats.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/auth/login?mode=register"
                            className="px-10 py-5 bg-white text-orange-600 rounded-[32px] font-black text-xl shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Start Free Trial
                            <ArrowRight size={24} />
                        </Link>
                        <button className="px-10 py-5 bg-black text-white rounded-[32px] font-black text-xl hover:bg-gray-900 active:scale-95 transition-all">
                            Book a Demo
                        </button>
                    </div>

                    <p className="mt-8 text-white/70 font-bold text-sm tracking-widest uppercase">
                        Start free for 14 days • No credit card required
                    </p>
                </div>
            </div>
        </section>
    );
}
