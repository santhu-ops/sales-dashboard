import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800/60 rounded-lg ${className}`} />
);

export const StatCardSkeleton = () => (
  <div className="glass-card p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-2 w-20" />
      </div>
      <Skeleton className="w-11 h-11 rounded-xl" />
    </div>
    <Skeleton className="h-3 w-28" />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr className="border-b border-slate-800">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-5 animate-pulse">
    <Skeleton className="h-5 w-40 mb-6" />
    <div className="flex items-end gap-3 h-48">
      {[60, 80, 45, 90, 70, 55].map((h, i) => (
        <div key={i} className="flex-1 bg-slate-800/60 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

export default Skeleton;
