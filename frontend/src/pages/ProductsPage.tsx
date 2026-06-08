import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, Search, Plus, Filter, AlertCircle, RefreshCw,
  Edit3, Trash2, DollarSign, BarChart3, ShoppingBag, Archive
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { getProducts, getProductAnalytics, createProduct, updateProduct, deleteProduct } from '../services/api';
import { Product } from '../types';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Software', 'Hardware', 'Service', 'Subscription', 'Consulting', 'Other'];
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-950', text: 'text-emerald-300' },
  inactive: { bg: 'bg-slate-800', text: 'text-slate-300' },
  out_of_stock: { bg: 'bg-rose-950', text: 'text-rose-300' },
};

const ProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Software' as string, sku: '', stock: '0', status: 'active' as string,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', search, categoryFilter],
    queryFn: () => getProducts({ search: search || undefined, category: categoryFilter || undefined, limit: 100 }),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['product-analytics'],
    queryFn: getProductAnalytics,
  });

  const createMut = useMutation({
    mutationFn: (d: Partial<Product>) => createProduct(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-analytics'] });
      showToast('Product created', 'success');
      setShowModal(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: Partial<Product> }) => updateProduct(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('Product updated', 'success');
      setShowModal(false);
      setEditProduct(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); showToast('Product deleted', 'success'); },
  });

  const products = data?.products || [];
  const analytics = analyticsData?.analytics;

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', category: 'Software', sku: '', stock: '0', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, sku: p.sku || '', stock: String(p.stock), status: p.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: form.name, description: form.description, price: Number(form.price),
      category: form.category, sku: form.sku, stock: Number(form.stock), status: form.status,
    };
    if (editProduct) updateMut.mutate({ id: editProduct._id, data: payload });
    else createMut.mutate(payload);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load products.</p>
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
            <Package size={22} className="text-brand-400" /> Products Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage your product inventory and track performance.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 self-start md:self-auto">
          <Plus size={14} /> Add Product
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {analyticsLoading ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard title="Total Products" value={String(analytics?.totalProducts ?? 0)} icon={<Package size={15} />} accentColor="from-brand-500 to-brand-700" />
            <StatCard title="Active" value={String(analytics?.activeProducts ?? 0)} icon={<BarChart3 size={15} />} accentColor="from-emerald-500 to-emerald-700" />
            <StatCard title="Out of Stock" value={String(analytics?.outOfStock ?? 0)} icon={<Archive size={15} />} accentColor="from-rose-500 to-rose-700" />
            <StatCard title="Total Revenue" value={fmtCurrency(analytics?.totalRevenue ?? 0)} icon={<DollarSign size={15} />} accentColor="from-indigo-500 to-indigo-700" />
            <StatCard title="Units Sold" value={String(analytics?.totalUnitsSold ?? 0)} icon={<ShoppingBag size={15} />} accentColor="from-amber-500 to-amber-700" />
          </>
        )}
      </div>

      {/* Category Chart */}
      {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Revenue by Category</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={200} className="max-w-xs">
              <PieChart>
                <Pie data={analytics.categoryBreakdown} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2} strokeWidth={0}>
                  {analytics.categoryBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: any) => fmtCurrency(val)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3">
              {analytics.categoryBreakdown.map((item: any, i: number) => (
                <div key={item.category} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{item.category}</span>
                  <span className="text-2xs text-slate-600">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full !pl-10" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="glass-input !pl-10 pr-8 appearance-none cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />) :
               products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">No products found.</td></tr>
              ) : products.map((p: Product) => (
                <tr key={p._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-white">{p.name}</p>
                    {p.sku && <p className="text-2xs text-slate-500">SKU: {p.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{fmtCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-xs text-slate-300 font-semibold">{p.stock}</td>
                  <td className="px-4 py-3 text-xs font-bold text-emerald-400">{fmtCurrency(p.revenue)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${statusConfig[p.status]?.bg} ${statusConfig[p.status]?.text}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"><Edit3 size={13} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p._id); }} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditProduct(null); }} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Product Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="glass-input w-full" placeholder="Cloud Analytics Pro" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="glass-input w-full h-20 resize-none" placeholder="Product description..." />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Price ($)</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="glass-input w-full cursor-pointer">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="glass-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">SKU</label>
              <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="glass-input w-full" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="glass-input w-full cursor-pointer">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditProduct(null); }} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? 'Saving...' : editProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
