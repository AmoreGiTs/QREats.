'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
    {
        name: 'Starter',
        price: '9,900',
        desc: 'Perfect for small cafes & bistros',
        features: ['Up to 100 orders/day', 'QR Ordering PWA', 'Basic Inventory', 'M-Pesa Integration', 'Email Support'],
        cta: 'Start Free Trial',
        popular: false
    },
    {
        name: 'Pro',
        price: '24,900',
        desc: 'For high-volume restaurants',
        features: ['Unlimited Orders', 'FIFO Ingredient Tracking', 'Multi-Terminal KDS', 'Advanced Analytics', '24/7 Priority Support'],
        cta: 'Get Started Pro',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        desc: 'For franchises & large groups',
        features: ['Custom Integrations', 'Multi-Unit Dashboard', 'White-labeling', 'Dedicated Success Manager', 'On-site Training'],
        cta: 'Book a Demo',
        popular: false
    }
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-gray-900 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 text-white">
                    <h2 className="text-4xl font-black mb-6">
                        Everything you need, <br />
                        <span className="text-orange-500">Simple Pricing</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Start free for 14 days. No credit card required. Upgrade or downgrade anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-10 rounded-[40px] border-2 transition-all relative ${plan.popular
                                ? 'bg-white border-orange-500 shadow-2xl shadow-orange-500/20 scale-105 z-20'
                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                                    <Star size={12} fill="white" /> Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-gray-900' : 'text-white'}`}>{plan.name}</h3>
                                <p className={`text-sm ${plan.popular ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>{plan.desc}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-sm font-bold ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.price !== 'Custom' ? 'KES' : ''}</span>
                                    <span className={`text-5xl font-black ${plan.popular ? 'text-gray-900' : 'text-white'}`}>{plan.price}</span>
                                    <span className={`text-sm font-medium ${plan.popular ? 'text-gray-500' : 'text-gray-400'}`}>{plan.price !== 'Custom' ? '/mo' : ''}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${plan.popular ? 'bg-orange-100 text-orange-600' : 'bg-gray-700 text-gray-300'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm font-semibold ${plan.popular ? 'text-gray-700' : 'text-gray-300'}`}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95'
                                }`}>
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
