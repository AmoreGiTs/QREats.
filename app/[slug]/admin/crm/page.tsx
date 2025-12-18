import { getAdminData } from '@/lib/admin';
import { getCustomers } from '@/lib/crm';
import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CRMOverview } from '@/components/admin/CRMOverview';

export default async function AdminCRMPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Security Check
    const { session } = await requireAdmin(slug);

    const { restaurant } = await getAdminData(slug);
    const customers = await getCustomers(restaurant.id);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900">
            <AdminSidebar restaurant={restaurant} />

            <main className="ml-72 flex-1 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
                            Administration <span className="w-1 h-1 bg-gray-300 rounded-full"></span> CRM & Loyalty
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customer Relationship</h1>
                        <p className="text-gray-500 mt-2 text-lg">Understand your diners, reward loyalty, and drive repeat visits.</p>
                    </div>
                </header>

                <CRMOverview
                    initialCustomers={JSON.parse(JSON.stringify(customers))}
                />
            </main>
        </div>
    );
}
