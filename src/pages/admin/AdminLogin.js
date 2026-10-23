import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validateRequired } from '../../utils/validation';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@ticking.com');
  const [password, setPassword] = useState('adminpassword123');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validateRequired(password, 'Security Key / Password');
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      showToast('Master administrator privileges verified', 'success');
      navigate('/admin/dashboard');
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#070709] min-h-screen text-stone-200 py-16 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0C0C0F] border border-[#D4AF37]/40 rounded-2xl p-8 relative z-10 shadow-2xl text-left">
        <div className="text-center mb-8">
          <div className="w-14 h-14 border border-[#D4AF37] bg-black flex items-center justify-center mx-auto mb-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Shield className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            RESTRICTED HOROLOGICAL PORTAL
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Admin Authentication
          </h1>
          <p className="text-xs text-stone-400 mt-2">
            Sign in to manage catalog, stock allocations, orders, and sales ledgers.
          </p>
        </div>

        <form onSubmit={handleAdminSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Administrative Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="admin@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`w-full bg-[#131317] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
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
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                className={`w-full bg-[#131317] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-3"
          >
            <span>{loading ? 'Validating Privileges...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-800 text-center text-xs text-stone-500 flex items-center justify-between">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">
            ← Return to Store
          </Link>
          <span>TICKING v2.6 Enterprise</span>
        </div>
      </div>
    </div>
  );
}
