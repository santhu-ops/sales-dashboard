import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, Mail, Shield, Calendar, Save, Camera,
  Building, Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from '../components/ui/Badge';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UserCircle size={22} className="text-brand-400" /> My Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account information and settings.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={(user as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl border-2 border-slate-800 object-cover shadow-xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-extrabold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <RoleBadge role={user?.role || 'rep'} />
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 text-emerald-300 text-2xs font-bold rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{user?.role === 'admin' ? '∞' : '—'}</p>
              <p className="text-2xs text-slate-500 font-semibold">Deals</p>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <p className="text-lg font-extrabold text-white capitalize">{user?.role}</p>
              <p className="text-2xs text-slate-500 font-semibold">Role</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 max-w-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'security' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserCircle size={12} /> Full Name
              </label>
              <input type="text" defaultValue={user?.name} className="glass-input w-full" readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <input type="email" defaultValue={user?.email} className="glass-input w-full" readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Shield size={12} /> Role
              </label>
              <input type="text" defaultValue={user?.role} className="glass-input w-full capitalize" readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building size={12} /> Department
              </label>
              <input type="text" defaultValue={user?.department || 'Not assigned'} className="glass-input w-full" readOnly />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar size={12} /> Member Since
              </label>
              <input type="text" defaultValue={fmtDate(user?.createdAt)} className="glass-input w-full" readOnly />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Key size={15} className="text-amber-400" /> Security Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Current Password</label>
              <input type="password" placeholder="Enter current password" className="glass-input w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">New Password</label>
                <input type="password" placeholder="Enter new password" className="glass-input w-full" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Confirm Password</label>
                <input type="password" placeholder="Confirm new password" className="glass-input w-full" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => showToast('Password change not implemented in demo', 'info')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20"
              >
                <Save size={14} /> Update Password
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="mt-6 p-4 bg-slate-950/30 border border-slate-800/30 rounded-xl">
            <h4 className="text-xs font-bold text-white mb-2">Session Information</h4>
            <div className="grid grid-cols-2 gap-2 text-2xs">
              <span className="text-slate-500">Login Method:</span>
              <span className="text-slate-300 font-semibold">JWT Token</span>
              <span className="text-slate-500">Verification:</span>
              <span className={`font-semibold ${user?.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {user?.isVerified ? 'Email Verified' : 'Pending Verification'}
              </span>
              <span className="text-slate-500">Last Updated:</span>
              <span className="text-slate-300 font-semibold">{fmtDate(user?.updatedAt)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
