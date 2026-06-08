import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell, CheckCheck, AlertCircle, RefreshCw, Info,
  AlertTriangle, CheckCircle2, XCircle, BellOff
} from 'lucide-react';
import { getAlerts, markAlertRead, markAllAlertsRead } from '../services/api';
import { Alert } from '../types';
import { AlertBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

const alertIcons: Record<string, React.ReactNode> = {
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  danger: <XCircle size={16} className="text-rose-400" />,
};

const alertBorders: Record<string, string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
  success: 'border-l-emerald-500',
  danger: 'border-l-rose-500',
};

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const AlertsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  const markReadMut = useMutation({
    mutationFn: (alertId: string) => markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: () => markAllAlertsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      showToast('All alerts marked as read', 'success');
    },
  });

  const alerts = data?.alerts || [];
  const unreadCount = data?.unreadCount ?? 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load alerts.</p>
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
            <Bell size={22} className="text-brand-400" /> System Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}.` : 'All caught up! No unread alerts.'}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMut.mutate()}
              disabled={markAllMut.isPending}
              className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Strip */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <Bell size={14} className="text-brand-400" />
          <span className="text-xs font-bold text-white">{alerts.length}</span>
          <span className="text-2xs text-slate-500 font-semibold">Total</span>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs font-bold text-white">{unreadCount}</span>
          <span className="text-2xs text-slate-500 font-semibold">Unread</span>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-white">{alerts.length - unreadCount}</span>
          <span className="text-2xs text-slate-500 font-semibold">Read</span>
        </div>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-3">
          <BellOff size={40} className="text-slate-600" />
          <p className="text-sm text-slate-500 font-medium">No alerts to display.</p>
          <p className="text-xs text-slate-600">Alerts from high-value deals and system events will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert: Alert) => (
            <motion.div
              key={alert._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 bg-slate-900/40 border border-slate-800/50 border-l-2 ${alertBorders[alert.type]} rounded-xl flex items-start gap-3 hover:bg-slate-800/30 transition-all ${
                !alert.isRead ? 'bg-slate-900/60' : 'opacity-70'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{alertIcons[alert.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!alert.isRead ? 'text-white font-semibold' : 'text-slate-400'}`}>{alert.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-2xs text-slate-500">{fmtDateTime(alert.createdAt)}</span>
                  <AlertBadge type={alert.type} label={alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} />
                </div>
              </div>
              {!alert.isRead && (
                <button
                  onClick={() => markReadMut.mutate(alert._id)}
                  disabled={markReadMut.isPending}
                  className="flex-shrink-0 p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Mark as read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
