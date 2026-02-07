'use client';

import { motion } from 'framer-motion';
import {
    Zap,
    Shield,
    Layout,
    QrCode,
    ChefHat,
    BarChart3,
    Users,
    Smartphone
} from 'lucide-react';

const FEATURES = [
    {
        title: 'Touch-First QR Ordering',
        desc: 'Faster table turns with seamless QR scanning and instant M-Pesa payments.',
        icon: QrCode,
        color: 'bg-restaurant-food-50 text-restaurant-food-600'
    },
    {
        title: 'FIFO Inventory Logic',
        desc: 'Track every gram. Automatically deduct ingredients from the oldest batches first.',
        icon: Zap,
        color: 'bg-blue-50 text-blue-600'
    },
    {
        title: 'Kitchen Display System',
        desc: 'Zero-latency order sync between servers and kitchen with smart prioritization.',
        icon: ChefHat,
        color: 'bg-emerald-50 text-emerald-600'
    },
    {
        title: 'Multi-Location Admin',
        desc: 'Manage your entire franchise network from a single, unified dashboard.',
        icon: Layout,
        color: 'bg-purple-50 text-purple-600'
    },
    {
        title: 'Real-Time ROI Tracking',
        desc: 'Watch your margins in real-time. Automated food cost and waste reporting.',
        icon: BarChart3,
        color: 'bg-rose-50 text-rose-600'
    },
    {
        title: 'Staff Performance',
        desc: 'Built-in CRM and shift tracking to reward your top performers.',
        icon: Users,
        color: 'bg-amber-50 text-amber-600'
    }
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-restaurant-neutral-50 dark:bg-restaurant-cream relative overflow-hidden">
            {/* Subtle background grain or texture could go here */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-display font-black text-restaurant-neutral-900 dark:text-restaurant-neutral-900 mb-6">
                        Built for the <span className="text-restaurant-food-600">Art</span> of Hospitality
                    </h2>
                    <p className="text-lg text-restaurant-neutral-600 dark:text-restaurant-neutral-500 font-sans">
                        More than just tech. QREats is a complete operating system designed to
                        honor your craft while maximizing profitability.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 bg-white/60 dark:bg-restaurant-neutral-100/40 backdrop-blur-md rounded-[32px] border border-restaurant-neutral-200 dark:border-restaurant-neutral-300 shadow-sm hover:shadow-xl hover:shadow-restaurant-food-500/10 dark:hover:shadow-restaurant-food-500/20 transition-all group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${f.color.replace('blue', 'restaurant-food').replace('orange', 'restaurant-food')} flex items-center justify-center group-hover:scale-110 transition-transform font-bold shadow-sm`}>
                                    <f.icon className="w-7 h-7" />
                                </div>
                                {f.title.includes('ROI') && (
                                    <span className="px-2 py-1 bg-restaurant-food-100 text-restaurant-food-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-restaurant-food-200">
                                        Top Rated
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-restaurant-neutral-900 mb-4 font-display">{f.title}</h3>
                            <p className="text-restaurant-neutral-600 leading-relaxed font-medium">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
