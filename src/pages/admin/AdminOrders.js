import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          CLIENT DISPATCH CONTROL
        </span>
        <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
          Order & Allocation Management
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Review white-glove acquisitions, update logistics stages, and inspect billing records.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#0D0D11] border border-stone-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} noValidate className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, client name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#141418] border border-stone-800 text-xs text-stone-200 px-3 py-2 rounded-lg outline-none"
          >
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111115] border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Client Name</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Pieces</th>
                <th className="py-4 px-4">Total Amount (₹)</th>
                <th className="py-4 px-4">Order Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-900">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">No orders found matching criteria.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-[#F3E5AB]">
                      {ord.orderId}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{ord.shippingAddress?.fullName}</p>
                      <p className="text-[10px] text-stone-500">{ord.shippingAddress?.email}</p>
                    </td>

                    <td className="py-3 px-4 text-stone-400">
                      {formatDate(ord.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-stone-300">
                      {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-white text-sm">
                      {formatPrice(ord.grandTotal)}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border outline-none bg-[#111115] cursor-pointer ${
                          ord.orderStatus === 'Delivered'
                            ? 'text-emerald-400 border-emerald-500/40'
                            : ord.orderStatus === 'Cancelled'
                            ? 'text-rose-400 border-rose-500/40'
                            : 'text-[#D4AF37] border-[#D4AF37]/40'
                        }`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-[#D4AF37] hover:text-black text-stone-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl flex flex-col gap-6 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">ORDER DOSSIER</span>
                <h3 className="font-mono text-xl font-bold text-[#F3E5AB]">{selectedOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Client and Destination */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#141418] p-4 rounded-xl border border-stone-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#D4AF37]">CLIENT DETAILS</span>
                <p className="font-bold text-white mt-1">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-stone-400">{selectedOrder.shippingAddress?.phone}</p>
                <p className="text-stone-400">{selectedOrder.shippingAddress?.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#D4AF37]">DELIVERY ADDRESS</span>
                <p className="text-stone-300 mt-1">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-stone-400">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-2">ALLOCATED PIECES</span>
              <div className="flex flex-col gap-2">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-[#121216] rounded-lg border border-stone-800 text-xs">
                    <img src={it.image} alt={it.name} className="w-10 h-10 object-contain rounded bg-[#18181D] p-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{it.name}</p>
                      <p className="text-[10px] text-stone-500">Qty: {it.quantity}</p>
                    </div>
                    <span className="font-serif font-bold text-[#F3E5AB]">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Actions */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400">Total Settlement:</span>
                <p className="font-serif text-2xl font-bold text-white">{formatPrice(selectedOrder.grandTotal)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-xl"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
