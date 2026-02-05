'use client';

import { motion } from 'framer-motion';
import { ChefHat, ShoppingBag, Utensils, Bell, Users, TrendingUp } from 'lucide-react';

export function LivePreviewCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative h-full w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 overflow-hidden flex flex-col justify-between group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Live Monitoring</h3>
                        <p className="text-white/40 text-xs">Kitchen Display System</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 text-xs font-mono">ONLINE</span>
                </div>
            </div>

            {/* Mock Notifications */}
            <div className="space-y-3 relative z-10">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <ShoppingBag size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">New Order #2045</p>
                        <p className="text-white/40 text-xs">Table 4 • $45.00</p>
                    </div>
                    <span className="text-white/20 text-xs">Just now</span>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3 opacity-60">
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                        <ChefHat size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Order #2042 Ready</p>
                        <p className="text-white/40 text-xs">Chef Mike updated status</p>
                    </div>
                    <span className="text-white/20 text-xs">2m ago</span>
                </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
}

export function SocialProofCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative h-full w-full bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-center items-center text-center overflow-hidden"
        >
            <div className="absolute inset-0 bg-linear-to-tr from-orange-500/10 via-transparent to-transparent opacity-50" />

            <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Users size={20} className="text-orange-500" />
                    <span className="text-white/60 text-sm font-medium">Guests Served Today</span>
                </div>
                <div className="text-5xl font-black text-white tracking-tighter mb-2">
                    12,450
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-green-500 text-xs font-bold">+14% vs last week</span>
                </div>
            </div>
        </motion.div>
    );
}

export function FeatureHighlightCard() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="h-full bg-linear-to-br from-orange-600 to-orange-700 rounded-3xl p-6 text-white flex flex-col justify-center relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Utensils size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Smart Menu</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                    AI-optimized menu engineering that boosts your average order value automatically.
                </p>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        </motion.div>
    )
}
