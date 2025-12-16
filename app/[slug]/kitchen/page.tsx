import { getKitchenOrders } from '@/app/actions/kitchen';
import { KitchenBoard } from '@/components/kitchen/KitchenBoard';
import { requireAuth } from '@/lib/auth-guards';

export default async function KitchenPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Security Check (Kitchen staff + Managers/Owners)
    await requireAuth(slug, ['KITCHEN', 'OWNER', 'MANAGER']);

    const { restaurant, orders } = await getKitchenOrders(slug);

    return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans p-4">
            <header className="flex justify-between items-center mb-6 px-2">
                <h1 className="text-2xl font-black tracking-tight">
                    {restaurant.name} <span className="text-orange-500">KDS</span>
                </h1>
                <div className="flex gap-4 text-sm font-bold text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        Live Feed
                    </div>
                    <div>{new Date().toLocaleTimeString()}</div>
                </div>
            </header>

            <KitchenBoard
                initialOrders={orders}
                restaurantId={restaurant.id}
                slug={restaurant.slug}
            />
        </div>
    );
}
