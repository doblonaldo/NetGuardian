import React from 'react';

export default function Card({ children, title, action, className = '' }) {
  return (
    <div className={`bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-sm flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6 shrink-0">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
