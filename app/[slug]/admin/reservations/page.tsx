import { getAdminData, getTables, getReservations } from '@/lib/admin';
import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ReservationManagement } from '@/components/admin/ReservationManagement';

export default async function AdminReservationsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Security Check
    const { session } = await requireAdmin(slug);

    const { restaurant } = await getAdminData(slug);
    const tables = await getTables(restaurant.id);
    const reservations = await getReservations(restaurant.id);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900">
            <AdminSidebar restaurant={restaurant} />

            <main className="ml-72 flex-1 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
                            Administration <span className="w-1 h-1 bg-gray-300 rounded-full"></span> Bookings
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Reservations</h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage guest bookings, seating assignments, and visit history.</p>
                    </div>
                </header>

                <ReservationManagement
                    initialReservations={JSON.parse(JSON.stringify(reservations))}
                    restaurantId={restaurant.id}
                    availableTables={JSON.parse(JSON.stringify(tables))}
                />
            </main>
        </div>
    );
}
