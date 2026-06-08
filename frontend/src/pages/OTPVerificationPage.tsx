import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const { verifyOTP, resendOTP } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as any)?.email || '';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      showToast('No email found. Please register first.', 'warning');
      navigate('/login');
    }
  }, [email, navigate, showToast]);

  useEffect(() => {
    if (timeLeft <= 0 || isVerified) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isVerified]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleInputChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (data.length === 6 && !isNaN(Number(data))) {
      setOtp(data.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { showToast('Enter all 6 digits.', 'warning'); return; }
    setIsVerifying(true);
    try {
      await verifyOTP(email, code);
      setIsVerified(true);
      showToast('Verification successful! Welcome to GWC Workspace.', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Verification failed.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP(email);
      setTimeLeft(600);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      showToast('New code sent to your email.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3ebf8] flex items-center justify-center p-4 lg:p-8">
      {/* Premium Split Layout Wrapper */}
      <div className="w-full max-w-5xl bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(111,43,139,0.15)] p-4 lg:p-6 flex flex-col lg:flex-row items-stretch gap-6">
        
        {/* Left Side: Illustration Container */}
        <div className="hidden lg:flex lg:w-1/2 relative rounded-[2rem] overflow-hidden min-h-[500px]">
          <img 
            src="/illustration.png" 
            alt="GWC Data Workspace" 
            className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#6f2b8b]/40 to-transparent pointer-events-none rounded-[2rem]" />
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full bg-white rounded-[2rem] px-8 py-10 lg:px-12 lg:py-12 shadow-sm flex flex-col justify-center min-h-[500px]"
          >
            {/* GWC Brand Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-[#262626]">
                <div className="flex gap-0.5 items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] text-white font-extrabold text-sm">
                  G
                </div>
                <span>GWC <span className="text-[#6f2b8b]">DATA.AI</span></span>
              </div>
            </div>

            {isVerified ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <CheckCircle size={56} className="text-[#6f2b8b] mx-auto mb-4" />
                <h2 className="text-lg font-bold text-slate-800">Email Verified!</h2>
                <p className="text-xs text-slate-500 mt-1">Preparing your workspace…</p>
              </motion.div>
            ) : (
              <div>
                {/* Heading */}
                <div className="text-center mb-6">
                  <h1 className="text-[2rem] font-extrabold text-slate-800 tracking-tight leading-[1.15] mb-1.5">
                    Security Verification
                  </h1>
                  <p className="text-[13px] text-slate-500">
                    We sent a 6-digit code to <span className="font-bold text-slate-700">{email}</span>.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2.5 text-center">
                      Verification code
                    </label>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          onChange={(e) => handleInputChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          onPaste={idx === 0 ? handlePaste : undefined}
                          className="w-10 h-12 lg:w-12 lg:h-14 text-center text-lg lg:text-xl font-bold rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20 transition-all"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-400 font-medium">Code expires in:</span>
                    {timeLeft > 0 ? (
                      <span className={`font-bold ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-[#6f2b8b]'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-bold">
                        <ShieldAlert size={12} /> Expired
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isVerifying || timeLeft <= 0}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6f2b8b] to-[#b56dd3] hover:opacity-95 active:scale-[0.98] text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#6f2b8b]/20"
                    >
                      {isVerifying ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Verify Code <ArrowRight size={15} /></>
                      )}
                    </button>

                    {/* Resend code */}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || (timeLeft > 0 && timeLeft > 540)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-45 disabled:pointer-events-none"
                    >
                      {resending ? (
                        <span className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin" />
                      ) : (
                        <><RefreshCw size={12} /> Resend Code</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Footer link */}
            <div className="text-center mt-6">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors">
                ← Back to Sign In
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default OTPVerificationPage;
