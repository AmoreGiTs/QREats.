'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        content: "QREats reduced our table turn time by 15 minutes. The FIFO inventory is a game changer for our consistency.",
        author: "Chef Kamau",
        role: "Proprietor, The Terrace",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kamau"
    },
    {
        content: "The best ROI we've seen on any software. The M-Pesa integration makes checkout absolutely seamless for our guests.",
        author: "Sarah Omondi",
        role: "Manager, Coastal Flavors",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
        content: "Managing 4 locations used to be a nightmare. Now with the unified dashboard, I spend more time on growth.",
        author: "James Mwangi",
        role: "CEO, Java Grill Group",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
    }
];

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-white dark:bg-restaurant-cream transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-black text-restaurant-neutral-900 mb-6 font-display">
                        Trusted by Kenya's <br />
                        <span className="text-restaurant-food-500">Leading Restaurants</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={t.author}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[40px] bg-restaurant-neutral-50 dark:bg-restaurant-neutral-100 border border-restaurant-neutral-100 dark:border-restaurant-neutral-200 relative group hover:bg-restaurant-food-50 dark:hover:bg-restaurant-food-50/30 hover:border-restaurant-food-300 transition-all"
                        >
                            <div className="absolute -top-4 left-10 p-4 bg-restaurant-food-500 rounded-2xl shadow-lg shadow-restaurant-food-500/40 group-hover:scale-110 transition-transform">
                                <Quote className="text-white w-6 h-6 fill-white" />
                            </div>

                            <p className="text-lg text-restaurant-neutral-700 font-medium leading-relaxed mb-8 pt-4 italic font-sans">
                                "{t.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.author} className="w-14 h-14 rounded-2xl bg-white p-1 border border-restaurant-neutral-200" />
                                <div>
                                    <div className="font-bold text-restaurant-neutral-900 font-display">{t.author}</div>
                                    <div className="text-sm text-restaurant-neutral-500 font-semibold">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
