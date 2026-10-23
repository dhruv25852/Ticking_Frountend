import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  X,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatters';
import { validateCouponCode } from '../utils/validation';

export default function Cart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    tax,
    grandTotal,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const err = validateCouponCode(couponCode);
    if (err) {
      setCouponError(err);
      return;
    }
    setCouponError('');
    setApplying(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch {
      // Handled by context toast
    } finally {
      setApplying(false);
    }
  };

  const handleMoveToWishlist = (item) => {
    addToWishlist(item.product || item);
    removeFromCart(item._id || item.product?._id);
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-full bg-[#080809] min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-white mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-stone-400 max-w-sm mb-8 leading-relaxed">
          Your luxury acquisition journey awaits. Explore our certified collection of fine Swiss horology.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-lg"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-left border-b border-stone-800 pb-6 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              CHECKOUT PREPARATION
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              Your Shopping Bag ({cartCount} {cartCount === 1 ? 'Piece' : 'Pieces'})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-rose-400 transition-colors uppercase tracking-wider"
          >
            Clear Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cartItems.map((item) => {
              const productId = item._id || item.product?._id;
              const imgUrl =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : '/images/watches/hero_chronograph.jpg';

              return (
                <div
                  key={productId}
                  className="bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between transition-colors hover:border-[#D4AF37]/30"
                >
                  {/* Watch Image */}
                  <Link
                    to={`/product/${item.slug || productId}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-b from-[#16161B] to-[#0A0A0C] p-3 flex items-center justify-center shrink-0 border border-stone-800"
                  >
                    <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                  </Link>

                  {/* Watch Info */}
                  <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]">
                      {item.brand}
                    </span>
                    <Link
                      to={`/product/${item.slug || productId}`}
                      className="font-serif text-lg font-semibold text-white hover:text-[#D4AF37] transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs font-serif text-[#F3E5AB] font-bold mt-1">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center border border-stone-800 rounded-lg bg-[#141418]">
                    <button
                      onClick={() => updateQuantity(productId, item.quantity - 1)}
                      className="px-3 py-1.5 text-stone-400 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(productId, item.quantity + 1)}
                      className="px-3 py-1.5 text-stone-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Total Line Price */}
                  <div className="text-right">
                    <p className="font-serif text-base font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Actions: Move to Wishlist / Remove */}
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => handleMoveToWishlist(item)}
                      title="Move to Wishlist"
                      className="p-2 text-stone-400 hover:text-[#D4AF37] bg-stone-900 rounded-lg transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(productId)}
                      title="Remove Item"
                      className="p-2 text-stone-400 hover:text-rose-400 bg-stone-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col gap-6 text-left">
            <h3 className="font-serif text-xl font-bold text-white border-b border-stone-800 pb-3">
              Order Summary
            </h3>

            {/* Price Breakdown in Indian Rupees ₹ */}
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Concession / Promo Discount</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-stone-400">
                <span>Insured Global Shipping</span>
                <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                  Free Worldwide
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-400">
                <span>Estimated Luxury Tax & Duty (5%)</span>
                <span className="font-semibold text-white">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-stone-800 pt-3 flex items-baseline justify-between text-sm">
                <span className="font-bold text-white">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-[#F3E5AB]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Tag className="w-4 h-4" />
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <form onSubmit={handleApplyCoupon} noValidate className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. ROYAL10)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError('');
                      }}
                      className={`flex-1 bg-[#141418] border ${
                        couponError ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                      } text-xs text-white uppercase px-3 py-2 rounded-xl outline-none placeholder:normal-case placeholder:text-stone-500 transition-colors`}
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2 bg-stone-800 hover:bg-[#D4AF37] hover:text-black text-stone-200 text-xs font-semibold uppercase rounded-xl transition-colors disabled:opacity-50"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                  {couponError && (
                    <p className="flex items-center gap-1.5 text-rose-400 text-[11px] px-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Checkout CTA Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
