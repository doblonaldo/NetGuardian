import React, { useState, useEffect } from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Dashboard() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValidations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/validations`);
        if (response.ok) {
          const data = await response.json();
          setValidations(Array.isArray(data) ? data : []);
        } else {
          console.error("Erro ao buscar validações");
        }
      } catch (error) {
        console.error("Falha na requisição:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchValidations();
    const interval = setInterval(fetchValidations, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1. Cards de resumo
  const uniqueDevices = new Set(validations.map(v => v.device_name || v.device || v.host)).size;
  const totalAlerts = validations.length;
  const criticalAlerts = validations.filter(v => v.severity?.toUpperCase() === 'CRITICAL').length;
  const warningAlerts = validations.filter(v => v.severity?.toUpperCase() === 'WARNING').length;

  const stats = [
    { label: 'Total de Devices', value: uniqueDevices.toString(), icon: Server, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Total de Alertas', value: totalAlerts.toString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { label: 'Críticos', value: criticalAlerts.toString(), icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    { label: 'Warnings', value: warningAlerts.toString(), icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  ];

  // 3. Indicador visual por cor
  const getSeverityStyles = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return { dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]', text: 'text-rose-500' };
      case 'WARNING': return { dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]', text: 'text-amber-500' };
      case 'INFO': return { dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]', text: 'text-blue-500' };
      default: return { dot: 'bg-slate-500', text: 'text-slate-500' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NOC Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Visão geral da rede em tempo real e validações recentes.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar Agora'}
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-slate-800/40 backdrop-blur-sm border ${stat.border} p-5 rounded-xl hover:bg-slate-800/60 transition-all group shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 min-h-[400px] flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Status da Operação</h3>
          </div>
          <div className="flex-1 border border-slate-700/50 rounded-lg bg-slate-900/30 flex items-center justify-center relative overflow-hidden group">
            {/* Abstract Background Chart Elements */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 C20,80 30,90 50,60 C70,30 80,40 100,10 L100,100 Z" fill="url(#gradient)" />
                <path d="M0,100 C20,80 30,90 50,60 C70,30 80,40 100,10" fill="none" stroke="#3b82f6" strokeWidth="1" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="text-center z-10">
              <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-300 text-lg font-medium">Monitoramento Ativo</p>
              <p className="text-slate-500 text-sm mt-1">Coletando métricas e validações...</p>
            </div>
          </div>
        </div>

        {/* 2. Lista de alertas recentes */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-semibold text-white">Alertas Recentes</h3>
            <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-2 flex-1">
            {loading && validations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Carregando alertas...</div>
            ) : validations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Nenhum alerta encontrado.</div>
            ) : (
              validations.slice(0, 10).map((alert, i) => {
                const styles = getSeverityStyles(alert.severity);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/20 hover:bg-slate-700/40 transition-colors border border-slate-700/30 hover:border-slate-600/50 cursor-pointer">
                    <div className="mt-1.5 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${styles.dot}`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5 gap-2">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {alert.device_name || alert.device || alert.host || 'Unknown Device'}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${styles.text}`}>
                          {alert.severity || 'UNKNOWN'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {alert.message || alert.description || alert.rule_name || 'No message provided'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
