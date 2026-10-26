import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword } from '../utils/validation';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Code, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 5-minute countdown timer for OTP expiry
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds = 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 60-second cooldown timer for Resend button
  const [resendCooldown, setResendCooldown] = useState(0);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle OTP 5-minute expiry countdown
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast('Verification code has expired. Please request a new one.', 'error');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, showToast]);

  // Handle Resend 60-second cooldown countdown
  useEffect(() => {
    let cooldownInterval = null;
    if (resendCooldown > 0) {
      cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1: Submit Email to receive 6-digit verification code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      showToast(
        response.message || 'If an account exists, a 6-digit code has been sent to your email.',
        'success',
        6000
      );

      // Start timers and advance to Step 2
      setTimeLeft(300); // 5 minutes
      setIsTimerRunning(true);
      setResendCooldown(60); // 60s cooldown for resending
      setCode('');
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Unable to process request. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      showToast('A new 6-digit verification code has been dispatched.', 'success');
      setTimeLeft(300); // Reset to 5 minutes
      setIsTimerRunning(true);
      setResendCooldown(60);
      setCode('');
      setErrors({});
    } catch (err) {
      showToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();

    if (!cleanCode) {
      setErrors({ code: 'Please enter the 6-digit code received in your email' });
      return;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      setErrors({ code: 'Verification code must be exactly 6 numeric digits' });
      return;
    }

    if (timeLeft <= 0) {
      setErrors({ code: 'Verification code has expired. Please request a new code.' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-reset-code', {
        email: email.trim().toLowerCase(),
        code: cleanCode
      });

      if (!response.resetToken) {
        throw new Error('Verification token missing. Please try again.');
      }

      setResetToken(response.resetToken);
      setIsTimerRunning(false);
      showToast('Verification confirmed. Please establish your new password.', 'success');
      setStep(3);
    } catch (err) {
      setErrors({ code: err.message || 'Invalid or expired verification code' });
      showToast(err.message || 'Verification failed. Please check the code and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const passErr = validatePassword(newPassword);
    if (passErr) {
      newErrors.newPassword = passErr;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters in length';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
        confirmPassword
      });

      showToast(response.message || 'Password updated successfully!', 'success');
      setStep(4);
    } catch (err) {
      showToast(err.message || 'Failed to update password. Please restart verification.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 relative z-10 shadow-2xl text-left">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center bg-black mx-auto mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <span className="font-serif text-[#D4AF37] text-2xl font-bold">T</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            CREDENTIAL RECOVERY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify Code'}
            {step === 3 && 'Set New Password'}
            {step === 4 && 'Recovery Complete'}
          </h1>
          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
            {step === 1 && 'Enter your registered email address to receive a 6-digit verification code.'}
            {step === 2 && 'Enter the 6-digit verification code sent to your registered email via Brevo.'}
            {step === 3 && 'Choose a strong new password for your TICKING luxury account.'}
            {step === 4 && 'Your password has been securely updated in our vault.'}
          </p>
        </div>

        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 1 ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-[#D4AF37]/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 2 ? 'w-8 bg-[#D4AF37]' : step > 2 ? 'w-3 bg-[#D4AF37]/40' : 'w-3 bg-stone-800'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 3 ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-stone-800'
              }`}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: Request Verification Code (Enter Email)                */}
        {/* ============================================================== */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} noValidate className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter your registered email"
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
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Dispatching Code...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-stone-800/80 text-center">
              <Link
                to="/login"
                className="text-xs text-stone-400 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your password? Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Enter 6-digit Verification Code                       */}
        {/* ============================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate className="flex flex-col gap-4">
            {/* Info Pill with Destination Email */}
            <div className="p-3 bg-[#141418] border border-stone-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-stone-300 font-mono text-[11px] truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setIsTimerRunning(false);
                }}
                className="text-[10px] text-[#D4AF37] hover:underline uppercase tracking-wider shrink-0 font-semibold"
              >
                Edit
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                  6-Digit Verification Code *
                </label>
                <span
                  className={`text-[11px] font-mono flex items-center gap-1 font-semibold ${
                    timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-[#D4AF37]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeLeft)}</span>
                </span>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="e.g. 582491"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Digits only
                    setCode(val);
                    if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                  }}
                  className={`w-full bg-[#141418] border text-center font-mono text-xl tracking-[0.4em] text-[#F3E5AB] py-3 pl-9 pr-3 rounded-xl outline-none transition-colors ${
                    errors.code
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-stone-800 focus:border-[#D4AF37]'
                  }`}
                  autoFocus
                />
              </div>

              {errors.code && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.code}</span>
                </p>
              )}

              <p className="text-[10px] text-stone-500 mt-1.5">
                Check your inbox (and spam folder) for an email from TICKING Luxury Watches.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6 || timeLeft <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-1"
            >
              <span>{loading ? 'Verifying Code...' : 'Verify & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend Code Action */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs">
              <span className="text-stone-400 text-[11px]">Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className="text-[11px] text-[#D4AF37] hover:underline disabled:text-stone-600 disabled:no-underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Set New Password                                      */}
        {/* ============================================================== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Identity verified. Enter your new password below.</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-10 py-3 rounded-xl outline-none transition-colors ${
                    errors.newPassword
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-stone-800 focus:border-[#D4AF37]'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.newPassword}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full bg-[#141418] border text-xs text-white pl-9 pr-10 py-3 rounded-xl outline-none transition-colors ${
                    errors.confirmPassword
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-stone-800 focus:border-[#D4AF37]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 4: Success Message                                       */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-1.5">
                Password Updated Successfully
              </h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Your TICKING account credentials have been updated securely. You can now sign in with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl mt-2"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
