import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters')
});

type LoginFields = zod.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@salesdashboard.com',
      password: 'Password123'
    }
  });

  const onSubmit = async (data: LoginFields) => {
    setIsFormSubmitting(true);
    try {
      const result = await login(data.email, data.password);
      if (result && result.needsVerification) {
        showToast('Please verify your email. An OTP has been sent.', 'info');
        navigate('/verify-otp', { state: { email: result.email } });
      } else {
        showToast('Welcome back to GWC Workspace!', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleQuickAnalysis = () => {
    showToast('Entering guest view for Sales Analysis...', 'info');
    navigate('/dashboard');
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
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-[#262626]">
                <div className="flex gap-0.5 items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] text-white font-extrabold text-sm">
                  G
                </div>
                <span>GWC <span className="text-[#6f2b8b]">DATA.AI</span></span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-[2rem] font-extrabold text-slate-800 tracking-tight leading-[1.15] mb-1.5">
                Sign in to workspace
              </h1>
              <p className="text-[13px] text-slate-500">
                GWC Enterprise AI &amp; Sales Workspace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20'
                    }`}
                    placeholder="you@gwcdata.ai"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[11px] font-bold text-[#6f2b8b] hover:text-[#5b2074] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full pl-10 pr-11 py-3.5 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isFormSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6f2b8b] to-[#b56dd3] hover:opacity-95 active:scale-[0.98] text-white font-bold text-sm transition-all mt-3 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#6f2b8b]/20"
              >
                {isFormSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            {/* Quick Access Link / Sales Dashboard details analysis link */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
              <button
                type="button"
                onClick={handleQuickAnalysis}
                className="w-full py-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BarChart2 size={14} className="text-[#6f2b8b]" />
                Sales Dashboard Details Analysis
              </button>
            </div>

            {/* Bottom prompts */}
            <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
              By signing in you agree to GWC's <br />
              <span className="font-semibold text-[#6f2b8b]">Terms of Services</span> and <span className="font-semibold text-[#6f2b8b]">Privacy Policy</span>.
            </p>

            <p className="text-center text-xs text-slate-400 mt-5 font-medium">
              Don't have an account? <Link to="/register" className="font-bold text-[#6f2b8b] hover:underline">Register</Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
