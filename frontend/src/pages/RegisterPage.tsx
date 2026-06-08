import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Invalid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: zod.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegisterFields = zod.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema)
  });

  const passwordValue = watch('password', '');

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(passwordValue);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    try {
      const result = await registerUser(data.name, data.email, data.password);
      showToast('Account created! Check your email for the verification code.', 'success');
      navigate('/verify-otp', { state: { email: result.email } });
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
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

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-[2rem] font-extrabold text-[#3a3f36] tracking-tight leading-[1.15] mb-1.5">
                Create an account
              </h1>
              <p className="text-[13px] text-slate-500">
                Sign up to start managing your GWC workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.name
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.name.message}</p>
                )}
              </div>

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
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20'
                    }`}
                    placeholder="Min. 8 characters"
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
                {passwordValue && (
                  <div className="mt-2.5 px-1">
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{strengthLabels[strength]} password</p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl border text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-[#6f2b8b] focus:ring-2 focus:ring-[#6f2b8b]/20'
                    }`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6f2b8b] to-[#b56dd3] hover:opacity-95 active:scale-[0.98] text-white font-bold text-sm transition-all mt-3 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#6f2b8b]/20"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            {/* Bottom prompts */}
            <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
              By creating an account you agree to GWC's <br />
              <span className="font-semibold text-[#6f2b8b]">Terms of Services</span> and <span className="font-semibold text-[#6f2b8b]">Privacy Policy</span>.
            </p>

            <p className="text-center text-xs text-slate-400 mt-5 font-medium">
              Already have an account? <Link to="/login" className="font-bold text-[#6f2b8b] hover:underline">Log in</Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
