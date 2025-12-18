'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Edit2, CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface Table {
    id: string;
    number: string;
    capacity: number;
    status: string;
}

interface TableManagementProps {
    initialTables: Table[];
    restaurantId: string;
}

export function TableManagement({ initialTables, restaurantId }: TableManagementProps) {
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({ number: '', capacity: 4, status: 'AVAILABLE' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (table?: Table) => {
        if (table) {
            setEditingTable(table);
            setFormData({ number: table.number, capacity: table.capacity, status: table.status });
        } else {
            setEditingTable(null);
            setFormData({ number: '', capacity: 4, status: 'AVAILABLE' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const body = {
            ...formData,
            id: editingTable?.id,
            restaurantId,
        };

        try {
            const res = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const savedTable = await res.json();
                if (editingTable) {
                    setTables(tables.map((t) => (t.id === savedTable.id ? savedTable : t)));
                } else {
                    setTables([...tables, savedTable]);
                }
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving table:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Floor Plan & Tables</h2>
                    <p className="text-gray-500 text-sm">Manage your restaurant layout and table availability.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Table
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <motion.div
                        key={table.id}
                        layout
                        className={`p-6 rounded-3xl border-2 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden ${table.status === 'OCCUPIED' ? 'border-orange-100 bg-orange-50/10' :
                            table.status === 'RESERVED' ? 'border-blue-100 bg-blue-50/10' : 'border-gray-50'
                            }`}
                    >
                        {/* Status Indicator Background Pulse */}
                        {table.status === 'OCCUPIED' && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/30 rounded-full -mr-12 -mt-12 animate-pulse" />
                        )}

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                                {table.number}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => handleOpenModal(table)}
                                    className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-black transition-colors bg-white shadow-sm border border-gray-100"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <div className="p-1.5 bg-gray-50 rounded-lg">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">Capacity: {table.capacity} Guests</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <StatusBadge status={table.status} />
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    ID: {table.id.slice(0, 4)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {tables.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="font-bold">No tables added yet</p>
                        <p className="text-sm">Click "Add Table" to start building your floor plan.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-4xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-gray-200 via-black to-gray-200" />

                            <h3 className="text-2xl font-black mb-8 text-gray-900 tracking-tight">
                                {editingTable ? 'Update Table' : 'New Table Registration'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Table Number/Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-black focus:outline-none transition-all font-bold text-lg"
                                        placeholder="e.g. T-01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seating Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-black focus:outline-none transition-all font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Initial Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-black focus:outline-none transition-all font-bold appearance-none bg-no-repeat bg-position-[right_1.25rem_center] bg-size-[1em_1em]"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                    >
                                        <option value="AVAILABLE">✅ Available</option>
                                        <option value="OCCUPIED">🔥 Occupied</option>
                                        <option value="RESERVED">📅 Reserved</option>
                                        <option value="OUT_OF_SERVICE">🛠 Out of Service</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-all uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg shadow-gray-200"
                                    >
                                        {isSubmitting ? 'Saving...' : editingTable ? 'Save Record' : 'Register Table'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string, text: string, icon: any, label: string }> = {
        'AVAILABLE': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Available' },
        'OCCUPIED': { bg: 'bg-orange-50', text: 'text-orange-700', icon: Users, label: 'Occupied' },
        'RESERVED': { bg: 'bg-sky-50', text: 'text-sky-700', icon: Calendar, label: 'Reserved' },
        'OUT_OF_SERVICE': { bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Maintenance' },
    };

    const style = styles[status] || styles['AVAILABLE'];
    const Icon = style.icon;

    return (
        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${style.bg} ${style.text}`}>
            <Icon className="w-3 h-3" />
            {style.label}
        </span>
    );
}
