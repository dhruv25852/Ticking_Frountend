import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Compass, ArrowRight, ShieldCheck, Phone, Headphones } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import { useSettings } from '../context/SettingsContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const { settings } = useSettings();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Launch celebratory gold confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#AA7C11', '#FFFFFF']
      });
    } catch {
      // Ignored
    }

    if (!order && id) {
      api.get(`/orders/${id}`)
        .then((data) => setOrder(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const orderId = order?.orderId || `TCK-2026-${id?.slice(-5)}`;
  const shipping = order?.shippingAddress || {};

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Animated Check Emblem */}
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          ACQUISITION CONFIRMED
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Thank You for Your Order
        </h1>

        <p className="text-xs sm:text-sm text-stone-400 font-light mt-3 max-w-md leading-relaxed">
          Your order has been authorized and forwarded to our Geneva vault curators for inspection and insured dispatch.
        </p>

        {/* Order Details Card */}
        <div className="w-full mt-10 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 text-left flex flex-col gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">ORDER REFERENCE ID</p>
              <p className="font-mono text-lg font-bold text-[#F3E5AB]">{orderId}</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider sm:text-right">TRACKING NUMBER</p>
              <p className="font-mono text-sm font-semibold text-stone-300 sm:text-right">
                {order?.trackingNumber || 'TCK-EXP-884102'}
              </p>
            </div>
          </div>

          {/* Items */}
          {order?.items && order.items.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-3">
                ALLOCATED TIMEPIECES
              </p>
              <div className="flex flex-col gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-stone-900 last:border-0">
                    <div className="w-12 h-12 bg-[#141418] rounded-lg p-1 shrink-0 border border-stone-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-serif font-bold text-[#F3E5AB]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping and Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-800 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                DELIVERY DESTINATION
              </p>
              <p className="font-semibold text-white">{shipping.fullName}</p>
              <p className="text-stone-400">{shipping.address}</p>
              <p className="text-stone-400">{shipping.city}, {shipping.state} {shipping.pincode}</p>
              <p className="text-stone-400 mt-1">Contact: {shipping.phone}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                PAYMENT SUMMARY
              </p>
              <p className="text-stone-300">Method: <span className="font-semibold text-white">{order?.paymentMethod}</span></p>
              <p className="text-stone-300">Status: <span className="text-emerald-400 font-semibold">{order?.paymentStatus || 'Paid'}</span></p>
              <div className="mt-3 pt-3 border-t border-stone-900 flex items-baseline justify-between">
                <span className="font-bold text-white">Total Amount:</span>
                <span className="font-serif text-xl font-bold text-[#F3E5AB]">
                  {formatPrice(order?.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Concierge Support Bar */}
          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#D4AF37]" />
              <span>Questions? Contact Concierge:</span>
              <a href={`mailto:${settings?.supportEmail || 'ticking@gmail.com'}`} className="text-[#D4AF37] hover:underline font-medium">
                {settings?.supportEmail || 'ticking@gmail.com'}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Boutique Desk:</span>
              <a href={`tel:${settings?.phone || '9909225852'}`} className="text-[#D4AF37] hover:underline font-medium">
                {settings?.phone || '9909225852'}
              </a>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-xl"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="px-8 py-3.5 border border-stone-700 hover:border-[#D4AF37] text-stone-300 hover:text-white font-medium text-xs uppercase tracking-[0.2em] rounded-full transition-all"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
