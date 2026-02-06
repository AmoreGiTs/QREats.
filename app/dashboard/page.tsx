'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingBag, Activity, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from "react";

// Types
interface DashboardStats {
    totalRevenue: number;
    revenueChange: number;
    activeOrders: number;
    ordersChange: number;
    activeTables: number;
    tablesAvailable: number;
    avgWaitTime: number;
    waitTimeChange: number;
}

interface RecentOrder {
    id: string;
    customer: string;
    table: string;
    amount: number;
    status: string;
    time: string;
}

interface ChartData {
    name: string;
    revenue: number;
    orders: number;
}

// Skeleton Components
const StatCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
        </CardContent>
    </Card>
);

const ChartSkeleton = () => (
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
);

// Data Fetchers
async function fetchDashboardStats(): Promise<DashboardStats> {
    const response = await fetch('/api/dashboard/stats');

    if (!response.ok) {
        // Return demo data if API is not available
        return {
            totalRevenue: 45231.89,
            revenueChange: 20.1,
            activeOrders: 12,
            ordersChange: 2,
            activeTables: 8,
            tablesAvailable: 4,
            avgWaitTime: 12,
            waitTimeChange: -2,
        };
    }

    return response.json();
}

async function fetchRecentOrders(): Promise<RecentOrder[]> {
    const response = await fetch('/api/dashboard/orders');

    if (!response.ok) {
        return [];
    }

    return response.json();
}

async function fetchChartData(): Promise<ChartData[]> {
    const response = await fetch('/api/dashboard/analytics');

    if (!response.ok) {
        // Demo data
        return [
            { name: 'Mon', revenue: 4200, orders: 24 },
            { name: 'Tue', revenue: 5100, orders: 32 },
            { name: 'Wed', revenue: 4800, orders: 28 },
            { name: 'Thu', revenue: 6200, orders: 38 },
            { name: 'Fri', revenue: 7500, orders: 45 },
            { name: 'Sat', revenue: 8900, orders: 52 },
            { name: 'Sun', revenue: 8100, orders: 48 },
        ];
    }

    return response.json();
}

export default function DashboardPage() {
    // Data queries with caching
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // 1 minute
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['recent-orders'],
        queryFn: fetchRecentOrders,
        staleTime: 30000,
    });

    const { data: chartData, isLoading: chartLoading } = useQuery({
        queryKey: ['chart-data'],
        queryFn: fetchChartData,
        staleTime: 60000,
    });

    // Calculated metrics
    const totalOrders = useMemo(() => {
        if (!chartData) return 0;
        return chartData.reduce((sum, day) => sum + day.orders, 0);
    }, [chartData]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 mt-1">Quick overview of your restaurant's performance</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Activity className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Error State */}
            {statsError && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-yellow-800">
                            <AlertCircle className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">Dashboard data unavailable</p>
                                <p className="text-sm">Showing demo data. Please check your connection.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">KES {stats?.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    {stats && stats.revenueChange >= 0 ? (
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 text-red-600" />
                                    )}
                                    <span className={stats && stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {stats?.revenueChange.toFixed(1)}%
                                    </span> from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeOrders}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{stats?.ordersChange} since last hour
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeTables}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.tablesAvailable} tables available
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.avgWaitTime}m</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.waitTimeChange}m from yesterday
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <p className="text-sm text-muted-foreground">Last 7 days</p>
                    </CardHeader>
                    <CardContent>
                        {chartLoading ? (
                            <ChartSkeleton />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#f97316"
                                        fill="#fed7aa"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Volume</CardTitle>
                        <p className="text-sm text-muted-foreground">Total: {totalOrders} orders</p>
                    </CardHeader>
                    <CardContent>
                        {chartLoading ? (
                            <ChartSkeleton />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#0ea5e9" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest transactions</p>
                </CardHeader>
                <CardContent>
                    {ordersLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-medium">{order.customer}</p>
                                            <p className="text-sm text-gray-500">Table {order.table} • {order.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">KES {order.amount.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'Completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent orders available
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
