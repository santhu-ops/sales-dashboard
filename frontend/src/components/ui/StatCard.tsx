import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  accentColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'from-brand-500 to-brand-700'
}) => {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="glass-card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={14} className="text-emerald-400" />
          ) : (
            <TrendingDown size={14} className="text-rose-400" />
          )}
          <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
