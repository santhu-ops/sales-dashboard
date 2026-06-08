import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Eye, EyeOff, Lock, Hash, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const clearError = (field: string) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setStep('reset');
      showToast('Verification code sent! Check your email.', 'success');
    } catch (err: any) {
      setErrors({ email: err.message || 'Failed to send code. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await forgotPassword(email);
      showToast('A new code has been sent to your email.', 'success');
      setOtp('');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!otp) newErrors.otp = 'Please enter the 6-digit code';
    else if (otp.length !== 6) newErrors.otp = 'Code must be exactly 6 digits';
    if (!password) newErrors.password = 'New password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      await resetPassword(email, otp, password);
      setStep('done');
      showToast('Password reset successfully!', 'success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      const msg = err.message || 'Reset failed. The code may be invalid or expired.';
      setErrors({ otp: msg });
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e4efd2] p-6 overflow-hidden">
      <div className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full bg-white rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden"
        >
          <div className="px-10 pt-10 pb-8">

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-5 h-5 bg-[#96ce54] rounded-sm flex items-center justify-center rotate-45">
                <div className="w-2 h-2 bg-white rounded-full -rotate-45" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">salesflow</span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(['email', 'reset', 'done'] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${step === s
                    ? 'bg-[#96ce54] text-white shadow-md shadow-[#96ce54]/30 scale-110'
                    : s === 'done' && step === 'done'
                      ? 'bg-[#96ce54] text-white'
                      : ['reset', 'done'].includes(s) && ['reset', 'done'].includes(step) && i < ['email', 'reset', 'done'].indexOf(step)
                        ? 'bg-[#96ce54] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                    {i + 1}
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 max-w-[40px] rounded-full transition-all duration-500 ${['reset', 'done'].includes(step) && i === 0 ? 'bg-[#96ce54]' :
                    step === 'done' && i === 1 ? 'bg-[#96ce54]' : 'bg-slate-100'
                    }`} />}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Enter Email ── */}
              {step === 'email' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-7">
                    <h1 className="text-[2rem] font-extrabold text-[#3a3f36] tracking-tight leading-[1.15] mb-2">
                      Forgot password?
                    </h1>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      No worries — enter your email and we'll send you a 6-digit reset code.
                    </p>
                  </div>

                  <form onSubmit={handleSendOTP} noValidate className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); clearError('email'); }}
                          className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${errors.email
                            ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-[#96ce54] focus:ring-2 focus:ring-[#96ce54]/20'
                            }`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.email}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-[#96ce54] hover:bg-[#86b94a] active:scale-[0.98] text-slate-900 font-bold text-sm transition-all mt-2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#96ce54]/20"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin" />
                      ) : (
                        <> Send Code <ArrowRight size={15} /> </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2: OTP + New Password ── */}
              {step === 'reset' && (
                <motion.div
                  key="reset-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-7">
                    <h1 className="text-[2rem] font-extrabold text-[#3a3f36] tracking-tight leading-[1.15] mb-2">
                      Reset password
                    </h1>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      We sent a code to <span className="font-bold text-slate-700">{email}</span>. Enter it below with your new password.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} noValidate className="space-y-4">
                    {/* OTP Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 pl-1">
                        <label className="block text-xs font-bold text-slate-600">
                          Verification code
                        </label>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isResending}
                          className="text-[11px] font-bold text-[#83b547] hover:text-[#729e3e] transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-60"
                        >
                          {isResending ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                          Resend code
                        </button>
                      </div>
                      <div className="relative">
                        <Hash size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={otp}
                          onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); clearError('otp'); }}
                          className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-bold tracking-[0.3em] text-slate-800 bg-white placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none transition-all ${errors.otp
                            ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-[#96ce54] focus:ring-2 focus:ring-[#96ce54]/20'
                            }`}
                          placeholder="123456"
                          autoFocus
                          autoComplete="one-time-code"
                        />
                      </div>
                      {errors.otp && (
                        <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.otp}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                        New password
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); clearError('password'); }}
                          className={`w-full pl-10 pr-11 py-3.5 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${errors.password
                            ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-[#96ce54] focus:ring-2 focus:ring-[#96ce54]/20'
                            }`}
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                          className={`w-full pl-10 pr-11 py-3.5 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${errors.confirmPassword
                            ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-[#96ce54] focus:ring-2 focus:ring-[#96ce54]/20'
                            }`}
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-[#96ce54] hover:bg-[#86b94a] active:scale-[0.98] text-slate-900 font-bold text-sm transition-all mt-2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#96ce54]/20"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin" />
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === 'done' && (
                <motion.div
                  key="done-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-4"
                >
                  <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-[#e8f7d4] flex items-center justify-center">
                      <CheckCircle size={36} className="text-[#96ce54]" />
                    </div>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#3a3f36] mb-2">Password reset!</h2>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                    Your password has been updated successfully. Redirecting you to sign in…
                  </p>
                  <Link
                    to="/login"
                    className="inline-block w-full py-3.5 rounded-2xl bg-[#96ce54] hover:bg-[#86b94a] text-slate-900 font-bold text-sm text-center transition-all shadow-md shadow-[#96ce54]/20"
                  >
                    Go to Sign In
                  </Link>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          {step !== 'done' && (
            <div className="px-10 pb-8 text-center">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors"
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
