import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, Plus, Filter, AlertCircle, RefreshCw,
  Edit3, Trash2, DollarSign, Calendar, TrendingUp, UserCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getSales, getSalesSummary, createSale, updateSale, deleteSale, getCustomers, getProducts } from '../services/api';
import { Sale, Customer, Product } from '../types';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'bg-emerald-950', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  pending: { bg: 'bg-amber-950', text: 'text-amber-300', dot: 'bg-amber-400' },
  cancelled: { bg: 'bg-rose-950', text: 'text-rose-300', dot: 'bg-rose-400' },
  refunded: { bg: 'bg-slate-800', text: 'text-slate-300', dot: 'bg-slate-400' },
};

const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [status, setStatus] = useState('completed');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');

  const { data: salesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['sales', statusFilter],
    queryFn: () => getSales({ status: statusFilter || undefined, limit: 100 }),
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: getSalesSummary,
  });

  // Fetch customers and products for the form dropdowns
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => getCustomers({ limit: 100 }),
  });
  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => createSale(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
      showToast('Sale recorded successfully', 'success');
      setShowModal(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: Partial<Sale> }) => updateSale(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
      showToast('Sale updated', 'success');
      setShowModal(false);
      setEditSale(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
      showToast('Sale deleted', 'success');
    },
  });

  const sales = salesData?.sales || [];
  const summary = summaryData?.summary;
  
  // Filter sales locally if search is active (since backend might not support search param directly)
  const filteredSales = search
    ? sales.filter((s: Sale) => 
        s.saleNumber.toLowerCase().includes(search.toLowerCase()) || 
        s.customer.company?.toLowerCase().includes(search.toLowerCase()) ||
        `${s.customer.firstName} ${s.customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.product.name.toLowerCase().includes(search.toLowerCase())
      )
    : sales;

  const openCreate = () => {
    setEditSale(null);
    setCustomerId(''); setProductId(''); setQuantity('1'); setDiscount('0');
    setStatus('completed'); setPaymentMethod('credit_card'); setNotes('');
    setShowModal(true);
  };

  const openEdit = (s: Sale) => {
    setEditSale(s);
    setCustomerId(s.customer._id);
    setProductId(s.product._id);
    setQuantity(String(s.quantity));
    setDiscount(String(s.discount));
    setStatus(s.status);
    setPaymentMethod(s.paymentMethod);
    setNotes(s.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      customer: customerId,
      product: productId,
      quantity: Number(quantity),
      discount: Number(discount),
      status,
      paymentMethod,
      notes
    };
    
    if (editSale) {
      updateMut.mutate({ id: editSale._id, data: payload as any });
    } else {
      createMut.mutate(payload);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load sales data.</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors cursor-pointer"><RefreshCw size={14} /> Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag size={22} className="text-brand-400" /> Sales Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track finalized sales, invoices, and direct revenue.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 self-start md:self-auto">
          <Plus size={14} /> Record Sale
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard title="Total Sales" value={String(summary?.totalSales ?? 0)} icon={<ShoppingBag size={15} />} accentColor="from-brand-500 to-brand-700" />
            <StatCard title="Gross Revenue" value={fmtCurrency(summary?.totalRevenue ?? 0)} icon={<DollarSign size={15} />} accentColor="from-emerald-500 to-emerald-700" />
            <StatCard title="Monthly Revenue" value={fmtCurrency(summary?.monthlyRevenue ?? 0)} icon={<Calendar size={15} />} accentColor="from-indigo-500 to-indigo-700" />
            <StatCard title="Growth" value={`${summary?.growthRate ?? 0}%`} trend={summary?.growthRate} icon={<TrendingUp size={15} />} accentColor="from-cyan-500 to-cyan-700" />
          </>
        )}
      </div>

      {/* Charts */}
      {summary?.trend && summary.trend.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Sales Volume Trend</h2>
          <p className="text-[10px] text-slate-500 font-medium mb-4">Completed sales volume over recent months</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={summary.trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val: any, name: any) => [name === 'revenue' ? fmtCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Sales Count']} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar yAxisId="right" dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search sales by # or customer..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full !pl-10" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-input !pl-10 pr-8 appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Sale #</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Product / Qty</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />) :
               filteredSales.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">No sales records found.</td></tr>
              ) : filteredSales.map((s: Sale) => {
                const sc = statusConfig[s.status] || statusConfig.pending;
                return (
                  <tr key={s._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded">{s.saleNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-white">{s.customer.firstName} {s.customer.lastName}</p>
                      {s.customer.company && <p className="text-2xs text-slate-500 flex items-center gap-1"><UserCheck size={10} /> {s.customer.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-300">{s.product.name}</p>
                      <p className="text-2xs text-slate-500 font-semibold">{s.quantity} units @ {fmtCurrency(s.unitPrice)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(s.saleDate)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-emerald-400">{fmtCurrency(s.amount)}</p>
                      {s.discount > 0 && <p className="text-2xs text-rose-400">-{s.discount}%</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"><Edit3 size={13} /></button>
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                          <button onClick={() => { if (confirm('Delete this sale record?')) deleteMut.mutate(s._id); }} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditSale(null); }} title={editSale ? 'Edit Sale Record' : 'Record New Sale'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Customer</label>
              <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="glass-input w-full cursor-pointer">
                <option value="">Select customer...</option>
                {customersData?.customers?.map((c: Customer) => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Product</label>
              <select required value={productId} onChange={e => setProductId(e.target.value)} className="glass-input w-full cursor-pointer">
                <option value="">Select product...</option>
                {productsData?.products?.map((p: Product) => (
                  <option key={p._id} value={p._id}>{p.name} - {fmtCurrency(p.price)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
              <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Discount (%)</label>
              <input type="number" required min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="glass-input w-full cursor-pointer">
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="glass-input w-full cursor-pointer">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="glass-input w-full h-16 resize-none" placeholder="Optional notes..." />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditSale(null); }} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? 'Saving...' : editSale ? 'Update' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesPage;
