import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-restaurant-neutral-900 dark:bg-restaurant-neutral-50 text-white dark:text-restaurant-neutral-900 py-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <div className="mb-6">
                        <AnimatedLogo variant="hero" className="text-gray-900 dark:text-white" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        The operating system for modern restaurants. Scale your business with intelligent inventory,
                        seamless orders, and real-time analytics.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={20} /></a>
                    </div>
                </div>

                <div>
                    <h3 className="font-display font-bold mb-6 text-lg">Product</h3>
                    <ul className="space-y-3 text-sm text-restaurant-neutral-400 dark:text-restaurant-neutral-600">
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Features</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Pricing</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Integrations</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Enterprise</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-display font-bold mb-6 text-lg">Company</h3>
                    <ul className="space-y-3 text-sm text-restaurant-neutral-400 dark:text-restaurant-neutral-600">
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">About</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Blog</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Careers</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold mb-6">Support</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Help Center</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">API Docs</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Community</a></li>
                        <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Status</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-xs">
                    © 2025 QREats. All rights reserved.
                </p>
                <div className="flex gap-8">
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-xs">Privacy Policy</a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-xs">Terms of Service</a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-xs">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}
