'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Phone, Mail, Award, Clock, ChevronRight } from 'lucide-react';

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    loyaltyPoints: number;
    visitsCount: number;
    lastVisitAt: Date | null;
    preferences: string | null;
}

interface CRMOverviewProps {
    initialCustomers: Customer[];
}

export function CRMOverview({ initialCustomers }: CRMOverviewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const filteredCustomers = initialCustomers.filter(c =>
        (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone?.includes(searchTerm)) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Customer List */}
            <div className="xl:col-span-1 space-y-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all font-bold shadow-sm"
                    />
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                        <button
                            key={customer.id}
                            onClick={() => setSelectedCustomer(customer)}
                            className={`w-full p-6 text-left hover:bg-gray-50 transition-all flex items-center gap-4 group ${selectedCustomer?.id === customer.id ? 'bg-black text-white' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 ${selectedCustomer?.id === customer.id ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                                {(customer.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-black truncate">{customer.name || 'Anonymous Guest'}</div>
                                <div className={`text-xs font-bold ${selectedCustomer?.id === customer.id ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {customer.phone || customer.email || 'No contact info'}
                                </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedCustomer?.id === customer.id ? 'text-white' : 'text-gray-300'}`} />
                        </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <div className="p-12 text-center text-gray-400 font-bold">
                            No matching customers found.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="xl:col-span-2">
                {selectedCustomer ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={selectedCustomer.id}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
                    >
                        {/* Header / Profile Card */}
                        <div className="p-8 lg:p-12 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="w-24 h-24 rounded-3xl bg-black text-white flex items-center justify-center text-4xl font-black shadow-2xl">
                                    {(selectedCustomer.name?.[0] || '?').toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedCustomer.name || 'Anonymous'}</h3>
                                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {selectedCustomer.loyaltyPoints > 500 ? 'VIP Member' : 'Regular Guest'}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-gray-500 font-bold text-sm">
                                        <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedCustomer.phone || 'N/A'}</div>
                                        <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedCustomer.email || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-50 border-b border-gray-50">
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2 text-center">Total Visits</div>
                                <div className="text-4xl font-black text-gray-900">{selectedCustomer.visitsCount}</div>
                            </div>
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2 text-center">Loyalty Points</div>
                                <div className="text-4xl font-black text-emerald-600 flex items-center justify-center gap-2">
                                    <Award className="w-6 h-6" /> {selectedCustomer.loyaltyPoints}
                                </div>
                            </div>
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2 text-center">Last Seen</div>
                                <div className="text-xl font-black text-gray-900 flex items-center justify-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    {selectedCustomer.lastVisitAt ? new Date(selectedCustomer.lastVisitAt).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                        </div>

                        {/* Preferences & Tabs */}
                        <div className="p-8 lg:p-12 space-y-10">
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Guest Preferences</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCustomer.preferences ? selectedCustomer.preferences.split(',').map(p => (
                                        <span key={p} className="px-4 py-2 text-gray-700 rounded-xl font-bold text-sm bg-white border border-gray-200 shadow-sm">
                                            {p.trim()}
                                        </span>
                                    )) : (
                                        <div className="text-gray-300 italic font-bold">No preferences recorded yet.</div>
                                    )}
                                    <button className="px-4 py-2 border-2 border-dashed border-gray-100 rounded-xl text-xs font-black text-gray-400 hover:border-black hover:text-black transition-all">
                                        + Add Tag
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Automated Marketing Action</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button className="p-6 rounded-3xl border-2 border-emerald-50 text-emerald-700 font-bold text-left hover:bg-emerald-50 transition-all flex items-center justify-between group">
                                        <div>
                                            <div className="text-sm">Send Special Discount</div>
                                            <div className="text-xs opacity-60 font-medium">Auto-generate 15% reward</div>
                                        </div>
                                        <Award className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button className="p-6 rounded-3xl border-2 border-gray-50 text-gray-700 font-bold text-left hover:bg-gray-50 transition-all flex items-center justify-between group">
                                        <div>
                                            <div className="text-sm">Request Feedback</div>
                                            <div className="text-xs opacity-60 font-medium">Send SMS survey</div>
                                        </div>
                                        <Mail className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <User className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-700 mb-2">Customer Analysis</h3>
                        <p className="text-center max-w-sm font-bold">Select a customer from the sidebar to view their detailed profile, loyalty status, and behavioral preferences.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
