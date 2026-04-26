import React from 'react';
import { Activity } from 'lucide-react';

export default function Loader({ text = 'Carregando...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center text-slate-500 p-8">
      <Activity className="w-8 h-8 animate-spin mb-4 text-blue-500" />
      <p className="text-sm font-medium text-slate-400">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center min-h-[200px]">
      {content}
    </div>
  );
}
