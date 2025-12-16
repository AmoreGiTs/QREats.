import { getWaiterMenu } from '@/lib/waiter';
import { WaiterInterface } from '@/components/waiter/WaiterInterface';

export default async function WaiterPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { restaurant, menuItems } = await getWaiterMenu(slug);

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            <header
                className="p-4 text-white font-bold text-xl flex justify-between items-center shadow-md"
                style={{ backgroundColor: restaurant.primaryColor }}
            >
                <span>{restaurant.name} - Waiter Mode</span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded">Live</span>
            </header>

            <main className="flex-1 overflow-hidden">
                <WaiterInterface
                    restaurantId={restaurant.id}
                    menuItems={menuItems}
                />
            </main>
        </div>
    );
}
