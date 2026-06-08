import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Trophy, BarChart3, DollarSign, Target, Percent, Activity,
  AlertCircle, RefreshCw, Medal, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import { getPerformanceStats, getLeaderboard } from '../services/api';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];
const medalBgs = ['bg-amber-500/10 border-amber-500/20', 'bg-slate-500/10 border-slate-500/20', 'bg-amber-700/10 border-amber-700/20'];

const TeamPerformancePage: React.FC = () => {
  const { data: statsData, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['performance-stats'],
    queryFn: getPerformanceStats,
  });

  const { data: boardData, isLoading: boardLoading, refetch: refetchBoard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  const handleRefresh = () => { refetchStats(); refetchBoard(); };

  const stats = statsData?.stats;
  const leaderboard = boardData?.leaderboard || [];

  // Chart data from leaderboard
  const revenueChartData = leaderboard.map((rep: any) => ({
    name: rep.name.split(' ')[0],
    revenue: rep.revenueGenerated,
    deals: rep.dealsCount,
  }));

  const radarData = leaderboard.slice(0, 5).map((rep: any) => ({
    name: rep.name.split(' ')[0],
    winRate: rep.winRate,
    deals: Math.min(rep.dealsCount * 10, 100),
    revenue: Math.min((rep.revenueGenerated / (stats?.totalRevenue || 1)) * 100, 100),
    activities: Math.min(rep.activitiesCount * 5, 100),
  }));

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load performance data.</p>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors cursor-pointer">
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
            <Trophy size={22} className="text-amber-400" /> Team Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track your team's revenue generation, deals, and win rates.</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer self-start md:self-auto">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} icon={<DollarSign size={15} />} accentColor="from-emerald-500 to-emerald-700" />
            <StatCard title="Pipeline Value" value={fmt(stats?.pipelineValue ?? 0)} icon={<TrendingUp size={15} />} accentColor="from-brand-500 to-brand-700" />
            <StatCard title="Total Deals" value={String(stats?.totalDeals ?? 0)} icon={<Target size={15} />} accentColor="from-indigo-500 to-indigo-700" />
            <StatCard title="Closed Won" value={String(stats?.closedWonCount ?? 0)} icon={<Trophy size={15} />} accentColor="from-amber-500 to-amber-700" />
            <StatCard title="Closed Lost" value={String(stats?.closedLostCount ?? 0)} icon={<BarChart3 size={15} />} accentColor="from-rose-500 to-rose-700" />
            <StatCard title="Avg Win Rate" value={`${stats?.averageWinRate ?? 0}%`} icon={<Percent size={15} />} accentColor="from-cyan-500 to-cyan-700" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue by Rep */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Revenue by Representative</h2>
          <p className="text-[10px] text-slate-500 font-medium mb-4">Individual performance breakdown</p>
          {boardLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: any) => [fmtCurrency(val), 'Revenue']} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Win Rate Chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Performance Radar</h2>
          <p className="text-[10px] text-slate-500 font-medium mb-4">Comparative skill metrics (top 5)</p>
          {boardLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Win Rate" dataKey="winRate" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                <Radar name="Deals" dataKey="deals" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Medal size={16} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Sales Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Deals</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Won</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Lost</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Win Rate</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Activities</th>
              </tr>
            </thead>
            <tbody>
              {boardLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800 animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800/50 rounded" /></td>)}
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-500">No performance data yet.</td></tr>
              ) : (
                leaderboard.map((rep: any, idx: number) => (
                  <tr key={rep.userId} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      {idx < 3 ? (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${medalBgs[idx]}`}>
                          <Trophy size={13} className={medalColors[idx]} />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-white">{rep.name}</p>
                      <p className="text-2xs text-slate-500">{rep.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">{fmtCurrency(rep.revenueGenerated)}</td>
                    <td className="px-4 py-3 text-xs text-slate-300 font-semibold">{rep.dealsCount}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-semibold">{rep.closedWonCount}</td>
                    <td className="px-4 py-3 text-xs text-rose-400 font-semibold">{rep.closedLostCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${rep.winRate}%` }} />
                        </div>
                        <span className="text-2xs text-slate-400 font-bold">{rep.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Activity size={11} /> {rep.activitiesCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformancePage;
