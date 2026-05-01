import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Server, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { apiService } from '../services/api';

export default function Dashboard() {
  const [validations, setValidations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Função assíncrona que o hook irá chamar a cada 30 segundos
  const fetchValidations = useCallback(async () => {
    try {
      const data = await apiService.getValidations();
      setValidations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Falha na requisição:", error);
      throw error; // Repassa para o hook capturar
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Utilizamos o hook para controlar os ciclos
  const { secondsAgo, isFetching, error, manualRefresh } = useAutoRefresh(fetchValidations, 30000);

  // 1. Cards de resumo (Memoizados)
  const { uniqueDevices, totalAlerts, criticalAlerts, warningAlerts } = useMemo(() => {
    const uniqueDevices = new Set(validations.map(v => v.device_name || v.device || v.host)).size;
    const totalAlerts = validations.length;
    const criticalAlerts = validations.filter(v => v.severity?.toUpperCase() === 'CRITICAL').length;
    const warningAlerts = validations.filter(v => v.severity?.toUpperCase() === 'WARNING').length;
    return { uniqueDevices, totalAlerts, criticalAlerts, warningAlerts };
  }, [validations]);

  const stats = [
    { label: 'Total de Devices', value: uniqueDevices.toString(), icon: Server, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total de Alertas', value: totalAlerts.toString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Críticos', value: criticalAlerts.toString(), icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Warnings', value: warningAlerts.toString(), icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  const sortedAlerts = useMemo(() => {
    const getSeverityWeight = (severity) => {
      switch (severity?.toUpperCase()) {
        case 'CRITICAL': return 3;
        case 'WARNING': return 2;
        case 'INFO': return 1;
        default: return 0;
      }
    };
    return [...validations].sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));
  }, [validations]);

  if (initialLoading) {
    return <Loader text="Carregando painel principal..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">NOC Dashboard</h1>
            {criticalAlerts > 0 && (
              <span className="bg-rose-500/20 text-rose-500 border border-rose-500/50 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-3 h-3" /> {criticalAlerts} CRÍTICOS
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Visão geral da rede em tempo real e validações recentes.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={manualRefresh}
            disabled={isFetching}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Activity className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Atualizando...' : 'Atualizar Agora'}
          </button>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Atualizado há {secondsAgo}s
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-500" />
          <p className="text-rose-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card title="Status da Operação" className="lg:col-span-2 min-h-[400px]">
          <div className="flex-1 border border-noc-border rounded-lg bg-noc-bg/50 flex items-center justify-center relative overflow-hidden group h-full">
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
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
            
            <div className="text-center z-10 flex flex-col items-center justify-center min-h-[250px]">
              {criticalAlerts > 0 ? (
                <>
                  <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-3 animate-pulse" />
                  <p className="text-rose-400 text-xl font-bold">Atenção Necessária</p>
                  <p className="text-rose-500/70 text-sm mt-1">Existem alertas críticos na rede.</p>
                </>
              ) : error ? (
                <>
                  <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-3" />
                  <p className="text-slate-300 text-xl font-bold">Falha de Conexão</p>
                  <p className="text-rose-400 text-sm mt-1">Não foi possível carregar os dados de monitoramento.</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-3 animate-pulse" />
                  <p className="text-slate-300 text-xl font-bold">Monitoramento Ativo</p>
                  <p className="text-slate-500 text-sm mt-1">Coletando métricas e validações...</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* 2. Lista de alertas recentes */}
        <Card 
          title="Alertas Recentes" 
          action={
            <span className="text-xs px-2 py-1 bg-noc-bg text-slate-300 rounded border border-noc-border flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          }
          className="max-h-[500px]"
        >
          <div className="space-y-3 overflow-y-auto pr-2 h-full">
            {isFetching && validations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm flex justify-center"><Activity className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : validations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Nenhum alerta encontrado.</div>
            ) : (
              sortedAlerts.slice(0, 10).map((alert, i) => {
                const isCritical = alert.severity?.toUpperCase() === 'CRITICAL';
                return (
                  <div 
                    key={i} 
                    onClick={() => navigate(alert.device_id ? `/devices/${alert.device_id}` : '#')}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors border cursor-pointer ${isCritical ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' : 'bg-noc-bg/50 border-transparent hover:border-noc-border hover:bg-noc-border/50'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className={`text-sm font-medium truncate ${isCritical ? 'text-rose-100' : 'text-slate-200'}`}>
                          {alert.device_name || alert.device || alert.host || 'Unknown Device'}
                        </p>
                        <StatusBadge status={alert.severity} className="shrink-0" />
                      </div>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isCritical ? 'text-rose-200/70' : 'text-slate-400'}`}>
                        {alert.message || alert.description || alert.rule_name || 'No message provided'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
