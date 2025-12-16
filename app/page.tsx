import Link from 'next/link';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center"><AnimatedLogo /></div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-black">Features</a>
            <a href="#" className="hover:text-black">Pricing</a>
            <a href="#" className="hover:text-black">Enterprise</a>
          </nav>
          <div className="flex gap-4">
            <Link href="/demo/waiter" className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-32 pb-24 px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-gray-900">
            The Operating System for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600">Modern Restaurants</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage inventory, orders, and multi-location operations with a single, intelligent platform.
            FIFO-accurate tracking, refunds that make sense, and AI-driven menu optimization.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/demo/waiter" className="bg-orange-600 text-white h-14 px-8 rounded-full font-bold flex items-center hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-200">
              Launch Waiter Demo
            </Link>
            <button className="bg-white text-gray-900 border border-gray-200 h-14 px-8 rounded-full font-bold flex items-center hover:border-gray-400 hover:bg-gray-50 transition-all">
              Contact Sales
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="FIFO Inventory"
              desc="Track every gram of ingredient. Deduct from the oldest batch first for accurate cost accounting."
              icon="📦"
            />
            <FeatureCard
              title="Multi-Tenant SaaS"
              desc="Manage franchises with ease. Complete data isolation per restaurant location."
              icon="🏢"
            />
            <FeatureCard
              title="Waiter Mode"
              desc="Touch-optimized interface for staff. Offline-capable and fast."
              icon="📱"
            />
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm border-t border-gray-800">
        <p>&copy; 2025 QREats SaaS. Built with Next.js 14 & Prisma.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
