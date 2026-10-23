import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-950 text-emerald-400 border-emerald-500/40';
      case 'Shipped':
        return 'bg-blue-950 text-blue-400 border-blue-500/40';
      case 'Processing':
        return 'bg-amber-950 text-amber-400 border-amber-500/40';
      case 'Cancelled':
        return 'bg-rose-950 text-rose-400 border-rose-500/40';
      default:
        return 'bg-stone-900 text-stone-300 border-stone-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-left border-b border-stone-800 pb-4 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              CLIENT DOSSIER
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              My Orders & Acquisitions
            </h1>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-wider text-[#D4AF37] hover:underline hidden sm:inline"
          >
            Acquire New Reference
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#0E0E12] border border-stone-800 rounded-2xl p-8">
            <Package className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-white mb-2">No Active Acquisitions</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-6">
              You haven't placed any watch orders yet. Discover our certified Swiss timepieces.
            </p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-full"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#0E0E12] border border-stone-800/80 hover:border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col gap-5 transition-all text-left"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">ORDER REFERENCE</span>
                    <p className="font-mono text-base font-bold text-[#F3E5AB]">{order.orderId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">DATE PLACED</span>
                    <p className="text-xs text-stone-300 font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">STATUS</span>
                    <span
                      className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                        order.orderStatus
                      )} mt-0.5`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">TOTAL VALUE</span>
                    <p className="font-serif text-lg font-bold text-white">{formatPrice(order.grandTotal)}</p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex flex-col gap-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#141418] rounded-xl p-2 shrink-0 border border-stone-800">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">{item.brand}</span>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-stone-400 mt-0.5">
                          Quantity: {item.quantity} • {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details & Action */}
                <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-stone-400 text-[11px]">
                    Delivery: {order.shippingAddress?.city}, {order.shippingAddress?.state} • Tracking: <span className="font-mono text-stone-300">{order.trackingNumber || 'Pending'}</span>
                  </span>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#D4AF37] hover:text-[#F3E5AB] uppercase tracking-wider text-[11px]"
                  >
                    <span>View Dossier Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
