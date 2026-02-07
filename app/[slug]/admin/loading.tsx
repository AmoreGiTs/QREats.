export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
            {/* Sidebar Skeleton */}
            <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 p-8 z-20">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="ml-72 flex-1 p-8 lg:p-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                            <div className="flex justify-between mb-4">
                                <div className="h-4 w-24 bg-gray-100 rounded" />
                                <div className="h-6 w-6 bg-gray-100 rounded-full" />
                            </div>
                            <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-16 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                    <div className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
