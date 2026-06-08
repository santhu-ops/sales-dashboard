import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, DollarSign, Calendar, User, Activity,
  AlertCircle, RefreshCw, Clock, Edit3, Trash2
} from 'lucide-react';
import { getDealById, updateDeal, deleteDeal } from '../services/api';
import { StageBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { DealStage } from '../types';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const activityIcons: Record<string, string> = {
  deal_created: '🆕',
  stage_change: '📋',
  meeting: '📅',
  call: '📞',
  email: '✉️',
  note: '📝',
  custom: '⚡',
};

const STAGES: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const DealDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDealById(id!),
    enabled: !!id,
  });

  const updateMut = useMutation({
    mutationFn: (stage: string) => updateDeal(id!, { stage }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deal', id] }); showToast('Stage updated', 'success'); },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteDeal(id!),
    onSuccess: () => { showToast('Deal deleted', 'success'); navigate('/deals'); },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800/50 rounded-xl" />
        <div className="h-60 bg-slate-800/50 rounded-xl" />
        <div className="h-40 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load deal details.</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors cursor-pointer">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const { deal, activities } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => navigate('/deals')} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-2">
          <ArrowLeft size={14} /> Back to Deals
        </button>
      </motion.div>

      {/* Deal Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl font-extrabold text-white">{deal.title}</h1>
              <StageBadge stage={deal.stage} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <DollarSign size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Value</p>
                  <p className="text-sm font-bold text-white">{fmtCurrency(deal.value)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/10">
                  <Activity size={14} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Probability</p>
                  <p className="text-sm font-bold text-white">{deal.probability}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                  <User size={14} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Owner</p>
                  <p className="text-sm font-bold text-white">{(deal.owner as any)?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                  <Calendar size={14} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Created</p>
                  <p className="text-sm font-bold text-white">{fmtDate(deal.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (confirm('Delete this deal?')) deleteMut.mutate(); }} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stage Progression */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Stage Progression</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGES.map((stage, idx) => {
            const isActive = stage === deal.stage;
            const stageIdx = STAGES.indexOf(deal.stage);
            const isPast = idx < stageIdx;
            return (
              <React.Fragment key={stage}>
                <button
                  onClick={() => updateMut.mutate(stage)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                      : isPast
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {stage}
                </button>
                {idx < STAGES.length - 1 && (
                  <div className={`w-4 h-0.5 flex-shrink-0 ${isPast ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-brand-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Activity Timeline</h2>
          <span className="text-2xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold ml-auto">{activities?.length || 0}</span>
        </div>
        {!activities || activities.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No activities recorded for this deal yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act: any) => (
              <div key={act._id} className="flex items-start gap-3 p-3 bg-slate-950/30 border border-slate-800/30 rounded-xl hover:bg-slate-900/60 transition-colors">
                <span className="text-lg flex-shrink-0 mt-0.5">{activityIcons[act.type] || '⚡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-slate-500">{act.userId?.name || 'System'}</span>
                    <span className="text-2xs text-slate-600">•</span>
                    <span className="text-2xs text-slate-500">{fmtDateTime(act.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetailsPage;
