import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  validateCouponCode,
  validatePrice,
  validateDiscount
} from '../../utils/validation';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 10,
    minOrderAmount: 100000
  });
  const { showToast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await api.get('/coupons');
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const codeErr = validateCouponCode(formData.code);
    if (codeErr) newErrors.code = codeErr;

    if (formData.discountType === 'percentage') {
      const percErr = validateDiscount(formData.discountAmount);
      if (percErr) newErrors.discountAmount = percErr;
      else if (Number(formData.discountAmount) <= 0) newErrors.discountAmount = 'Discount must be greater than 0%';
    } else {
      const amtErr = validatePrice(formData.discountAmount, 'Discount amount');
      if (amtErr) newErrors.discountAmount = amtErr;
    }

    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = 'Minimum order threshold cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted coupon errors', 'error');
      return;
    }

    setErrors({});
    try {
      const created = await api.post('/coupons', formData);
      setCoupons([created, ...coupons]);
      setFormData({ code: '', discountType: 'percentage', discountAmount: 10, minOrderAmount: 100000 });
      setShowAdd(false);
      showToast(`Coupon ${created.code} activated!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      showToast('Coupon deactivated and removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            PRIVILEGE INCENTIVES
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Promo Codes & Concessions
          </h1>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'Close' : 'Add Coupon'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} noValidate className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-xs uppercase font-bold text-[#D4AF37]">Generate Promotional Code</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Code (e.g. SUMMER15)"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value.toUpperCase() });
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                className={`w-full bg-[#141418] border ${
                  errors.code ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none font-mono uppercase transition-colors`}
              />
              {errors.code && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.code}</span>
                </p>
              )}
            </div>

            <div>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-[#141418] border border-stone-800 text-xs text-white p-3 rounded-xl outline-none"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Deduction (₹)</option>
              </select>
            </div>

            <div>
              <input
                type="number"
                placeholder="Amount (e.g. 10% or ₹50000)"
                value={formData.discountAmount}
                onChange={(e) => {
                  setFormData({ ...formData, discountAmount: Number(e.target.value) });
                  if (errors.discountAmount) setErrors((prev) => ({ ...prev, discountAmount: '' }));
                }}
                className={`w-full bg-[#141418] border ${
                  errors.discountAmount ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.discountAmount && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.discountAmount}</span>
                </p>
              )}
            </div>

            <div>
              <input
                type="number"
                placeholder="Min Order Threshold (₹)"
                value={formData.minOrderAmount}
                onChange={(e) => {
                  setFormData({ ...formData, minOrderAmount: Number(e.target.value) });
                  if (errors.minOrderAmount) setErrors((prev) => ({ ...prev, minOrderAmount: '' }));
                }}
                className={`w-full bg-[#141418] border ${
                  errors.minOrderAmount ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.minOrderAmount && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.minOrderAmount}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-fit px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Activate Coupon
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-lg font-bold text-[#F3E5AB]">{c.code}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-300 font-semibold">
                {c.discountType === 'percentage' ? `${c.discountAmount}% OFF` : `${formatPrice(c.discountAmount)} OFF`}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Min Order: {formatPrice(c.minOrderAmount || 0)}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800/80 mt-4 flex items-center justify-between text-[11px] text-stone-500">
              <span>Expires {formatDate(c.expiryDate)}</span>
              <button
                onClick={() => handleDelete(c._id, c.code)}
                className="text-stone-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
