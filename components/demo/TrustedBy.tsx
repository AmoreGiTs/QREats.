export default function TrustedBy() {
    return (
        <div className="border-t border-gray-100 bg-gray-50/50 py-12 lg:py-16">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                    Trusted by 3,000+ restaurants worldwide
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholders for logos - In a real app these would be Image components */}
                    <div className="text-2xl font-black text-gray-400">RESTO<span className="text-orange-500">BAR</span></div>
                    <div className="text-2xl font-serif font-bold text-gray-400">The Kitchen</div>
                    <div className="text-2xl font-mono font-bold text-gray-400">BURGER<span className="text-orange-500">KING</span></div>
                    <div className="text-2xl font-bold italic text-gray-400">Pizza<span className="text-orange-500">Hut</span></div>
                    <div className="text-2xl font-black text-gray-400">SUB<span className="text-green-500">WAY</span></div>
                </div>
            </div>
        </div>
    );
}
