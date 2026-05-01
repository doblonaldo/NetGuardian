import React from 'react';
import { Activity, Radio, BarChart3, Clock } from 'lucide-react';
import Card from '../components/Card';

export default function Telemetry() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Telemetria (Live)</h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Conectado
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Métricas em tempo real de latência, throughput e uso de recursos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-8 min-h-[200px] border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent">
          <Activity className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Throughput Global</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">1.2 <span className="text-sm font-medium text-slate-500">Tbps</span></p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 min-h-[200px] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent">
          <Clock className="w-12 h-12 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-white">Latência Média</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">12 <span className="text-sm font-medium text-slate-500">ms</span></p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 min-h-[200px] border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
          <Radio className="w-12 h-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-white">Pacotes / s</h3>
          <p className="text-3xl font-bold text-purple-400 mt-2">45M <span className="text-sm font-medium text-slate-500">pps</span></p>
        </Card>
      </div>

      <Card title="Estatísticas de Tráfego" className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-300">Gráficos de Telemetria</p>
          <p className="text-sm mt-1">Integração com Time-Series Database em andamento...</p>
        </div>
      </Card>
    </div>
  );
}
