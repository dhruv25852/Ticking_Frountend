import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Phone
} from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

export default function OrderDetails() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${order._id}/cancel`);
      setOrder(res.order || { ...order, orderStatus: 'Cancelled' });
      showToast('Order has been cancelled.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center text-stone-300 gap-4">
        <h2 className="font-serif text-2xl font-bold">Order Record Not Found</h2>
        <Link to="/orders" className="px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-full text-xs uppercase tracking-wider">
          Back to Orders
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const statusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIdx = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto text-left">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#D4AF37] uppercase tracking-wider mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {/* Header */}
        <div className="bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              ACQUISITION SUMMARY
            </span>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F3E5AB] mt-1">
              {order.orderId}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Placed on {formatDate(order.createdAt)} • Tracking: <span className="font-mono text-stone-200 font-semibold">{order.trackingNumber || 'TCK-EXP-91823'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                  : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40'
              }`}
            >
              {order.orderStatus}
            </span>

            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-1.5 bg-stone-900 hover:bg-rose-950/40 border border-stone-800 hover:border-rose-500/40 text-stone-300 hover:text-rose-300 text-xs font-medium rounded-full transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Status Tracker (if not cancelled) */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-6 mb-8">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-6">
              TRACKING PROGRESS
            </p>
            <div className="grid grid-cols-5 gap-2 relative">
              {statusSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                return (
                  <div key={step} className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-[#D4AF37] text-black shadow-lg scale-105'
                          : 'bg-stone-800 text-stone-500 border border-stone-700'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        isPassed ? 'text-white' : 'text-stone-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-8 mb-8">
          <h2 className="font-serif text-xl font-bold text-white mb-6 border-b border-stone-800 pb-3">
            Acquired Timepieces
          </h2>

          <div className="flex flex-col gap-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 border-b border-stone-900 last:border-0">
                <div className="w-16 h-16 bg-[#141418] rounded-xl p-2 shrink-0 border border-stone-800">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">{item.brand}</span>
                  <h3 className="font-serif text-base font-semibold text-white mt-0.5">{item.name}</h3>
                  <p className="text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-base font-bold text-[#F3E5AB]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <p className="text-[10px] text-stone-500">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Two Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-6 text-xs flex flex-col gap-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#D4AF37] border-b border-stone-800 pb-2 mb-2">
              Delivery Destination
            </h3>
            <p className="font-bold text-white text-sm">{shipping.fullName}</p>
            <p className="text-stone-400">{shipping.address}</p>
            <p className="text-stone-400">{shipping.city}, {shipping.state} {shipping.pincode}</p>
            <p className="text-stone-400 mt-2">Phone: <span className="text-stone-200">{shipping.phone}</span></p>
            <p className="text-stone-400">Email: <span className="text-stone-200">{shipping.email}</span></p>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-6 text-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#D4AF37] border-b border-stone-800 pb-2 mb-2">
                Settlement & Ledger
              </h3>
              <div className="flex flex-col gap-2 text-stone-400">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-white">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-emerald-400 font-semibold">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Applied:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Luxury Tax & Duty:</span>
                  <span className="font-semibold text-white">{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Insurance:</span>
                  <span className="text-emerald-400 uppercase text-[10px] font-bold">Complimentary</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-3 flex items-baseline justify-between mt-4">
              <span className="font-bold text-white text-sm">Grand Total Paid:</span>
              <span className="font-serif text-2xl font-bold text-[#F3E5AB]">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Concierge Support Note */}
        <div className="mt-8 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-white text-[11px]">
                {settings?.storeName || 'TICKING LUXARY WATCH'} Concierge Care
              </p>
              <p className="text-stone-400 mt-0.5">
                Acquisition inquiry or delivery coordination? Contact <a href={`mailto:${settings?.supportEmail || 'ticking@gmail.com'}`} className="text-[#D4AF37] hover:underline font-semibold">{settings?.supportEmail || 'ticking@gmail.com'}</a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-6">
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Direct Line:</span>
            <a href={`tel:${settings?.phone || '9909225852'}`} className="text-[#F3E5AB] hover:text-[#D4AF37] font-semibold transition-colors">
              {settings?.phone || '9909225852'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
