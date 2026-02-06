import { ReactNode } from 'react';

export const metadata = {
    title: 'Dashboard | QREats',
    description: 'Restaurant management dashboard',
};

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </div>
    );
}
