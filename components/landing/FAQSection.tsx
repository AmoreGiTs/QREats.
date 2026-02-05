'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
    {
        q: "How fast can we go live?",
        a: "Most restaurants go live in under 48 hours. Our team handles your initial menu upload and staff training sessions."
    },
    {
        q: "Does it work offline?",
        a: "Yes! Our PWA and KDS have specialized offline sync. Orders are cached locally and synced the moment connectivity is restored."
    },
    {
        q: "What hardware do I need?",
        a: "QREats runs on any modern browser. You can use iPads, Android tablets, or even your existing POS screens. No proprietary hardware required."
    },
    {
        q: "How does the FIFO inventory work?",
        a: "When you receive stock, you log the batch date. As orders are fulfilled, QREats automatically deducts from the oldest batch, giving you precise COGS reporting."
    },
    {
        q: "Is M-Pesa integration built-in?",
        a: "Absolutely. We support M-Pesa STK Push directly from the customer's phone for instant, verified payments."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-1">
                        <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                            Frequently Asked <br />
                            <span className="text-orange-600">Questions</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 font-medium">
                            Everything you need to know about the platform. Still have questions?
                        </p>
                        <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors">
                            Contact Support
                        </button>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-[32px] border transition-all ${openIndex === i ? 'bg-white border-orange-100 shadow-xl shadow-orange-200/20' : 'bg-transparent border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full text-left p-8 flex justify-between items-center gap-4"
                                >
                                    <span className={`text-xl font-bold ${openIndex === i ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {faq.q}
                                    </span>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === i ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-8 pt-0 text-gray-600 text-lg font-medium leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
