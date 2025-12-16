'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsDashboard({ initialStats, restaurantSlug }: any) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    // Auto-refresh every 5 seconds for "Real-Time" feel
    useEffect(() => {
        const interval = setInterval(() => {
            startTransition(() => {
                router.refresh();
                setLastRefreshed(new Date());
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8 lg:p-12">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Performance</h1>
                    <p className="text-gray-500 font-medium">Live financial telemetry.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                        Updated {lastRefreshed.toLocaleTimeString()}
                    </span>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Main KPI: Profit */}
                <div className="lg:col-span-2 bg-black text-white p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-zinc-800 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/3 group-hover:bg-green-900 transition-colors duration-1000"></div>
                    <div className="relative z-10">
                        <div className="text-zinc-400 font-medium mb-1 flex items-center gap-2">
                            Net Profit
                            <span className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded-full">+Real-time</span>
                        </div>
                        <div className="text-6xl font-black tracking-tighter mb-4">
                            ${initialStats.profit.toFixed(2)}
                        </div>
                        <div className="flex gap-4">
                            <Badge label="Margin" value={`${initialStats.margin.toFixed(1)}%`} color="bg-zinc-800 text-green-400" />
                            <Badge label="Orders" value={initialStats.orderCount || '0'} color="bg-zinc-800 text-white" />
                        </div>
                    </div>
                </div>

                <StatCard
                    label="Revenue"
                    value={`$${initialStats.revenue.toFixed(2)}`}
                    trend="Gross Sales"
                    color="bg-white border-gray-100"
                />

                <StatCard
                    label="COGS"
                    value={`$${initialStats.cogs.toFixed(2)}`}
                    trend="FIFO Cost"
                    color="bg-red-50 border-red-100 text-red-900"
                    isNegative
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-96">
                {/* Visual Breakdown */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-end mb-8">
                        <h3 className="font-bold text-xl">Cost Breakdown</h3>
                        <div className="text-sm text-gray-400">Last 24 Hours</div>
                    </div>

                    {/* Custom Bar Chart Visualization */}
                    <div className="space-y-6">
                        <BarRow label="Revenue" value={initialStats.revenue} total={initialStats.revenue} color="bg-zinc-900" />
                        <BarRow label="Ingredients (COGS)" value={initialStats.cogs} total={initialStats.revenue} color="bg-red-500" />
                        <BarRow label="Net Profit" value={initialStats.profit} total={initialStats.revenue} color="bg-green-500" />
                    </div>
                </div>

                {/* Efficiency Score */}
                <div className="bg-blue-600 text-white p-8 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 transform scale-150"></div>
                    <div className="relative z-10">
                        <div className="text-blue-200 font-bold uppercase tracking-wider text-sm mb-2">Efficiency Score</div>
                        <div className="text-7xl font-black mb-2">{initialStats.margin > 20 ? 'A+' : initialStats.margin > 10 ? 'B' : 'C'}</div>
                        <p className="text-blue-100 text-sm max-w-[150px] mx-auto opacity-80">
                            Based on your current profit margins vs industry standard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, color, isNegative }: any) {
    return (
        <div className={`p-8 rounded-3xl border shadow-sm flex flex-col justify-between ${color}`}>
            <div className="text-sm font-bold opacity-60 uppercase tracking-wider">{label}</div>
            <div>
                <div className={`text-4xl font-black tracking-tight ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
                <div className="text-xs font-bold mt-2 opacity-50">{trend}</div>
            </div>
        </div>
    )
}

function Badge({ label, value, color }: any) {
    return (
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${color}`}>
            <span className="opacity-70">{label}</span>
            <span>{value}</span>
        </div>
    )
}

function BarRow({ label, value, total, color }: any) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="group">
            <div className="flex justify-between text-sm font-bold mb-2 text-gray-600 group-hover:text-black transition-colors">
                <span>{label}</span>
                <span>{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
