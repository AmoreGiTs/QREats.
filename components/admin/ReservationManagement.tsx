'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  User
} from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
}

interface Reservation {
  id: string;
  customerId: string;
  customer: Customer;
  tableId: string | null;
  table: Table | null;
  reserveTime: string;
  partySize: number;
  status: string; // CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
  notes: string | null;
}

interface ReservationManagementProps {
  initialReservations: Reservation[];
  restaurantId: string;
  availableTables: Table[];
}

export function ReservationManagement({ initialReservations, restaurantId, availableTables }: ReservationManagementProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    customerId: '',
    tableId: '',
    reserveTime: '',
    partySize: 2,
    status: 'CONFIRMED',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredReservations = reservations.filter(res => 
    res.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.customer.phone?.includes(searchTerm)
  );

  const handleOpenModal = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        customerId: reservation.customerId,
        tableId: reservation.tableId || '',
        reserveTime: new Date(reservation.reserveTime).toISOString().slice(0, 16),
        partySize: reservation.partySize,
        status: reservation.status,
        notes: reservation.notes || ''
      });
    } else {
      setEditingReservation(null);
      setFormData({
        customerId: '',
        tableId: '',
        reserveTime: '',
        partySize: 2,
        status: 'CONFIRMED',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingReservation?.id,
          restaurantId
        }),
      });

      if (res.ok) {
        const savedRes = await res.json();
        // Refresh optimization: In a real app we'd fetch or update state carefully
        // For now, let's just close and assume a refresh or manual state update
        setIsModalOpen(false);
        // Quick hack to update UI without full refresh for demo
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-emerald-600 bg-emerald-50';
      case 'CANCELLED': return 'text-rose-600 bg-rose-50';
      case 'COMPLETED': return 'text-gray-600 bg-gray-50';
      case 'NO_SHOW': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Search by guest name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all font-bold shadow-sm"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {/* Reservation List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Guest</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Party</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Table</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500">
                        {(res.customer.name?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{res.customer.name || 'Anonymous'}</div>
                        <div className="text-xs font-bold text-gray-400">{res.customer.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{new Date(res.reserveTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="text-xs font-bold text-gray-400">{new Date(res.reserveTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 font-black text-gray-900">
                      <Users className="w-4 h-4 text-gray-300" />
                      {res.partySize}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {res.table ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-black border border-gray-200">
                        Table {res.table.number}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic text-xs font-bold">Unassigned</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleOpenModal(res)}
                      className="p-2 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-black transition-all border border-transparent hover:border-gray-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Calendar className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-black text-lg">No reservations found</p>
                      <p className="text-sm font-bold">Try adjusting your search or add a new entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-emerald-600 to-emerald-400" />
              
              <h3 className="text-2xl font-black mb-8 text-gray-900 tracking-tight">
                {editingReservation ? 'Edit Reservation' : 'New Reservation'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!editingReservation && (
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Customer ID (Internal)</label>
                    <input
                      type="text"
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold"
                      placeholder="Enter customer identification"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.reserveTime}
                      onChange={(e) => setFormData({ ...formData, reserveTime: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Party Size</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.partySize}
                      onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Table</label>
                    <select
                      value={formData.tableId}
                      onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {availableTables.map(table => (
                        <option key={table.id} value={table.id}>
                          Table {table.number} (Cap: {table.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold appearance-none"
                    >
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="NO_SHOW">No Show</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition-all font-bold min-h-[100px]"
                    placeholder="e.g. Birthday celebration, allergy info..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-black hover:bg-gray-800 transition-all uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg"
                  >
                    {isSubmitting ? 'Processing...' : editingReservation ? 'Update Booking' : 'Confirm Booking'}
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
