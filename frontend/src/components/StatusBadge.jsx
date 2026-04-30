import React from 'react';

const severityStyles = {
  CRITICAL: 'bg-rose-500/20 text-rose-500 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse',
  WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
  INFO: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]',
  UNKNOWN: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function StatusBadge({ status, className = '' }) {
  const normalizedStatus = (status || 'UNKNOWN').toUpperCase();
  const style = severityStyles[normalizedStatus] || severityStyles.UNKNOWN;

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${style} ${className}`}>
      {normalizedStatus}
    </span>
  );
}
