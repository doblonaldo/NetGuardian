import React from 'react';

export default function Card({ children, title, action, className = '' }) {
  return (
    <div className={`bg-noc-panel border border-noc-border rounded-lg p-5 shadow-sm hover:border-blue-500/30 hover:bg-noc-panel-hover transition-all flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 shrink-0">
          {title && <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
