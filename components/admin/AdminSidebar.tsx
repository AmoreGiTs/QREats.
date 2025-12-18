'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Table as TableIcon,
    Calendar,
    Settings,
    ExternalLink
} from 'lucide-react';

interface AdminSidebarProps {
    restaurant: {
        name: string;
        slug: string;
        logoUrl?: string | null;
    };
}

export function AdminSidebar({ restaurant }: AdminSidebarProps) {
    const pathname = usePathname();
    const baseUrl = `/${restaurant.slug}/admin`;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: baseUrl },
        { icon: ShoppingBag, label: 'Orders', href: `${baseUrl}/orders` },
        { icon: Package, label: 'Inventory', href: `${baseUrl}/inventory` },
        { icon: TableIcon, label: 'Tables', href: `${baseUrl}/tables` },
        { icon: Calendar, label: 'Reservations', href: `${baseUrl}/reservations` },
        { icon: Users, label: 'Customers', href: `${baseUrl}/crm` },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-20">
            <div className="p-8">
                <div><AnimatedLogo /></div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Admin Console</div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group
                ${isActive
                                    ? 'bg-black text-white shadow-xl shadow-gray-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                        >
                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-gray-50">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg font-black text-gray-900 border border-gray-100">
                        {restaurant.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="font-bold text-sm truncate">{restaurant.name}</div>
                        <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Service Active
                        </div>
                    </div>
                </div>

                <Link
                    href={`/${restaurant.slug}/waiter`}
                    target="_blank"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-black hover:text-black transition-all"
                >
                    Waiter View <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </aside>
    );
}
