import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validateRequired } from '../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Ensure login form is clean on mount and resets upon user logout
  useEffect(() => {
    const resetForm = () => {
      setEmail('');
      setPassword('');
      setRememberMe(false);
      setErrors({});
    };

    resetForm();
    window.addEventListener('auth:logout', resetForm);
    return () => window.removeEventListener('auth:logout', resetForm);
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validateRequired(password, 'Password');
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      setEmail('');
      setPassword('');
      setRememberMe(false);
      setErrors({});
      showToast('Welcome back to TICKING', 'success');
      navigate(redirect === 'checkout' ? '/checkout' : redirect);
    } catch {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center bg-black mx-auto mb-4">
            <span className="font-serif text-[#D4AF37] text-2xl font-bold">T</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            PRIVATE CONNOISSEUR ACCESS
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Sign In to TICKING
          </h1>
          <p className="text-xs text-stone-400 mt-2">
            Access your curated orders, personal vault, and wishlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col gap-4">
          {/* Hidden inputs to neutralize aggressive browser autofill */}
          <input type="text" style={{ display: 'none' }} tabIndex="-1" autoComplete="false" />
          <input type="password" style={{ display: 'none' }} tabIndex="-1" autoComplete="false" />

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium text-left">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="off"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium text-left">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast('Demo accounts: dhruv@ticking.com / userpassword123, or admin@ticking.com / adminpassword123', 'info', 6000)}
                className="text-[10px] text-[#D4AF37] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none transition-colors ${
                  errors.password
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium text-left">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 cursor-pointer text-stone-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
          <span>New to TICKING? </span>
          <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`} className="text-[#D4AF37] font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
