import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, X, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!currentPassword || !currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword || !newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (currentPassword && currentPassword.trim() === newPassword.trim()) {
      newErrors.newPassword = 'New password cannot be the same as your current password';
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      });

      showToast('Password changed successfully!', 'success');
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to update password';
      if (msg.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: msg });
      } else if (msg.toLowerCase().includes('match')) {
        setErrors({ confirmPassword: msg });
      } else {
        setErrors({ general: msg });
      }
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.9)] relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-stone-800 hover:border-[#D4AF37] text-stone-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37] block">
              SECURITY & CREDENTIALS
            </span>
            <h2 id="change-password-title" className="font-serif text-2xl font-bold text-white">
              Change Password
            </h2>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-6 leading-relaxed">
          Enter your existing account password followed by your new password (minimum 6 characters).
        </p>

        {/* General Error Alert */}
        {errors.general && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: '' }));
                }}
                disabled={submitting}
                className={`w-full bg-[#141418] border text-xs text-white p-3 pr-10 rounded-xl outline-none transition-colors ${
                  errors.currentPassword ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#D4AF37] transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.currentPassword}</span>
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                disabled={submitting}
                className={`w-full bg-[#141418] border text-xs text-white p-3 pr-10 rounded-xl outline-none transition-colors ${
                  errors.newPassword ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#D4AF37] transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.newPassword}</span>
              </p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                disabled={submitting}
                className={`w-full bg-[#141418] border text-xs text-white p-3 pr-10 rounded-xl outline-none transition-colors ${
                  errors.confirmPassword ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#D4AF37] transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Security guarantee pill */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-[#121217] p-2.5 rounded-xl border border-stone-800/80 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Protected by end-to-end cryptographic bcrypt salting.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800/80 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 text-stone-400 hover:text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
