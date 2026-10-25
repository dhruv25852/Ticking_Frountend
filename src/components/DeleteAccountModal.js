import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, Eye, EyeOff, X, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { deleteAccount, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset modal state when opened or closed
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !password.trim()) {
      setError('Please enter your current password to confirm deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount(password.trim());
      showToast('Your account has been permanently deleted. A confirmation email was sent to your registered address.', 'info');
      onClose();
      navigate('/login');
    } catch (err) {
      const msg = err.message || 'Failed to delete account. Please verify your password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <div className="w-full max-w-md bg-[#0D0D11] border border-red-500/40 rounded-2xl p-6 sm:p-8 relative z-10 shadow-[0_20px_60px_rgba(239,68,68,0.22)] text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 border border-red-500/60 bg-red-950/40 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        {/* Title & Warning */}
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-400">
          Permanent Action &bull; Irreversible
        </span>
        <h2 className="font-serif text-2xl font-bold text-white mt-1">
          Delete Your Account
        </h2>
        <p className="text-xs text-stone-400 mt-2 leading-relaxed">
          You are about to permanently delete your TICKING LUXARY WATCH portfolio for{' '}
          <strong className="text-stone-200">{user?.email || 'this account'}</strong>.
        </p>

        {/* Consequence Callout */}
        <div className="bg-red-950/25 border border-red-900/40 rounded-xl p-3.5 my-4 text-xs text-stone-300 space-y-1.5">
          <p className="flex items-start gap-2">
            <span className="text-red-400 font-bold">•</span>
            <span>All your personal profile data, saved addresses, and wishlists will be permanently removed.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-red-400 font-bold">•</span>
            <span>You will be immediately logged out and an email confirmation will be dispatched via Brevo.</span>
          </p>
          <p className="flex items-start gap-2 text-[11px] text-stone-400">
            <span className="text-red-400 font-bold">•</span>
            <span>Historical order invoices remain archived in confidential accounting ledgers for legal compliance.</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1.5">
              Confirm Current Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter your current password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
                className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-10 py-3 rounded-xl outline-none transition-colors ${
                  error
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-stone-800 focus:border-red-500/70'
                } disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-1/2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-semibold tracking-wider transition-colors disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-1/2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Delete Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
