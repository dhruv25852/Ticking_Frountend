import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone
} from '../utils/validation';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const validate = () => {
    const newErrors = {};

    const nameErr = validateName(formData.name, 'Full Name');
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (formData.phone) {
      const phoneErr = validatePhone(formData.phone, false);
      if (phoneErr) newErrors.phone = phoneErr;
    }

    const passErr = validatePassword(formData.password, 6);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      showToast('Registration successful! Welcome to TICKING', 'success');
      navigate(redirect === 'checkout' ? '/checkout' : redirect);
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center bg-black mx-auto mb-4">
            <span className="font-serif text-[#D4AF37] text-2xl font-bold">T</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            HOROLOGY PRIVILEGE MEMBERSHIP
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Create Account
          </h1>
          <p className="text-xs text-stone-400 mt-2">
            Join the TICKING collector circle for allocations and insured deliveries.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Dhruv Savani"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.name
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="client@domain.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.phone
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.password
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.confirmPassword
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-3"
          >
            <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
          <span>Already registered with TICKING? </span>
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-[#D4AF37] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
