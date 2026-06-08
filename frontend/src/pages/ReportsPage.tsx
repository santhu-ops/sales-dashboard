import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileBarChart, Download, FileSpreadsheet, FileText,
  AlertCircle, RefreshCw, DollarSign, TrendingUp, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getRevenueOverview, exportRevenueExcel, exportRevenuePDF } from '../services/api';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['revenue-overview'],
    queryFn: getRevenueOverview,
  });

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      const blob = await exportRevenueExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SalesFlow_Revenue_Report.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Excel report downloaded', 'success');
    } catch (err) {
      showToast('Failed to export Excel', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      const blob = await exportRevenuePDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SalesFlow_Executive_Report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('PDF report downloaded', 'success');
    } catch (err) {
      showToast('Failed to export PDF', 'error');
    } finally {
      setExporting(null);
    }
  };

  const metrics = data?.metrics;
  const trend = data?.trend || [];
  const breakdown = data?.breakdown || [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load report data.</p>
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
            <FileBarChart size={22} className="text-brand-400" /> Revenue Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate and export executive-level revenue reports.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportExcel}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {exporting === 'excel' ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            {exporting === 'pdf' ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <FileText size={14} />
            )}
            Export PDF
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Revenue" value={fmt(metrics?.totalRevenue ?? 0)} trend={metrics?.growthPercentage} icon={<DollarSign size={15} />} accentColor="from-emerald-500 to-emerald-700" />
            <StatCard title="Monthly Revenue" value={fmt(metrics?.monthlyRevenue ?? 0)} icon={<Calendar size={15} />} accentColor="from-brand-500 to-brand-700" />
            <StatCard title="Annual Run Rate" value={fmt(metrics?.arr ?? 0)} icon={<TrendingUp size={15} />} accentColor="from-indigo-500 to-indigo-700" />
            <StatCard title="Growth Rate" value={`${metrics?.growthPercentage ?? 0}%`} trend={metrics?.growthPercentage} icon={<TrendingUp size={15} />} accentColor="from-cyan-500 to-cyan-700" />
          </>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Revenue Trend</h2>
            <p className="text-[10px] text-slate-500 font-medium">Revenue and deals count over time</p>
          </div>
        </div>
        {isLoading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reportGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val: any, name: any) => [name === 'revenue' ? fmtCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Deals']} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#reportGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stage Breakdown */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Revenue by Deal Stage</h2>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-800/50 rounded-xl" />)}
          </div>
        ) : breakdown.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No breakdown data available.</p>
        ) : (
          <div className="space-y-3">
            {breakdown.map((item: any) => {
              const maxValue = Math.max(...breakdown.map((b: any) => b.value));
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <div key={item.stage} className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-300 w-28 flex-shrink-0">{item.stage}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 w-20 text-right">{fmtCurrency(item.value)}</span>
                  <span className="text-2xs text-slate-500 w-10 text-right font-bold">{item.count} deals</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Available Report Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/30 border border-slate-800/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <FileSpreadsheet size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Excel Spreadsheet (.xlsx)</h3>
                <p className="text-2xs text-slate-500">Full data export with charts and pivot tables</p>
              </div>
            </div>
            <p className="text-2xs text-slate-500 mt-2">Includes monthly trends, stage breakdowns, and KPI summaries in a formatted Excel workbook powered by ExcelJS.</p>
          </div>
          <div className="p-4 bg-slate-950/30 border border-slate-800/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                <FileText size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Executive PDF Summary (.pdf)</h3>
                <p className="text-2xs text-slate-500">Board-ready formatted report</p>
              </div>
            </div>
            <p className="text-2xs text-slate-500 mt-2">Generates a polished PDF report with visual charts, revenue metrics, and executive-level summaries via Puppeteer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
