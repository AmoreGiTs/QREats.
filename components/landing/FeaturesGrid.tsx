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
        color: 'bg-orange-100 text-orange-600'
    },
    {
        title: 'FIFO Inventory Logic',
        desc: 'Track every gram. Automatically deduct ingredients from the oldest batches first.',
        icon: Zap,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        title: 'Kitchen Display System',
        desc: 'Zero-latency order sync between servers and kitchen with smart prioritization.',
        icon: ChefHat,
        color: 'bg-green-100 text-green-600'
    },
    {
        title: 'Multi-Location Admin',
        desc: 'Manage your entire franchise network from a single, unified dashboard.',
        icon: Layout,
        color: 'bg-purple-100 text-purple-600'
    },
    {
        title: 'Real-Time ROI Tracking',
        desc: 'Watch your margins in real-time. Automated food cost and waste reporting.',
        icon: BarChart3,
        color: 'bg-rose-100 text-rose-600'
    },
    {
        title: 'Staff Performance',
        desc: 'Built-in CRM and shift tracking to reward your top performers.',
        icon: Users,
        color: 'bg-amber-100 text-amber-600'
    }
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-black text-gray-900 mb-6">
                        Built for the <span className="text-orange-600">Speed</span> of Modern Business
                    </h2>
                    <p className="text-lg text-gray-600">
                        More than just a POS. QREats is a complete operating system designed to
                        reduce waste and maximize your restaurant's profitability.
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
                            className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform font-bold`}>
                                <f.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
