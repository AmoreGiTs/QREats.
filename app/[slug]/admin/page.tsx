import { getAdminData } from '@/lib/admin';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { refundOrder } from '@/app/actions/order';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Security Check
    const { session } = await requireAdmin(slug);

    const { restaurant, orders, inventory } = await getAdminData(slug);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount.toNumber(), 0);
    const lowStockCount = inventory.filter(i =>
        i.batches.reduce((s, b) => s + b.quantityRemaining.toNumber(), 0) < 20
    ).length;

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-gray-900">
            <AdminSidebar restaurant={restaurant} />

            {/* Main Content */}
            <main className="ml-72 flex-1 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                            Export Report
                        </button>
                        <a href={`/${restaurant.slug}/waiter`} target="_blank" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                            Open Tablet Mode ↗
                        </a>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Revenue"
                        value={`$${totalRevenue.toFixed(2)}`}
                        trend="+12.5%"
                        trendUp={true}
                        icon="💰"
                    />
                    <StatCard
                        title="Active Orders"
                        value={orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length.toString()}
                        trend="Live"
                        trendUp={true}
                        icon="🔥"
                    />
                    <StatCard
                        title="Low Stock Items"
                        value={lowStockCount.toString()}
                        trend="Action needed"
                        trendUp={false}
                        icon="⚠️"
                        type="warning"
                    />
                    <StatCard
                        title="Total Inventory"
                        value={inventory.length.toString()}
                        trend="Items tracked"
                        trendUp={true}
                        icon="📦"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Recent Orders Table */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Recent Orders</h3>
                            <button className="text-sm font-bold text-gray-400 hover:text-black">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-gray-500">#{order.id.slice(0, 6)}</td>
                                            <td className="px-6 py-4">
                                                <Badge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {order.items.length} items
                                                <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">
                                                    {order.items.map(i => i.menuItem.name).join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">${order.totalAmount.toNumber().toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                {order.status !== 'REFUNDED' && (
                                                    <form action={async () => {
                                                        'use server';
                                                        await refundOrder(order.id, restaurant.id);
                                                    }}>
                                                        <button className="text-gray-400 hover:text-red-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all bg-white border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg shadow-sm">
                                                            Refund Order
                                                        </button>
                                                    </form>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    No orders found. Use the Waiter Tablet Mode to simulate orders.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inventory Sidebar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-6">Inventory Status</h3>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                            {inventory.map(item => {
                                const total = item.batches.reduce((s, b) => s + b.quantityRemaining.toNumber(), 0);
                                const percent = Math.min(100, (total / 50) * 100); // Mock max of 50 for visualization

                                return (
                                    <div key={item.id} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">{item.name}</span>
                                            <span className={`text-sm font-mono font-bold ${total < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                                {total} <span className="text-gray-400 text-xs font-sans">{item.unit}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${total < 10 ? 'bg-red-500' : 'bg-black'}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.batches.length} active FIFO batches
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50">
                            <button className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all text-sm">
                                + Add Inventory Item
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
            ${active ? 'bg-black text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
            <span className="text-lg">{icon}</span>
            {label}
        </a>
    )
}

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: string;
    type?: 'default' | 'warning';
}

function StatCard({ title, value, trend, trendUp, icon, type = 'default' }: StatCardProps) {
    return (
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between h-32
            ${type === 'warning' ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start">
                <span className={`text-sm font-bold ${type === 'warning' ? 'text-orange-800' : 'text-gray-400'}`}>{title}</span>
                <span className="text-xl">{icon}</span>
            </div>
            <div>
                <div className={`text-3xl font-black ${type === 'warning' ? 'text-orange-900' : 'text-gray-900'}`}>{value}</div>
                <div className={`text-xs font-bold mt-1 ${trendUp ? 'text-green-500' : 'text-gray-400'}`}>
                    {trend}
                </div>
            </div>
        </div>
    )
}

function Badge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'PREPARING': 'bg-blue-100 text-blue-700 border-blue-200',
        'READY': 'bg-purple-100 text-purple-700 border-purple-200',
        'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
        'REFUNDED': 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}
