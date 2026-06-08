import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Search, Plus, Filter, AlertCircle, RefreshCw,
  HeartPulse, AlertTriangle, BarChart3
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { getAccounts, getAccountAnalytics, createAccount } from '../services/api';
import { Account } from '../types';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, ChartSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const AccountsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ companyName: '', industry: '', region: '', healthScore: '75' });

  const { data: accountsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['accounts', search, industryFilter],
    queryFn: () => getAccounts({ search: search || undefined, industry: industryFilter || undefined }),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['account-analytics'],
    queryFn: getAccountAnalytics,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => createAccount(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-analytics'] });
      showToast('Account created', 'success');
      setShowModal(false);
    },
  });

  const accounts = accountsData?.accounts || [];
  const analytics = analyticsData?.analytics;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({
      companyName: form.companyName,
      industry: form.industry,
      region: form.region,
      healthScore: Number(form.healthScore),
    });
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load accounts.</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors cursor-pointer">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 size={22} className="text-brand-400" /> Client Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">Monitor client health, industry analytics, and churn risk.</p>
        </div>
        <button onClick={() => { setForm({ companyName: '', industry: '', region: '', healthScore: '75' }); setShowModal(true); }} className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 self-start md:self-auto">
          <Plus size={14} /> New Account
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Accounts" value={String(analytics?.healthSummary?.totalAccounts ?? 0)} icon={<Building2 size={15} />} accentColor="from-brand-500 to-brand-700" />
            <StatCard title="Avg Health" value={`${analytics?.healthSummary?.averageHealth ?? 0}%`} icon={<HeartPulse size={15} />} accentColor="from-emerald-500 to-emerald-700" />
            <StatCard title="Churn Risk" value={String(analytics?.healthSummary?.churnRiskCount ?? 0)} icon={<AlertTriangle size={15} />} accentColor="from-rose-500 to-rose-700" />
            <StatCard title="Healthy" value={String(analytics?.healthSummary?.healthyCount ?? 0)} icon={<HeartPulse size={15} />} accentColor="from-cyan-500 to-cyan-700" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* By Industry */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Revenue by Industry</h2>
          <p className="text-[10px] text-slate-500 font-medium mb-4">Industry-wise revenue distribution</p>
          {analyticsLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics?.revenueByIndustry || []} dataKey="revenue" nameKey="industry" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2} strokeWidth={0}>
                  {(analytics?.revenueByIndustry || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => fmtCurrency(val)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {(analytics?.revenueByIndustry || []).map((item: any, i: number) => (
              <div key={item.industry} className="flex items-center gap-1.5 text-2xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.industry}
              </div>
            ))}
          </div>
        </div>

        {/* By Region */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Revenue by Region</h2>
          <p className="text-[10px] text-slate-500 font-medium mb-4">Regional revenue comparison</p>
          {analyticsLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.revenueByRegion || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: any) => fmtCurrency(val)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full !pl-10" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="glass-input !pl-10 pr-8 appearance-none cursor-pointer">
            <option value="">All Industries</option>
            {['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'].map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Health Score</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Churn Risk</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : accounts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">No accounts found.</td></tr>
              ) : (
                accounts.map((acc: Account) => (
                  <tr key={acc._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/10 flex-shrink-0">
                          <Building2 size={13} className="text-brand-400" />
                        </div>
                        <span className="text-xs font-semibold text-white">{acc.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{acc.industry}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{acc.region}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${acc.healthScore >= 70 ? 'bg-emerald-500' : acc.healthScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${acc.healthScore}%` }}
                          />
                        </div>
                        <span className="text-2xs text-slate-400 font-bold">{acc.healthScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">{acc.revenue ? fmtCurrency(acc.revenue) : '—'}</td>
                    <td className="px-4 py-3">
                      {acc.churnRiskFlag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950 text-rose-300 text-2xs font-bold rounded-full">
                          <AlertTriangle size={10} /> At Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-950 text-emerald-300 text-2xs font-bold rounded-full">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Client Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Company Name</label>
            <input type="text" required value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="glass-input w-full" placeholder="Acme Corporation" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Industry</label>
              <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="glass-input w-full cursor-pointer" required>
                <option value="">Select...</option>
                {['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Region</label>
              <input type="text" required value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="glass-input w-full" placeholder="North America" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Health Score (0-100)</label>
            <input type="number" min="0" max="100" value={form.healthScore} onChange={e => setForm({ ...form, healthScore: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {createMut.isPending ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
