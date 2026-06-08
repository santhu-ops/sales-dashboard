import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Handshake, Search, Plus, Filter, LayoutGrid, List,
  AlertCircle, RefreshCw, DollarSign, ChevronRight, Trash2, Edit3
} from 'lucide-react';
import { getDeals, createDeal, updateDeal, deleteDeal, getSalesRepsList } from '../services/api';
import { Deal, DealStage } from '../types';
import { StageBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

const STAGES: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const stageColors: Record<DealStage, string> = {
  Lead: 'border-t-slate-400',
  Qualified: 'border-t-blue-400',
  Proposal: 'border-t-violet-400',
  Negotiation: 'border-t-amber-400',
  'Closed Won': 'border-t-emerald-400',
  'Closed Lost': 'border-t-rose-400',
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const DealsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({ title: '', value: '', stage: 'Lead', owner: '', probability: '50' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['deals', search, stageFilter],
    queryFn: () => getDeals({ search: search || undefined, stage: stageFilter || undefined, limit: 100 }),
  });

  const { data: reps } = useQuery({ queryKey: ['sales-reps'], queryFn: getSalesRepsList });

  const createMut = useMutation({
    mutationFn: (d: any) => createDeal(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deals'] }); showToast('Deal created', 'success'); setShowModal(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: any }) => updateDeal(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deals'] }); showToast('Deal updated', 'success'); setShowModal(false); setEditDeal(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deals'] }); showToast('Deal deleted', 'success'); },
  });

  const deals = data?.deals || [];

  const openCreate = () => {
    setEditDeal(null);
    setForm({ title: '', value: '', stage: 'Lead', owner: '', probability: '50' });
    setShowModal(true);
  };

  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setForm({
      title: deal.title,
      value: String(deal.value),
      stage: deal.stage,
      owner: deal.owner?.id || (deal.owner as any)?._id || '',
      probability: String(deal.probability),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      value: Number(form.value),
      stage: form.stage,
      owner: form.owner,
      probability: Number(form.probability),
    };
    if (editDeal) {
      updateMut.mutate({ id: editDeal._id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      updateMut.mutate({ id: dealId, data: { stage } });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load deals.</p>
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
            <Handshake size={22} className="text-brand-400" /> Deals Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage and track your sales deals through every stage.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-all cursor-pointer ${view === 'kanban' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutGrid size={13} />
            </button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-all cursor-pointer ${view === 'table' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <List size={13} />
            </button>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20">
            <Plus size={14} /> New Deal
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input w-full !pl-10"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="glass-input !pl-10 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map(stage => {
            const stageDeals = deals.filter((d: Deal) => d.stage === stage);
            return (
              <div
                key={stage}
                className={`glass-card p-3 border-t-2 ${stageColors[stage]} min-h-[200px]`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, stage)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stage}</h3>
                  <span className="text-2xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">{stageDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)
                  ) : stageDeals.length === 0 ? (
                    <p className="text-2xs text-slate-600 text-center py-4">Drop deals here</p>
                  ) : (
                    stageDeals.map((deal: Deal) => (
                      <div
                        key={deal._id}
                        draggable
                        onDragStart={e => handleDragStart(e, deal._id)}
                        onClick={() => openEdit(deal)}
                        className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl cursor-grab hover:border-brand-500/30 transition-all group"
                      >
                        <p className="text-xs font-semibold text-white truncate">{deal.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xs font-bold text-emerald-400">{fmtCurrency(deal.value)}</span>
                          <span className="text-2xs text-slate-500">{deal.probability}%</span>
                        </div>
                        {deal.owner && <p className="text-2xs text-slate-500 mt-1 truncate">{(deal.owner as any).name || 'Unassigned'}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Deal</th>
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Probability</th>
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : deals.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">No deals found.</td></tr>
                ) : (
                  deals.map((deal: Deal) => (
                    <tr key={deal._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-white">{deal.title}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-400">{fmtCurrency(deal.value)}</td>
                      <td className="px-4 py-3"><StageBadge stage={deal.stage} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="text-2xs text-slate-400 font-bold">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{(deal.owner as any)?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(deal)} className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this deal?')) deleteMut.mutate(deal._id); }} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditDeal(null); }} title={editDeal ? 'Edit Deal' : 'Create New Deal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Deal Title</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="glass-input w-full" placeholder="e.g. Enterprise Software License" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Value ($)</label>
              <input type="number" required min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="glass-input w-full" placeholder="50000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Probability (%)</label>
              <input type="number" required min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} className="glass-input w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Stage</label>
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="glass-input w-full cursor-pointer">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Assign Owner</label>
            <select value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className="glass-input w-full cursor-pointer">
              <option value="">Select owner...</option>
              {(reps || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditDeal(null); }} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) ? 'Saving...' : editDeal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DealsPage;
