import React from 'react';
import { DealStage } from '../../types';

const stageConfig: Record<DealStage, { bg: string; text: string; dot: string }> = {
  Lead:         { bg: 'bg-slate-800',   text: 'text-slate-300', dot: 'bg-slate-400' },
  Qualified:    { bg: 'bg-blue-950',    text: 'text-blue-300',  dot: 'bg-blue-400' },
  Proposal:     { bg: 'bg-violet-950',  text: 'text-violet-300',dot: 'bg-violet-400' },
  Negotiation:  { bg: 'bg-amber-950',   text: 'text-amber-300', dot: 'bg-amber-400' },
  'Closed Won': { bg: 'bg-emerald-950', text: 'text-emerald-300',dot: 'bg-emerald-400' },
  'Closed Lost':{ bg: 'bg-rose-950',    text: 'text-rose-300',  dot: 'bg-rose-400' },
};

const alertTypeConfig: Record<string, { bg: string; text: string }> = {
  info:    { bg: 'bg-blue-950',    text: 'text-blue-300' },
  success: { bg: 'bg-emerald-950', text: 'text-emerald-300' },
  warning: { bg: 'bg-amber-950',   text: 'text-amber-300' },
  danger:  { bg: 'bg-rose-950',    text: 'text-rose-300' },
};

interface StageBadgeProps {
  stage: DealStage;
}

interface AlertBadgeProps {
  type: string;
  label: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const cfg = stageConfig[stage] || stageConfig.Lead;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {stage}
    </span>
  );
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({ type, label }) => {
  const cfg = alertTypeConfig[type] || alertTypeConfig.info;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const colors: Record<string, string> = {
    admin:   'bg-brand-900 text-brand-300',
    manager: 'bg-blue-950 text-blue-300',
    rep:     'bg-slate-800 text-slate-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || colors.rep}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};
