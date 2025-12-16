import { getWaiterMenu } from '@/lib/waiter';
import CustomerMenu from '@/components/customer/CustomerMenu';

export default async function CustomerOrderPage({ params }: { params: Promise<{ slug: string; tableId: string }> }) {
    const { slug, tableId } = await params;
    const { restaurant, menuItems } = await getWaiterMenu(slug);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="font-black text-xl tracking-tight text-gray-900">{restaurant.name}</h1>
                        <div className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1">
                            Table {tableId}
                        </div>
                    </div>
                    {/* Cart Icon Placeholder */}
                </div>
            </div>

            {/* Menu & Cart System */}
            <CustomerMenu
                restaurant={{ id: restaurant.id, name: restaurant.name, primaryColor: restaurant.primaryColor }}
                menuItems={menuItems}
                tableId={tableId}
            />
        </div>
    );
}
