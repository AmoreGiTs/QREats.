import { getAdminData, getTables } from '@/lib/admin';
import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { TableManagement } from '@/components/admin/TableManagement';

export default async function AdminTablesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Security Check
    const { session } = await requireAdmin(slug);
    
    const { restaurant } = await getAdminData(slug);
    const tables = await getTables(restaurant.id);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900">
            <AdminSidebar restaurant={restaurant} />

            <main className="ml-72 flex-1 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
                             Administration <span className="w-1 h-1 bg-gray-300 rounded-full"></span> Table Management
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tables & Layout</h1>
                        <p className="text-gray-500 mt-2 text-lg">Organize your physical space and track seating status in real-time.</p>
                    </div>
                </header>

                <TableManagement 
                    initialTables={JSON.parse(JSON.stringify(tables))} 
                    restaurantId={restaurant.id} 
                />
            </main>
        </div>
    );
}
