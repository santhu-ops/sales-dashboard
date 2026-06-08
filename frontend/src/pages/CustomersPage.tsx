import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Search, Plus, Filter, AlertCircle, RefreshCw,
  Edit3, Trash2, Mail, Phone, Building, MapPin, Tag
} from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { Customer } from '../types';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-950', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  inactive: { bg: 'bg-slate-800', text: 'text-slate-300', dot: 'bg-slate-400' },
  lead: { bg: 'bg-blue-950', text: 'text-blue-300', dot: 'bg-blue-400' },
  churned: { bg: 'bg-rose-950', text: 'text-rose-300', dot: 'bg-rose-400' },
};

const CustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '',
    status: 'lead' as string, city: '', country: '', notes: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', search, statusFilter],
    queryFn: () => getCustomers({ search: search || undefined, status: statusFilter || undefined, limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: (d: Partial<Customer>) => createCustomer(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast('Customer created', 'success'); setShowModal(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: Partial<Customer> }) => updateCustomer(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast('Customer updated', 'success'); setShowModal(false); setEditCustomer(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); showToast('Customer deleted', 'success'); },
  });

  const customers = data?.customers || [];

  const openCreate = () => {
    setEditCustomer(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'lead', city: '', country: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({
      firstName: c.firstName, lastName: c.lastName, email: c.email,
      phone: c.phone || '', company: c.company || '', status: c.status,
      city: c.city || '', country: c.country || '', notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editCustomer) updateMut.mutate({ id: editCustomer._id, data: payload });
    else createMut.mutate(payload);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load customers.</p>
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
            <Users size={22} className="text-brand-400" /> Customers CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage customer relationships, contacts, and spending.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 self-start md:self-auto">
          <Plus size={14} /> Add Customer
        </button>
      </motion.div>

      {/* Stats Strip */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <Users size={14} className="text-brand-400" />
          <span className="text-xs font-bold text-white">{data?.totalCustomers ?? customers.length}</span>
          <span className="text-2xs text-slate-500 font-semibold">Total Customers</span>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-white">{customers.filter((c: Customer) => c.status === 'active').length}</span>
          <span className="text-2xs text-slate-500 font-semibold">Active</span>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs font-bold text-white">{customers.filter((c: Customer) => c.status === 'lead').length}</span>
          <span className="text-2xs text-slate-500 font-semibold">Leads</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full !pl-10" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-input !pl-10 pr-8 appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Lead</option>
            <option value="churned">Churned</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Spend</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />) :
                customers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">No customers found.</td></tr>
                ) : customers.map((c: Customer) => {
                  const sc = statusConfig[c.status] || statusConfig.lead;
                  return (
                    <tr key={c._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-2xs font-bold flex-shrink-0">
                            {c.firstName?.[0]}{c.lastName?.[0]}
                          </div>
                          <span className="text-xs font-semibold text-white">{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-2xs text-slate-400 flex items-center gap-1"><Mail size={10} /> {c.email}</span>
                          {c.phone && <span className="text-2xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{c.company || '—'}</td>
                      <td className="px-4 py-3 text-2xs text-slate-400">
                        {c.city || c.country ? (
                          <span className="flex items-center gap-1"><MapPin size={10} /> {[c.city, c.country].filter(Boolean).join(', ')}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-400">{fmtCurrency(c.totalSpend)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"><Edit3 size={13} /></button>
                          <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(c._id); }} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"><Trash2 size={13} /></button>
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
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditCustomer(null); }} title={editCustomer ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">First Name</label>
              <input type="text" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Last Name</label>
              <input type="text" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="glass-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="glass-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Country</label>
              <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="glass-input w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="glass-input w-full cursor-pointer">
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="glass-input w-full h-16 resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditCustomer(null); }} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? 'Saving...' : editCustomer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
