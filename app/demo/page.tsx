import { LivePreviewCard, SocialProofCard, FeatureHighlightCard } from '@/components/demo/DemoVisuals';
import BookDemoForm from '@/components/demo/BookDemoForm';
import DemoHeader from '@/components/demo/DemoHeader';

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-900 flex flex-col relative overflow-x-hidden selection:bg-orange-500/30">
            <DemoHeader />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <main className="grow relative z-10 flex flex-col justify-center pt-32 pb-20 lg:pt-36 lg:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">

                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-br from-white via-white to-white/40 mb-6 tracking-tight">
                            Command Your Kitchen.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                            Experience the operating system that powers the world's most efficient restaurants.
                            <span className="text-orange-500 font-semibold ml-2">Book your personalized tour today.</span>
                        </p>
                    </div>

                    {/* BENTO GRID LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-auto lg:h-[700px]">

                        {/* 1. Main Form Block (Left/Top) - Spans 5 columns */}
                        <div className="lg:col-span-5 h-[700px] lg:h-full">
                            <BookDemoForm />
                        </div>

                        {/* 2. Visuals Grid (Right) - Spans 7 columns */}
                        <div className="lg:col-span-7 grid grid-rows-2 gap-6 h-[700px] lg:h-full">

                            {/* Top Row: Live Preview (Wide) */}
                            <div className="row-span-1 border border-white/10 rounded-3xl bg-gray-900/50 backdrop-blur-sm p-2 hover:border-orange-500/30 transition-colors duration-500">
                                <div className="h-full w-full rounded-2xl overflow-hidden relative">
                                    {/* Abstract UI Representation */}
                                    <div className="absolute inset-0 bg-gray-900 z-0" />
                                    <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                                        <LivePreviewCard />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row: Split 2 cards */}
                            <div className="row-span-1 grid grid-cols-2 gap-6">
                                <div className="h-full">
                                    <FeatureHighlightCard />
                                </div>
                                <div className="h-full">
                                    <SocialProofCard />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
