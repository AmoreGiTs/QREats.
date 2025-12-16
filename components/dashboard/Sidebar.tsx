'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Home,
    Menu,
    ShoppingCart,
    BarChart3,
    Settings,
    Bell,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Overview' },
    { href: '/dashboard/menu', icon: Menu, label: 'Menu' },
    { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-primary">
                        QR<span className="text-secondary">Eats</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Support & Notifications */}
                <div className="p-4 border-t space-y-2">
                    <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                        <HelpCircle className="w-5 h-5" />
                        <span>Help & Support</span>
                    </button>
                    <button className="relative flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
