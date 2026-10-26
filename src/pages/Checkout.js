import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import api from '../services/api';

/**
 * Dynamically loads the official Razorpay Checkout SDK.
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePincode,
  validateRequired
} from '../utils/validation';

export default function Checkout() {
  const {
    cartItems,
    subtotal,
    discount,
    shippingFee,
    tax,
    grandTotal,
    appliedCoupon,
    clearCart
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Prepopulate if user has profile data
  const defaultAddress = user?.addresses?.[0] || {};
  const [formData, setFormData] = useState({
    fullName: defaultAddress.fullName || user?.name || '',
    email: user?.email || '',
    phone: defaultAddress.phone || user?.phone || '',
    address: defaultAddress.address || '',
    city: defaultAddress.city || '',
    state: defaultAddress.state || '',
    pincode: defaultAddress.pincode || ''
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('Online Payment');
  const [notes, setNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState({ isConfigured: true, keyId: '' });
  const [transactionLimitNotice, setTransactionLimitNotice] = useState(null);

  useEffect(() => {
    loadRazorpayScript();
    api.get('/payment/config')
      .then((cfg) => {
        if (cfg) setRazorpayConfig(cfg);
      })
      .catch(() => {});
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#080809] flex flex-col items-center justify-center text-center p-4">
        <h2 className="font-serif text-3xl font-bold text-white mb-2">No Items to Checkout</h2>
        <p className="text-xs text-stone-400 mb-6">Your shopping bag is empty.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-full">
          Browse Watches
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateName(formData.fullName, 'Full name');
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone, true);
    if (phoneErr) newErrors.phone = phoneErr;

    const addressErr = validateRequired(formData.address, 'Street address');
    if (addressErr) newErrors.address = addressErr;

    const cityErr = validateRequired(formData.city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const stateErr = validateRequired(formData.state, 'State');
    if (stateErr) newErrors.state = stateErr;

    const pincodeErr = validatePincode(formData.pincode);
    if (pincodeErr) newErrors.pincode = pincodeErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted errors before continuing', 'error');
      return;
    }

    setErrors({});

    if (!isAuthenticated) {
      showToast('Please log in or register to place your order securely', 'info');
      navigate('/login?redirect=checkout');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item._id || item.product?._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod,
        discount,
        couponCode: appliedCoupon?.code || '',
        notes
      };

      if (paymentMethod === 'Cash on Delivery') {
        const createdOrder = await api.post('/orders', orderPayload);
        clearCart();
        showToast('Your order has been placed successfully!', 'success');
        navigate(`/order-success/${createdOrder._id || createdOrder.orderId}`, {
          state: { order: createdOrder }
        });
        setPlacingOrder(false);
        return;
      }

      // Online Payment via Razorpay Test Mode
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setPlacingOrder(false);
        showToast('Unable to load Razorpay payment gateway. Please check your internet connection.', 'error');
        return;
      }

      // 1. Request backend to create Razorpay Order
      let rzpOrder;
      try {
        rzpOrder = await api.post('/payment/razorpay/create-order', {
          items: orderPayload.items,
          discount: orderPayload.discount,
          couponCode: orderPayload.couponCode,
          shippingAddress: orderPayload.shippingAddress
        });
      } catch (orderErr) {
        setPlacingOrder(false);
        const errMsg = orderErr.message || 'Failed to initiate Razorpay order. Please check backend credentials.';
        const isLimit =
          orderErr.data?.isLimitExceeded ||
          errMsg.toLowerCase().includes('limit') ||
          errMsg.toLowerCase().includes('exceeds');
        if (isLimit) {
          setTransactionLimitNotice(errMsg);
        }
        showToast(errMsg, 'error');
        return;
      }

      // 2. Open official Razorpay modal
      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'TICKING LUXURY WATCH',
        description: 'Luxury Timepiece Acquisition',
        image: 'https://res.cloudinary.com/bjaodxyt/image/upload/v1792843442/hero_chronograph.jpg',
        order_id: rzpOrder.orderId,
        handler: async function (response) {
          try {
            showToast('Verifying payment signature with Geneva vault...', 'info');
            const verifiedOrder = await api.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderPayload
            });

            clearCart();
            showToast('Payment verified successfully! Your order has been placed.', 'success');
            navigate(`/order-success/${verifiedOrder._id || verifiedOrder.orderId}`, {
              state: { order: verifiedOrder }
            });
          } catch (verifyErr) {
            showToast(
              verifyErr.message || 'Payment verification failed. Please contact concierge.',
              'error'
            );
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          deliveryCity: formData.city,
          pincode: formData.pincode
        },
        theme: {
          color: '#D4AF37',
          backdrop_color: 'rgba(8, 8, 9, 0.85)'
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
            showToast('Payment window closed. Your cart remains saved.', 'info');
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failureResponse) {
        setPlacingOrder(false);
        const errorDesc =
          failureResponse.error?.description ||
          failureResponse.error?.reason ||
          'Payment could not be completed.';
        showToast(`Payment failed: ${errorDesc}`, 'error');
      });
      rzpInstance.open();
    } catch (err) {
      setPlacingOrder(false);
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    }
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-left border-b border-stone-800 pb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            FINAL ACQUISITION STEP
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Secure Luxury Checkout
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Customer & Delivery Info (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            {/* Delivery Address Card */}
            <div className="bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col gap-6">
              <h2 className="text-xs uppercase font-bold tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-3">
                1. Delivery & Recipient Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhruv Savani"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    className={`w-full bg-[#141418] border ${
                      errors.fullName ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                    } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                  />
                  {errors.fullName && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. client@domain.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-[#141418] border ${
                      errors.email ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                    } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                  Phone Number (For White-Glove Courier) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full bg-[#141418] border ${
                    errors.phone ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                  } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                />
                {errors.phone && (
                  <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                  Street Address / Residence *
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, villa number, street name"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`w-full bg-[#141418] border ${
                    errors.address ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                  } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                />
                {errors.address && (
                  <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    className={`w-full bg-[#141418] border ${
                      errors.city ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                    } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                  />
                  {errors.city && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.city}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
                    }}
                    className={`w-full bg-[#141418] border ${
                      errors.state ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                    } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                  />
                  {errors.state && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.state}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Pincode / Postal *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 400001"
                    value={formData.pincode}
                    onChange={(e) => {
                      setFormData({ ...formData, pincode: e.target.value });
                      if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                    }}
                    className={`w-full bg-[#141418] border ${
                      errors.pincode ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                    } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
                  />
                  {errors.pincode && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.pincode}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col gap-6">
              <h2 className="text-xs uppercase font-bold tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-3">
                2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                    paymentMethod === 'Online Payment'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg'
                      : 'bg-[#141418] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                      <span>Online Payment (Razorpay)</span>
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Payment"
                      checked={paymentMethod === 'Online Payment'}
                      onChange={() => setPaymentMethod('Online Payment')}
                      className="accent-[#D4AF37]"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Debit & Credit Cards, UPI, Netbanking via Razorpay Secure Gateway.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="px-1.5 py-0.5 bg-[#1a1a20] border border-stone-700/70 rounded text-[9px] font-mono text-stone-300">VISA</span>
                    <span className="px-1.5 py-0.5 bg-[#1a1a20] border border-stone-700/70 rounded text-[9px] font-mono text-stone-300">MasterCard</span>
                    <span className="px-1.5 py-0.5 bg-[#1a1a20] border border-stone-700/70 rounded text-[9px] font-mono text-stone-300">RuPay</span>
                    <span className="px-1.5 py-0.5 bg-[#1a1a20] border border-stone-700/70 rounded text-[9px] font-mono text-stone-300">Amex</span>
                    <span className="px-1.5 py-0.5 bg-[#1a1a20] border border-[#D4AF37]/40 rounded text-[9px] font-mono text-[#D4AF37]">UPI / NetBanking</span>
                  </div>
                  {grandTotal > 500000 && (
                    <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-amber-300/80 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Online card payments above ₹5,00,000 are subject to your merchant account's Razorpay approved limit.</span>
                    </div>
                  )}
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg'
                      : 'bg-[#141418] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Cash on Delivery</span>
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => {
                        setPaymentMethod('Cash on Delivery');
                        setTransactionLimitNotice(null);
                      }}
                      className="accent-[#D4AF37]"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Verify physical timepiece in-person before settling balance via bank transfer or cheque.
                  </p>
                </label>
              </div>

              {razorpayConfig && !razorpayConfig.isConfigured && paymentMethod === 'Online Payment' && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-amber-300 font-semibold">Razorpay Test Mode Ready:</strong> Online card checkout will process simulated test transactions once you fill <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">RAZORPAY_KEY_ID</code> and <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">RAZORPAY_KEY_SECRET</code> in <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">backend/.env</code>.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                  Delivery Notes / Bespoke Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Ring private concierge, deliver after 2 PM..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Placement (5 cols) */}
          <div className="lg:col-span-5 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col gap-6 text-left">
            <h3 className="font-serif text-xl font-bold text-white border-b border-stone-800 pb-3">
              Order Review
            </h3>

            {/* Items Summary List */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id || item.product?._id} className="flex items-center gap-3 py-2 border-b border-stone-900">
                  <div className="w-12 h-12 bg-[#141418] rounded-lg p-1.5 shrink-0 border border-stone-800">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-white line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-stone-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-xs font-serif font-bold text-[#F3E5AB]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations in Indian Rupees ₹ */}
            <div className="flex flex-col gap-2.5 text-xs border-t border-stone-800 pt-3">
              <div className="flex items-center justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Concession ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-stone-400">
                <span>Insured Global Transit</span>
                <span className="text-emerald-400 font-semibold uppercase text-[10px]">
                  Free
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-400">
                <span>Estimated Luxury Tax (5%)</span>
                <span className="font-semibold text-white">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-stone-800 pt-3 flex items-baseline justify-between text-sm">
                <span className="font-bold text-white">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-[#F3E5AB]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Razorpay High-Value Limit Notice Banner */}
            {transactionLimitNotice && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-col gap-3 text-xs text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px] leading-relaxed">
                    <strong className="text-amber-300 font-semibold block mb-1">
                      Razorpay Gateway Limit Notice
                    </strong>
                    <p>{transactionLimitNotice}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('Cash on Delivery');
                      setTransactionLimitNotice(null);
                      showToast('Switched to Cash on Delivery. You can now place your order.', 'info');
                    }}
                    className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Switch to Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionLimitNotice(null)}
                    className="text-[11px] text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-2xl transition-all disabled:opacity-50"
            >
              <span>
                {placingOrder
                  ? paymentMethod === 'Online Payment'
                    ? 'Opening Razorpay Gateway...'
                    : 'Confirming Acquisition...'
                  : paymentMethod === 'Online Payment'
                    ? 'Pay with Razorpay (Cards / UPI)'
                    : 'Place Cash on Delivery Order'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Full Insurance & Authenticity Papers Included</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
