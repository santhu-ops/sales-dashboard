import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, BarChart3, Users, Zap } from 'lucide-react';
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
        showToast('Welcome back to SalesFlow!', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e4efd2] p-6 lg:p-12 overflow-hidden relative">

      {/* Background image / illustration container */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] flex items-center justify-center p-8 z-0">
        <img
          src="/illustration.png"
          alt="3D Illustration"
          className="w-full h-full object-cover rounded-3xl opacity-90 shadow-xl"
        />
      </div>

      {/* Floating White Card */}
      <div className="w-full h-full max-w-6xl flex justify-end relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col justify-center my-auto min-h-[600px]"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-5 h-5 bg-[#96ce54] rounded-sm flex items-center justify-center text-white rotate-45">
              <div className="w-2 h-2 bg-white rounded-full -rotate-45" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">salesflow</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-[2.25rem] font-extrabold text-[#3a3f36] tracking-tight leading-[1.1]">
              Sign in to<br />workspace
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="email"
                {...register('email')}
                className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#96ce54] focus:ring-1 focus:ring-[#96ce54] transition-colors"
                placeholder="Email address"
              />
              {errors.email && <p className="text-xs text-rose-500 font-semibold mt-1 px-4">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#96ce54] focus:ring-1 focus:ring-[#96ce54] transition-colors"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-4">
                {errors.password ? (
                  <p className="text-xs text-rose-500 font-semibold">{errors.password.message}</p>
                ) : (
                  <div />
                )}
                <Link to="/forgot-password" className="text-xs font-semibold text-[#83b547] hover:text-[#729e3e] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isFormSubmitting}
              className="w-full py-3.5 rounded-full bg-[#96ce54] hover:bg-[#86b94a] text-slate-900 font-bold text-sm transition-colors mt-2"
            >
              {isFormSubmitting ? (
                <span className="w-5 h-5 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin inline-block align-middle" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>



          <p className="text-center text-[9px] text-slate-400 mt-8 leading-relaxed px-4">
            By signing in you agree to SalesFlow's <br />
            <span className="font-semibold text-[#83b547]">Terms of Services</span> and <span className="font-semibold text-[#83b547]">Privacy Policy</span>.
          </p>

          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Don't have an account? <Link to="/register" className="font-bold text-[#83b547]">Register</Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
