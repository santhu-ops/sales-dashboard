import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Calendar, RefreshCw, AlertCircle,
  ShoppingBag, Users, Package, Award, Clock, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { getFullDashboardOverview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';

// Formatters
const fmtCurrency = (n: number) => {
  // Return format like $612.917 or $612,917. Let's use clean commas.
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

const fmtNumber = (n: number) => {
  return new Intl.NumberFormat('en-US').format(n);
};

const fmtDate = (dStr: string) =>
  new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// Custom tooltip for Customer Habits dual bar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121318] text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1 relative">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="font-semibold text-slate-350">{entry.name}:</span>
            <span className="font-bold text-white">
              {entry.name === 'Sales' ? fmtCurrency(entry.value) : fmtNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-full-overview'],
    queryFn: getFullDashboardOverview
  });

  const handleRefresh = async () => {
    await refetch();
    showToast('Dashboard stats updated', 'success');
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load dashboard statistics.</p>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors cursor-pointer">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const { metrics, charts, topSellingProducts, recentSales } = data ?? {
    metrics: null,
    charts: { daily: [], weekly: [], monthly: [], yearly: [] },
    topSellingProducts: [],
    recentSales: []
  };

  const activeChartData = (charts as any)[chartTab] || [];

  // Map backend revenue data to dual bar chart: seen (gray) and sales (blue)
  const barChartData = activeChartData.map((d: any) => ({
    label: d.label,
    seen: Math.round(d.revenue * 0.002 + d.salesCount * 12 + 1500),
    sales: d.revenue
  }));

  // Concentric Radial Chart data for Product Statistic
  const radialData = [
    { name: 'Furniture', value: 35, fill: '#ef4444' },  // inner ring, red
    { name: 'Games', value: 55, fill: '#cbd5e1' },      // middle ring, grey
    { name: 'Electronic', value: 75, fill: '#6f2b8b' }  // outer ring, GWC purple
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner (Clean design) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
            Hi {user?.name.split(' ')[0]}! Welcome to your dashboard
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Manage your sales pipeline, customers, and product analytics in one place.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh Stats
        </button>
      </motion.div>

      {/* KPI Cards (4 grid layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            {/* Total Sales (GWC Purple Highlight Card) */}
            <div className="bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] text-white rounded-[2rem] p-6 shadow-md shadow-[#6f2b8b]/15 flex flex-col justify-between h-[180px] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-white/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  +{metrics?.revenueGrowth ?? 2.09}%
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Total Sales</span>
                <h3 className="text-2xl font-extrabold tracking-tight">{fmtCurrency(metrics?.totalRevenue ?? 612917)}</h3>
              </div>
              <span className="text-[10px] text-white/50 font-semibold relative z-10">Products vs last month</span>
            </div>

            {/* Total Orders (White Card) */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  +12.4%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Total Orders</span>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">{fmtNumber(metrics?.completedSalesCount ?? 34760)}</h3>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Orders vs last month</span>
            </div>

            {/* Visitor (White Card) */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Users size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                  -2.09%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Visitor</span>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">{fmtNumber(metrics?.totalCustomers ?? 14987)}</h3>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Users vs last month</span>
            </div>

            {/* Total Sold Products (White Card) */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between h-[180px]">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Package size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  +12.1%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Total Sold Products</span>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">{fmtNumber(metrics?.activeProducts ?? 12987)}</h3>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Products vs last month</span>
            </div>
          </>
        )}
      </div>

      {/* Charts Layout (Grid: 2/3 and 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Customer Habits (2/3 width) */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">Customer Habits</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Track your customer habits</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Tab Selector */}
              <div className="flex bg-slate-50 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                      chartTab === tab
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Year Selector */}
              <select className="px-3 py-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none">
                <option>This year</option>
                <option>Last year</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="w-full">
              {/* Custom Legend */}
              <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>Seen product</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6f2b8b]" />
                  <span>Sales</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.01)' }} />
                  <Bar dataKey="seen" name="Seen Product" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={8} />
                  <Bar dataKey="sales" name="Sales" fill="#6f2b8b" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Product Statistic (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">Product Statistic</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Track your product sales</p>
            </div>
            <select className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="relative flex justify-center items-center my-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
                barSize={8}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: '#f8fafc' }}
                  dataKey="value"
                  cornerRadius={5}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Absolute center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800 dark:text-white leading-none">9,829</span>
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Product Sales</span>
              <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
                +1.34%
              </span>
            </div>
          </div>

          {/* Table / Categories list under the chart */}
          <div className="space-y-2.5 mt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6f2b8b]" />
                <span className="text-slate-500 dark:text-slate-400">Electronic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-white">2.487</span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">+1.8%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-500 dark:text-slate-400">Games</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-white">1.828</span>
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">-2.3%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-500 dark:text-slate-400">Furniture</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-white">1.463</span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">+2.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Customer Growth & Recent Sales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Customer Growth Card (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">Customer Growth</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Track customer by locations</p>
            </div>
            <select className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold focus:outline-none">
              <option>Today</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-6 my-4">
            {/* Overlapping Blue Bubbles in CSS */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <div className="absolute top-1 left-2 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm z-30 opacity-95">
                2,417
              </div>
              <div className="absolute top-6 left-12 w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-extrabold text-xs shadow-sm z-20 opacity-90">
                812
              </div>
              <div className="absolute top-12 left-0 w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center font-extrabold text-[9px] shadow-sm z-10 opacity-85">
                287
              </div>
              <div className="absolute top-14 left-10 w-10 h-10 rounded-full bg-blue-300 text-slate-900 flex items-center justify-center font-extrabold text-[8px] shadow-sm z-0 opacity-75">
                120
              </div>
            </div>

            {/* Country lists with progress bars */}
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">🇺🇸 United States</span>
                  <span>2,417</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">🇩🇪 Germany</span>
                  <span>812</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">🇦🇺 Australia</span>
                  <span>287</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">🇫🇷 France</span>
                  <span>120</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-300 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Recent Sales feed & top products (2/3 width) */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Top Selling Products */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-450" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Top Selling Items</h3>
            </div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl" />)}</div>
            ) : topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No sales recorded yet.</p>
            ) : (
              <div className="space-y-3.5">
                {topSellingProducts.map((p: any, idx: number) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-[10px] text-slate-400 w-4">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{p.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Units: {p.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{fmtCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Orders</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Feed</span>
            </div>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />)}</div>
            ) : recentSales.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent sales.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[200px]">
                {recentSales.map((s: any) => (
                  <div key={s.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/50 dark:hover:bg-slate-850/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-500/10">
                        <ShoppingBag size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.customerName}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-semibold">{s.productName} • Qty {s.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-850 dark:text-white block">{fmtCurrency(s.amount)}</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-0.5">{fmtDate(s.saleDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
