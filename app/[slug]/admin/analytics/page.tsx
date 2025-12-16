import { getAdminData } from '@/lib/admin';
import { getFinancialStats } from '@/lib/reporting';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { restaurant } = await getAdminData(slug);
    const stats = await getFinancialStats(restaurant.id);

    return (
        <AnalyticsDashboard
            initialStats={stats}
            restaurantSlug={slug}
        />
    );
}
